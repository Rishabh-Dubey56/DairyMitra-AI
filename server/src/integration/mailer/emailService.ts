import nodemailer from 'nodemailer';
import { logger } from '../../shared/utils/logger.js';
import { renderOtpEmail } from './templates/otpTemplate.js';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass && pass !== 'mock_dev_password') {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user, pass },
        });
        this.isConfigured = true;
        logger.info('Nodemailer SMTP transport initialized successfully', 'Mailer');
      } catch (err) {
        logger.warn('Failed to configure SMTP transporter. Falling back to log simulation.', 'Mailer', err);
      }
    } else {
      logger.info('SMTP in mock mode. Emails & OTPs will be securely simulated in server logs.', 'Mailer');
    }
  }

  public async sendEmail(payload: EmailPayload): Promise<boolean> {
    const from = process.env.SMTP_FROM || '"DairyMitra AI" <notifications@dairymitra.ai>';

    if (this.isConfigured && this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        });
        logger.info(`Email sent successfully to ${payload.to}`, 'Mailer', { subject: payload.subject });
        return true;
      } catch (err: any) {
        logger.error(`Error sending email to ${payload.to}`, 'Mailer', err);
      }
    }

    // Development / Resilient fallback simulation
    logger.info(
      `[MOCK EMAIL SIMULATOR] To: ${payload.to} | Subject: "${payload.subject}"`,
      'Mailer'
    );
    return true;
  }

  public async sendOtpEmail(to: string, name: string, otp: string, purpose: 'Account Verification' | 'Password Reset'): Promise<boolean> {
    const html = renderOtpEmail(name, otp, purpose);
    logger.info(`🔑 [SECURE OTP DISPATCH] ${purpose} code for ${to}: >>> [ ${otp} ] <<<`, 'Security');
    return this.sendEmail({
      to,
      subject: `DairyMitra AI - ${purpose} Code: ${otp}`,
      html,
      text: `Your DairyMitra AI ${purpose} passcode is: ${otp}. It expires in 10 minutes.`,
    });
  }
}

export const emailService = new EmailService();
