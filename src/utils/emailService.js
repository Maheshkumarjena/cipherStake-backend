import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    if (process.env.EMAIL_SERVICE === 'brevo') {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }
  }

  async sendWelcomeEmail(email, position) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email service not configured. Skipping welcome email.');
      return;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Welcome to CipherStakes! 🎉</h2>
        <p>Thank you for joining our waitlist. You're one step closer to unlocking exclusive yields on Solana.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #334155; margin-top: 0;">Your Waitlist Position: <strong>#${position}</strong></h3>
          <p style="color: #64748b; margin-bottom: 0;">
            We'll notify you as soon as we launch. Stay tuned for updates!
          </p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px;">
            <strong>What's next?</strong><br/>
            - Follow us on Twitter for updates<br/>
            - Join our Telegram community<br/>
            - Get ready to stake your claim!
          </p>
        </div>

        <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;

    const mailOptions = {
      to: email,
      subject: 'Welcome to CipherStakes Waitlist!',
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to: ${email}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }
}

export const emailService = new EmailService();
