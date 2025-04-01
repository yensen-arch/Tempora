import mongoose, { Schema, Document } from "mongoose";

export interface IReferral extends Document {
  code: string;
  discount: number;
  expiryDate: Date;
  createdAt: Date;
  usedBy: string[];
  active: boolean;
  maxUses: number | null;
}

const ReferralSchema: Schema = new Schema(
  {
    code: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      uppercase: true
    },
    discount: { 
      type: Number, 
      required: true,
      min: 0 
    },
    expiryDate: { 
      type: Date, 
      required: true 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    usedBy: { 
      type: [String], 
      default: []
    },
    active: {
      type: Boolean,
      default: true
    },
    maxUses: {
      type: Number,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.models.Referral || mongoose.model<IReferral>("Referral", ReferralSchema);