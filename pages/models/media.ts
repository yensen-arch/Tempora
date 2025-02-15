import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  email: { type: String, required: true },
  file: 
    {
      fileUrl: { type: String, required: true },
      mediaType: { type: String, enum: ["audio", "video"], required: true },
      uploadedAt: { type: Date, default: Date.now },
      duration: {type: Number},
      isConcatenated: {type: Boolean, default: false},
      audioPath: {type: String}
    }
});

export const Media = mongoose.models.Media || mongoose.model("Media", mediaSchema);
