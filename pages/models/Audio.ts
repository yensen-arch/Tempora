import mongoose from "mongoose";

const audioSchema = new mongoose.Schema({
  email: { type: String, required: true },
  audioUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export const Audio = mongoose.models.Audio || mongoose.model("Audio", audioSchema);
