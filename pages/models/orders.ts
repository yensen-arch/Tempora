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
}

const OrderSchema: Schema = new Schema(
  {
    fileUrl: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipcode: { type: String, required: true },
    products: { type: Array, required: true },
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

// Export the model, ensuring it doesn't get redefined if already present
export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
