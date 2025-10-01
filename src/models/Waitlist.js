import mongoose from 'mongoose';

const WaitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  twitter: {
    type: String,
    trim: true,
  },
  telegram: {
    type: String,
    trim: true,
  },
  discord: {
    type: String,
    trim: true,
  },
  referralCode: {
    type: String,
    trim: true,
    uppercase: true,
  },
  position: {
    type: Number,
    default: 0,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-increment position
WaitlistSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('Waitlist').countDocuments();
    this.position = count + 1;
  }
  next();
});

// Index for better query performance
WaitlistSchema.index({ email: 1 });
WaitlistSchema.index({ joinedAt: -1 });
WaitlistSchema.index({ position: 1 });

export const Waitlist = mongoose.model('Waitlist', WaitlistSchema);
