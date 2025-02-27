import mongoose from "mongoose";

export const editSchema = new mongoose.Schema({
  start: { type: Number, required: true },
  end: { type: Number, required: true },
  type: { type: String, enum: ["trim", "splice"], required: true }
});

// No need to export `Edit` model if it's only used as a subdocument
