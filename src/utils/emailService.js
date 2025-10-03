import emailjs from '@emailjs/browser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'mkjena1512@gmail.com';

if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
  console.warn('[emailService] EmailJS configuration missing. Emails will fail until configured.');
}

// Initialize EmailJS
if (EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

/**
 * Send admin notification email using EmailJS
 * @param {Object} userData - User data object
 * @param {string} userData.email - User's email
 * @param {string} userData.twitter - Twitter handle
 * @param {string} userData.telegram - Telegram handle
 * @param {string} userData.discord - Discord username
 * @param {number} userData.position - Waitlist position
 * @param {string} userData.referralCode - Referral code
 * @param {string} userData.joinedAt - Join timestamp
 */
export async function sendAdminNotification(userData = {}) {
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
    throw new Error('EmailJS not configured. Set EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, and EMAILJS_TEMPLATE_ID in environment.');
  }

  if (!userData || !userData.email) {
    throw new Error('userData.email is required');
  }

  const templateParams = {
    to_email: ADMIN_EMAIL,
    subject: `New Waitlist Signup: ${userData.email}`,
    user_email: userData.email,
    twitter: userData.twitter || 'N/A',
    telegram: userData.telegram || 'N/A',
    discord: userData.discord || 'N/A',
    position: userData.position ? `#${userData.position}` : 'N/A',
    referral_code: userData.referralCode || 'N/A',
    joined_at: userData.joinedAt ? new Date(userData.joinedAt).toLocaleString() : 'N/A',
    admin_email: ADMIN_EMAIL
  };

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );
    
    console.log('[emailService] Admin notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('[emailService] Failed to send admin notification:', error);
    throw error;
  }
}

/**
 * Send welcome email to user using EmailJS
 * @param {Object} userData - User data object
 * @param {string} userData.email - User's email
 * @param {string} userData.name - User's name (optional)
 * @param {number} userData.position - Waitlist position
 * @param {string} userData.referralCode - User's referral code
 */
export async function sendWelcomeEmail(userData = {}) {
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID) {
    throw new Error('EmailJS not configured properly.');
  }

  if (!userData || !userData.email) {
    throw new Error('userData.email is required for welcome email');
  }

  const templateParams = {
    to_email: userData.email,
    user_name: userData.name || 'there',
    user_email: userData.email,
    position: userData.position ? `#${userData.position}` : 'N/A',
    referral_code: userData.referralCode || 'N/A',
    admin_email: ADMIN_EMAIL
  };

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      'welcome_template', // You'll need to create this template in EmailJS
      templateParams
    );
    
    console.log('[emailService] Welcome email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('[emailService] Failed to send welcome email:', error);
    throw error;
  }
}

/**
 * Send generic email using EmailJS
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message/content
 * @param {string} options.templateId - EmailJS template ID
 * @param {Object} options.templateParams - Additional template parameters
 */
export async function sendEmail(options = {}) {
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID) {
    throw new Error('EmailJS not configured properly.');
  }

  const { to, subject, message, templateId, templateParams = {} } = options;

  if (!to || !templateId) {
    throw new Error('Recipient email and template ID are required');
  }

  const params = {
    to_email: to,
    subject: subject || 'No Subject',
    message: message || '',
    ...templateParams
  };

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      templateId,
      params
    );
    
    console.log('[emailService] Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('[emailService] Failed to send email:', error);
    throw error;
  }
}

/**
 * Test function to verify EmailJS configuration
 */
export async function testEmailJSSetup() {
  const testData = {
    email: ADMIN_EMAIL,
    twitter: '@testuser',
    telegram: '@testuser',
    discord: 'testuser#1234',
    position: 999,
    referralCode: 'TEST123',
    joinedAt: new Date().toISOString()
  };

  console.log('[emailService] Testing EmailJS configuration...');
  
  try {
    const result = await sendAdminNotification(testData);
    console.log('[emailService] Test email sent successfully!');
    return result;
  } catch (error) {
    console.error('[emailService] Test failed:', error);
    throw error;
  }
}

export default {
  sendAdminNotification,
  sendWelcomeEmail,
  sendEmail,
  testEmailJSSetup
};