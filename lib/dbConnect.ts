import mongoose from 'mongoose';
import dotenv from "dotenv";

const dbConnect = async () => {
    console.log("heres the env var", process.env.MONGODB_URI)
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

export default dbConnect;
