export function renderOtpEmail(name: string, otp: string, purpose: string): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>DairyMitra AI Security Code</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAF7; margin: 0; padding: 20px; }
      .card { background-color: #ffffff; max-width: 500px; margin: 0 auto; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
      .header { display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; }
      .logo { font-size: 28px; }
      .brand { font-size: 18px; font-weight: bold; color: #166534; }
      .content { margin-top: 24px; color: #334155; font-size: 14px; line-height: 1.6; }
      .otp-box { background-color: #f0fdf4; border: 2px dashed #22c55e; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
      .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #166534; }
      .footer { margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <span class="logo">🐄</span>
        <span class="brand">DairyMitra AI</span>
      </div>
      <div class="content">
        <p>Namaste <strong>${name}</strong>,</p>
        <p>Your one-time verification passcode for <strong>${purpose}</strong> is:</p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        <p>This code will expire in <strong>10 minutes</strong>. For your security, do not share this passcode with anyone.</p>
        <p>If you did not request this action, please ignore this email.</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} DairyMitra AI Platform. Empowering Modern Dairy Farmers.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}
