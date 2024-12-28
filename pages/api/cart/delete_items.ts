import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import Cart from "../../models/Cart";
import { em } from "framer-motion/client";

const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return; // Already connected
  }
  await mongoose.connect(process.env.MONGODB_URI as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow DELETE requests
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();
    const { email, productId } = req.body;
    // Validate email and productId
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Valid email is required" });
    }
    if (!productId || typeof productId !== "string") {
      return res.status(400).json({ error: "Valid productId is required" });
    }

    // Find the cart
    const cart = await Cart.findOne({ email });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Check if the product exists in the cart
    const itemIndex = cart.items.findIndex((item) => item.productId === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ error: "Product not found in the cart" });
    }

    // Remove the product
    cart.items.splice(itemIndex, 1);
    await cart.save();

    return res.status(200).json({ message: "Cart item deleted successfully", cart });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
