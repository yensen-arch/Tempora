import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IProduct extends Document {
  minutes: number;
  cost: number;
  name: string;
  description?: string;
  image: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema<IProduct>(
  {
    minutes: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0 },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    image: { type: String, required: true },
    tags: { type: [String], default: [] },
  },
  {
    timestamps: true, // Automatically manage `createdAt` and `updatedAt`
  }
);

// Ensure the model is defined only once
const Product = models.Product || model<IProduct>('Product', ProductSchema);

export default Product;
