import crypto from 'crypto';
import { UserModel, memoryUsers, IUser } from '../users/user.model.js';
import { hashPassword, comparePassword } from '../../shared/utils/hasher.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../shared/utils/jwt.js';
import { redisManager } from '../../bootstrap/redis.js';
import { emailService } from '../../integration/mailer/emailService.js';
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../../shared/errors/AppError.js';
import { ErrorCodes } from '../../shared/constants/errorCodes.js';
import { logger } from '../../shared/utils/logger.js';
import { dbManager } from '../../bootstrap/database.js';

export class AuthService {
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async findUserByEmail(email: string): Promise<any> {
    const normalized = email.toLowerCase().trim();
    if (dbManager.isUsingFallback()) {
      return memoryUsers.get(normalized) || null;
    }
    return UserModel.findOne({ email: normalized });
  }

  private async saveUser(user: any): Promise<any> {
    if (dbManager.isUsingFallback()) {
      memoryUsers.set(user.email.toLowerCase().trim(), user);
      return user;
    }
    return user.save();
  }

  public async signup(data: any): Promise<{ message: string; email: string }> {
    const existing = await this.findUserByEmail(data.email);
    if (existing) {
      throw new ConflictError('An account with this email already exists.', ErrorCodes.AUTH_EMAIL_EXISTS);
    }

    const hashedPassword = await hashPassword(data.password);
    const otp = this.generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = dbManager.isUsingFallback()
      ? {
          _id: `u-${Date.now()}`,
          name: data.name,
          email: data.email.toLowerCase().trim(),
          password: hashedPassword,
          phone: data.phone,
          farmName: data.farmName || 'Gokul Dairy Farm',
          role: data.role || 'farmer',
          isVerified: false,
          otpCode: otp,
          otpExpires,
          createdAt: new Date(),
        }
      : new UserModel({
          name: data.name,
          email: data.email.toLowerCase().trim(),
          password: hashedPassword,
          phone: data.phone,
          farmName: data.farmName || 'Gokul Dairy Farm',
          role: data.role || 'farmer',
          isVerified: false,
          otpCode: otp,
          otpExpires,
        });

    await this.saveUser(newUser);

    // Register into Bloom Filter immediately
    redisManager.bloomFilter.add(data.email);

    // Dispatch OTP email
    await emailService.sendOtpEmail(data.email, data.name, otp, 'Account Verification');

    return {
      message: 'Account registered. Please enter the 6-digit OTP sent to your email to verify.',
      email: data.email,
    };
  }

  public async verifyOtp(email: string, otp: string): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new NotFoundError('Account not found.', ErrorCodes.NOT_FOUND);
    }

    if (!user.otpCode || user.otpCode !== otp) {
      throw new BadRequestError('Invalid OTP code.', ErrorCodes.AUTH_OTP_INVALID);
    }

    if (user.otpExpires && new Date(user.otpExpires) < new Date()) {
      throw new BadRequestError('OTP code has expired. Please request a new one.', ErrorCodes.AUTH_OTP_INVALID);
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;

    const tokenPayload = {
      userId: String(user._id),
      email: user.email,
      role: user.role,
      farmName: user.farmName,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    user.refreshTokenHash = await hashPassword(refreshToken);
    await this.saveUser(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        farmName: user.farmName,
        isVerified: user.isVerified,
      },
    };
  }

  public async login(email: string, pass: string): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials.', ErrorCodes.AUTH_INVALID_CREDENTIALS);
    }

    const isMatch = await comparePassword(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials.', ErrorCodes.AUTH_INVALID_CREDENTIALS);
    }

    const tokenPayload = {
      userId: String(user._id),
      email: user.email,
      role: user.role,
      farmName: user.farmName,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    user.refreshTokenHash = await hashPassword(refreshToken);
    await this.saveUser(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        farmName: user.farmName,
        isVerified: user.isVerified,
      },
    };
  }

  public async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = verifyRefreshToken(token);
    const user = await this.findUserByEmail(payload.email);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedError('Invalid refresh session.', ErrorCodes.AUTH_REFRESH_TOKEN_INVALID);
    }

    const isValid = await comparePassword(token, user.refreshTokenHash);
    if (!isValid) {
      // Possible token reuse attack detected: invalidate refresh token hash immediately
      user.refreshTokenHash = undefined;
      await this.saveUser(user);
      throw new UnauthorizedError('Token reuse flagged. Please re-authenticate.', ErrorCodes.AUTH_REFRESH_TOKEN_INVALID);
    }

    const newPayload = {
      userId: String(user._id),
      email: user.email,
      role: user.role,
      farmName: user.farmName,
    };

    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    user.refreshTokenHash = await hashPassword(newRefreshToken);
    await this.saveUser(user);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  public async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      // Don't leak user existence
      return { message: 'If an account exists with this email, an OTP has been sent.' };
    }

    const otp = this.generateOtp();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await this.saveUser(user);

    await emailService.sendOtpEmail(user.email, user.name, otp, 'Password Reset');

    return { message: 'If an account exists with this email, an OTP has been sent.' };
  }

  public async resetPassword(email: string, otp: string, newPass: string): Promise<{ message: string }> {
    const user = await this.findUserByEmail(email);
    if (!user || !user.otpCode || user.otpCode !== otp) {
      throw new BadRequestError('Invalid or expired OTP code.', ErrorCodes.AUTH_OTP_INVALID);
    }

    if (user.otpExpires && new Date(user.otpExpires) < new Date()) {
      throw new BadRequestError('OTP has expired. Please request a new one.', ErrorCodes.AUTH_OTP_INVALID);
    }

    user.password = await hashPassword(newPass);
    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.refreshTokenHash = undefined; // clear previous sessions
    await this.saveUser(user);

    return { message: 'Password has been reset successfully. You can now login.' };
  }

  public async seedDefaultAdmin(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dairymitra.ai';
    const adminPass = process.env.ADMIN_PASSWORD || 'Admin@DairyMitra2026!';
    const adminName = process.env.ADMIN_NAME || 'Rishabh Dubey (Super Admin)';
    const adminFarm = process.env.ADMIN_FARM || 'Gokul Central AI Farm';

    // Register admin into Bloom Filter immediately
    redisManager.bloomFilter.add(adminEmail);

    const existing = await this.findUserByEmail(adminEmail);
    if (!existing) {
      const hashed = await hashPassword(adminPass);
      const adminDoc = dbManager.isUsingFallback()
        ? {
            _id: 'u-admin-1',
            name: adminName,
            email: adminEmail,
            password: hashed,
            role: 'admin',
            farmName: adminFarm,
            isVerified: true,
            createdAt: new Date(),
          }
        : new UserModel({
            name: adminName,
            email: adminEmail,
            password: hashed,
            role: 'admin',
            farmName: adminFarm,
            isVerified: true,
          });

      await this.saveUser(adminDoc);
      logger.info(`Initial Super Admin seeded: ${adminEmail} (Farm: ${adminFarm})`, 'Auth');
    }
  }
}

export const authService = new AuthService();
