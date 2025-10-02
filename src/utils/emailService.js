import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
    console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'Not set');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'Not set');
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT || 'Not set');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
        console.log('EMAIL_PASS:', process.env.EMAIL_PASS );




class EmailService {
  constructor() {
    // Always use Brevo SMTP
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    this.adminEmail = 'cipherstakes@gmail.com';
    this.fromEmail = 'mkjena1512@gmail.com';
  }

  async notifyAdminOfSubscription(userDetails) {
    if (!this.transporter) return;
    const { email, twitter, telegram, discord, referralCode, position, joinedAt } = userDetails;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Waitlist Subscription</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Twitter:</strong> ${twitter || 'N/A'}</p>
        <p><strong>Telegram:</strong> ${telegram || 'N/A'}</p>
        <p><strong>Discord:</strong> ${discord || 'N/A'}</p>
        <p><strong>Referral Code:</strong> ${referralCode || 'N/A'}</p>
        <p><strong>Position:</strong> #${position}</p>
        <p><strong>Joined At:</strong> ${joinedAt}</p>
      </div>
    `;
    const mailOptions = {
      from: this.fromEmail,
      to: this.adminEmail,
      subject: 'New Waitlist Subscription',
      html,
    };
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Admin notified of new subscription: ${email}`);
      console.log('Nodemailer response (admin):', info);
    } catch (error) {
      console.error('Failed to notify admin:', error);
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
      from: this.fromEmail,
      to: email,
      subject: 'Welcome to CipherStakes Waitlist!',
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to: ${email}`);
      console.log('Nodemailer response (user):', info);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }
}

export const emailService = new EmailService();
