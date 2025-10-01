import express from 'express';
import { Waitlist } from '../models/Waitlist.js';
import { validateWaitlistEntry } from '../middleware/validation.js';
import { waitlistRateLimit } from '../middleware/rateLimit.js';
import { emailService } from '../utils/emailService.js';

const router = express.Router();

// Get waitlist stats
router.get('/stats', async (req, res) => {
  try {
    const totalCount = await Waitlist.countDocuments();
    const recentSubmissions = await Waitlist.find()
      .sort({ joinedAt: -1 })
      .limit(10)
      .select('email position joinedAt');

    res.json({
      total: totalCount,
      recentSubmissions,
    });
  } catch (error) {
    console.error('Error fetching waitlist stats:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch waitlist statistics'
    });
  }
});

// Join waitlist
router.post('/', waitlistRateLimit, validateWaitlistEntry, async (req, res) => {
  try {
    const { email, twitter, telegram, discord, referralCode } = req.body;

    // Check if email already exists
    const existingEntry = await Waitlist.findOne({ email: email.toLowerCase() });
    if (existingEntry) {
      return res.status(409).json({
        error: 'Email already registered',
        message: 'This email address is already on our waitlist',
        position: existingEntry.position
      });
    }

    // Create new waitlist entry
    const waitlistEntry = new Waitlist({
      email: email.toLowerCase(),
      twitter,
      telegram,
      discord,
      referralCode,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || 'Unknown',
    });

    await waitlistEntry.save();

    // Send welcome email (non-blocking)
    emailService.sendWelcomeEmail(email, waitlistEntry.position).catch(console.error);

    res.status(201).json({
      message: 'Successfully joined waitlist!',
      position: waitlistEntry.position,
      data: {
        email: waitlistEntry.email,
        twitter: waitlistEntry.twitter,
        telegram: waitlistEntry.telegram,
        discord: waitlistEntry.discord,
        position: waitlistEntry.position,
        joinedAt: waitlistEntry.joinedAt,
      }
    });

  } catch (error) {
    console.error('Error creating waitlist entry:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to join waitlist. Please try again.'
    });
  }
});

// Get user position by email
router.get('/position/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const entry = await Waitlist.findOne({ email: email.toLowerCase() })
      .select('email position joinedAt');

    if (!entry) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Email not found in waitlist'
      });
    }

    res.json({
      email: entry.email,
      position: entry.position,
      joinedAt: entry.joinedAt,
    });
  } catch (error) {
    console.error('Error fetching waitlist position:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch waitlist position'
    });
  }
});

export default router;
