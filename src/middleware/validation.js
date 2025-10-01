import validator from 'validator';
import { z } from 'zod';

// Zod schema for request validation
export const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
  twitter: z.string().optional().transform(val => val?.trim() || ''),
  telegram: z.string().optional().transform(val => val?.trim() || ''),
  discord: z.string().optional().transform(val => val?.trim() || ''),
  referralCode: z.string().optional().transform(val => val?.trim().toUpperCase() || ''),
});

export const validateWaitlistEntry = (req, res, next) => {
  try {
    // Validate request body
    const validatedData = waitlistSchema.parse(req.body);
    
    // Additional email validation
    if (!validator.isEmail(validatedData.email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }

    // Clean and format social handles
    if (validatedData.twitter && !validatedData.twitter.startsWith('@')) {
      validatedData.twitter = `@${validatedData.twitter.replace('@', '')}`;
    }
    if (validatedData.telegram && !validatedData.telegram.startsWith('@')) {
      validatedData.telegram = `@${validatedData.telegram.replace('@', '')}`;
    }

    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.errors[0]?.message || 'Invalid input data'
      });
    }
    next(error);
  }
};
