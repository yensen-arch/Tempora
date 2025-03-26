import mongoose, { Schema, Document } from "mongoose";

// Define the structure for a Cart Item
interface CartItem {
  productId: string;
  name: string;
  image: string;
  cost: number;
  minutes: number;
  quantity: number; // Allows tracking the number of items for the product
}

// Define the structure for a Cart Document
export interface CartDocument extends Document {
  email: string; // To associate the cart with a user
  items: CartItem[]; // Array of items in the cart
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema for Cart Items
const CartItemSchema = new Schema<CartItem>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  cost: { type: Number, required: true },
  minutes: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
});

// Mongoose Schema for the Cart
const CartSchema = new Schema<CartDocument>(
  {
    email: { type: String, required: true },
    items: [CartItemSchema], // Embed the CartItem schema
  },
  { timestamps: true } // Automatically manage `createdAt` and `updatedAt`
);

// Export the Cart model
export default mongoose.models.Cart ||
  mongoose.model<CartDocument>("Cart", CartSchema);
