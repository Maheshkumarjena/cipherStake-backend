import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

class EmailService {
  constructor() {
    this.initialized = false;
    this.transporter = null;
    this.adminEmail = process.env.ADMIN_EMAIL || 'cipherstakes@gmail.com';
    this.fromEmail = process.env.EMAIL_FROM || 'mkjena1512@gmail.com';
    
  // Log environment variables for debugging
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'Not set');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Validate required environment variables
      const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'];
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        console.warn(`Email service disabled - Missing environment variables: ${missingVars.join(', ')}`);
        this.initialized = false;
        return;
      }

      console.log('🔧 Initializing email transporter...');
      
      // Render-specific SMTP configuration
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false, // MUST be false for port 587
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        // CRITICAL: Connection settings for cloud deployment
        connectionTimeout: 30000, // 30 seconds
        greetingTimeout: 30000,
        socketTimeout: 30000,
        // Render network specific settings
        tls: {
          rejectUnauthorized: false, // Bypass certificate validation issues
          ciphers: 'SSLv3'
        },
        // Pooling for better performance
        pool: true,
        maxConnections: 1,
        maxMessages: 10,
        // Debugging
        debug: process.env.NODE_ENV === 'development',
        logger: process.env.NODE_ENV === 'development'
      });

      await this.verifyConnection();
      
    } catch (error) {
      console.error('❌ Failed to initialize email transporter:', error);
      this.initialized = false;
    }
  }

  async verifyConnection() {
    if (!this.transporter) {
      console.log('No transporter available for verification');
      return;
    }

    try {
      console.log('🔍 Verifying SMTP connection...');
      await this.transporter.verify();
      this.initialized = true;
      console.log('✅ SMTP connection verified successfully');
    } catch (error) {
      console.error('❌ SMTP connection failed:', error);
      console.log('🔧 Connection details:');
      console.log('   Host:', process.env.EMAIL_HOST);
      console.log('   Port:', process.env.EMAIL_PORT || '587');
      console.log('   User:', process.env.EMAIL_USER);
      console.log('   Pass:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'Not set');
      this.initialized = false;
    }
  }

  async sendEmailWithRetry(mailOptions, retries = 3) {
    if (!this.initialized) {
      console.warn('Email service not initialized');
      return { success: false, error: 'Service not initialized' };
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`📧 Sending email attempt ${attempt}/${retries}...`);
        const info = await this.transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully');
        return { success: true, messageId: info.messageId };
      } catch (error) {
        console.error(`❌ Email send attempt ${attempt} failed:`, error.message);
        
        if (attempt === retries) {
          return { success: false, error: error.message };
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async notifyAdminOfSubscription(userDetails) {
    const { email, twitter, telegram, discord, referralCode, position, joinedAt } = userDetails;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">New Waitlist Subscription 🎉</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Twitter:</strong> ${twitter || 'N/A'}</p>
          <p><strong>Telegram:</strong> ${telegram || 'N/A'}</p>
          <p><strong>Discord:</strong> ${discord || 'N/A'}</p>
          <p><strong>Referral Code:</strong> ${referralCode || 'N/A'}</p>
          <p><strong>Position:</strong> #${position}</p>
          <p><strong>Joined At:</strong> ${new Date(joinedAt).toLocaleString()}</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `CipherStakes <${this.fromEmail}>`,
      to: this.adminEmail,
      subject: `New Waitlist Subscription - Position #${position}`,
      html: html,
      text: `New waitlist subscription from ${email}`
    };

    return await this.sendEmailWithRetry(mailOptions);
  }

  async sendWelcomeEmail(email, position) {
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
      </div>
    `;

    const mailOptions = {
      from: `CipherStakes <${this.fromEmail}>`,
      to: email,
      subject: 'Welcome to CipherStakes Waitlist!',
      html: html,
      text: `Welcome to CipherStakes! Your waitlist position is #${position}`
    };

    return await this.sendEmailWithRetry(mailOptions);
  }

  // Method to check service status
  getStatus() {
    return {
      initialized: this.initialized,
      fromEmail: this.fromEmail,
      adminEmail: this.adminEmail,
      hasCredentials: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || '587'
    };
  }

  // Method to manually reinitialize if needed
  async reinitialize() {
    console.log('🔄 Reinitializing email service...');
    await this.initializeTransporter();
    return this.initialized;
  }
}

export const emailService = new EmailService();