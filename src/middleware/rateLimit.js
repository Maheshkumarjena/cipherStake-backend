import rateLimit from 'express-rate-limit';

export const waitlistRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Too many waitlist submissions from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
