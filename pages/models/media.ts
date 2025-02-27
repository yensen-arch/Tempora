import mongoose from "mongoose";
import { editSchema } from "./editSchema"; // Import the schema, NOT the model

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
    },
  editHistory: {type: [editSchema], default: []}
});

export const Media = mongoose.models.Media || mongoose.model("Media", mediaSchema);
