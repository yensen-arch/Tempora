import mongoose from "mongoose";
import dotenv from "dotenv";

const dbConnect = async () => {
  dotenv.config();
  if (mongoose.connection.readyState >= 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }
  try {
    await mongoose.connect(uri); 
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

export default dbConnect;
