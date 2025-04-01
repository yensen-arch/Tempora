import mongoose, { Schema, Document } from "mongoose";

// Define the structure of an Order
export interface IOrder extends Document {
  fileUrl: string;
  name: string;
  address: string;
  email: string;
  contactNumber: string;
  city: string;
  state: string;
  zipcode: string;
  totalAmount: number;
  createdAt: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered'; // Add the status field here
}

const OrderSchema: Schema = new Schema(
  {
    fileUrl: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: { type: String, required: true },
    city: { type: String, required: true },
    promotionConsent: { type: Boolean, required: true, default: false },
    state: { type: String, required: true },
    zipcode: { type: String, required: true },
    products: { type: Array, required: true },
    referralCode: { type: String, required: true, default: "none" },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], // Enum of possible statuses
      default: 'pending', // Default status is 'pending'
      required: true
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
