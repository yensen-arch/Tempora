import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  email: { type: String, required: true },
  fileUrl: { type: String, required: true },
  mediaType: { type: String, enum: ["audio", "video"], required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export const Media = mongoose.models.Media || mongoose.model("Media", mediaSchema);
