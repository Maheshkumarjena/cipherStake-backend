import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    console.log("mongodb",process.env.MONGODB_URI)
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    // console.log(conn)
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};
