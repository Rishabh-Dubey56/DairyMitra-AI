import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { authRateLimiter } from '../../shared/middleware/rateLimiter.js';
import { bloomFilterAuthGuard } from '../../shared/middleware/bloomFilter.js';
import { authGuard } from '../../shared/middleware/authGuard.js';
import {
  signupSchema,
  verifyOtpSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schemas.js';

const router = Router();

// Apply auth rate limiter across public auth endpoints
router.post('/signup', authRateLimiter, validate({ body: signupSchema }), authController.signup);

router.post('/verify-otp', authRateLimiter, validate({ body: verifyOtpSchema }), authController.verifyOtp);

router.post(
  '/login',
  authRateLimiter,
  validate({ body: loginSchema }),
  bloomFilterAuthGuard, // Fast Bloom filter rejection before bcrypt / DB
  authController.login
);

router.post('/refresh-token', validate({ body: refreshTokenSchema }), authController.refreshToken);

router.post('/logout', authController.logout);

router.post(
  '/forgot-password',
  authRateLimiter,
  validate({ body: forgotPasswordSchema }),
  bloomFilterAuthGuard,
  authController.forgotPassword
);

router.post('/reset-password', authRateLimiter, validate({ body: resetPasswordSchema }), authController.resetPassword);

router.get('/me', authGuard, authController.getProfile);

export const authRoutes = router;
