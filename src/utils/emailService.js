import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_ADMIN_TEMPLATE_ID = process.env.EMAILJS_ADMIN_TEMPLATE_ID;
const EMAILJS_WELCOME_TEMPLATE_ID = process.env.EMAILJS_WELCOME_TEMPLATE_ID;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'mkjena1512@gmail.com';

if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_ADMIN_TEMPLATE_ID || !EMAILJS_WELCOME_TEMPLATE_ID) {
  console.warn('[emailService] EmailJS configuration missing. Emails will fail until configured.');
  console.warn('[emailService] Required env vars: EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_ADMIN_TEMPLATE_ID, EMAILJS_WELCOME_TEMPLATE_ID');
}

// Dynamically import the browser SDK and initialize it once.
let emailjsPromise = null;
async function getEmailJS() {
  if (!emailjsPromise) {
    // The browser SDK expects a global `location`. Provide a minimal shim for Node.
    if (typeof globalThis.location === 'undefined') {
      globalThis.location = { href: process.env.APP_ORIGIN || 'http://localhost' };
    }

    emailjsPromise = import('@emailjs/browser').then((mod) => {
      const lib = mod.default || mod;
      if (EMAILJS_PUBLIC_KEY) lib.init(EMAILJS_PUBLIC_KEY);
      return lib;
    });
  }
  return emailjsPromise;
}

/**
 * Send admin notification email when new user signs up
 * @param {Object} userData - User data object
 * @param {string} userData.email - User's email (required)
 * @param {string} userData.twitter - Twitter handle
 * @param {string} userData.telegram - Telegram handle
 * @param {string} userData.discord - Discord username
 * @param {number} userData.position - Waitlist position
 * @param {string} userData.referralCode - Referral code
 * @param {string} userData.joinedAt - Join timestamp
 */
export async function sendAdminNotification(userData = {}) {
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_ADMIN_TEMPLATE_ID) {
    throw new Error('EmailJS not configured. Set EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, and EMAILJS_ADMIN_TEMPLATE_ID in environment.');
  }

  if (!userData || !userData.email) {
    throw new Error('userData.email is required');
  }

  const templateParams = {
    to_email: ADMIN_EMAIL,
    user_email: userData.email,
    twitter: userData.twitter || 'N/A',
    telegram: userData.telegram || 'N/A',
    discord: userData.discord || 'N/A',
    position: userData.position ? `#${userData.position}` : 'N/A',
    referral_code: userData.referralCode || 'N/A',
    joined_at: userData.joinedAt ? new Date(userData.joinedAt).toLocaleString() : 'N/A'
  };

  try {
    console.log('[emailService] Sending admin notification...');
    const emailjs = await getEmailJS();
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_ADMIN_TEMPLATE_ID,
      templateParams
    );

    console.log('[emailService] ✅ Admin notification sent successfully');
    return response;
  } catch (error) {
    console.error('[emailService] ❌ Failed to send admin notification:', error);
    throw new Error(`Failed to send admin notification: ${error.message}`);
  }
}

/**
 * Send welcome email to new user after signup
 * @param {Object} userData - User data object
 * @param {string} userData.email - User's email (required)
 * @param {string} userData.name - User's name (optional)
 * @param {number} userData.position - Waitlist position
 * @param {string} userData.referralCode - User's referral code
 */
export async function sendWelcomeEmail(userData = {}) {
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_WELCOME_TEMPLATE_ID) {
    throw new Error('EmailJS not configured. Set EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, and EMAILJS_WELCOME_TEMPLATE_ID in environment.');
  }

  if (!userData || !userData.email) {
    throw new Error('userData.email is required for welcome email');
  }

  const templateParams = {
    to_email: userData.email,
    user_name: userData.name || 'there',
    position: userData.position ? `#${userData.position}` : 'N/A',
    referral_code: userData.referralCode || 'N/A'
  };

  try {
    console.log('[emailService] Sending welcome email...');
    const emailjs = await getEmailJS();
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_WELCOME_TEMPLATE_ID,
      templateParams
    );

    console.log('[emailService] ✅ Welcome email sent successfully');
    return response;
  } catch (error) {
    console.error('[emailService] ❌ Failed to send welcome email:', error);
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
}

/**
 * Send both admin notification and welcome email (common use case)
 * @param {Object} userData - User data for both emails
 */
export async function sendNewUserEmails(userData = {}) {
  if (!userData || !userData.email) {
    throw new Error('userData.email is required');
  }

  try {
    console.log('[emailService] Sending new user emails...');
    
    // Send admin notification
    await sendAdminNotification(userData);
    
    // Send welcome email to user
    await sendWelcomeEmail(userData);
    
    console.log('[emailService] ✅ All new user emails sent successfully');
    return { success: true, message: 'Admin notification and welcome email sent' };
  } catch (error) {
    console.error('[emailService] ❌ Failed to send new user emails:', error);
    throw error;
  }
}

/**
 * Test EmailJS configuration and both templates
 */
export async function testEmailJSSetup() {
  console.log('[emailService] 🧪 Testing EmailJS configuration...');
  
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID) {
    throw new Error('EmailJS basic configuration missing');
  }

  if (!EMAILJS_ADMIN_TEMPLATE_ID || !EMAILJS_WELCOME_TEMPLATE_ID) {
    throw new Error('EmailJS template IDs missing');
  }

  const testData = {
    email: 'test@example.com',
    name: 'Test User',
    twitter: '@testuser',
    telegram: '@testuser',
    discord: 'testuser#1234',
    position: 42,
    referralCode: 'TEST123',
    joinedAt: new Date().toISOString()
  };

  try {
    console.log('1. Testing admin notification template...');
    await sendAdminNotification(testData);
    
    console.log('2. Testing welcome email template...');
    await sendWelcomeEmail(testData);
    
    console.log('[emailService] ✅ All tests passed! EmailJS is configured correctly.');
    return { 
      success: true, 
      message: 'All email tests completed successfully',
      tested: ['admin_notification', 'welcome_email']
    };
  } catch (error) {
    console.error('[emailService] ❌ Test failed:', error);
    throw new Error(`EmailJS test failed: ${error.message}`);
  }
}

/**
 * Check if EmailJS is properly configured
 */
export function isEmailConfigured() {
  return !!(EMAILJS_PUBLIC_KEY && EMAILJS_SERVICE_ID && EMAILJS_ADMIN_TEMPLATE_ID && EMAILJS_WELCOME_TEMPLATE_ID);
}

export default {
  sendAdminNotification,
  sendWelcomeEmail,
  sendNewUserEmails,
  testEmailJSSetup,
  isEmailConfigured
};