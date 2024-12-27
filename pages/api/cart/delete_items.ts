import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import Cart from "../../models/Cart";

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

    // Find the cart and remove the specific item
    const result = await Cart.findOneAndUpdate(
      { email },
      { $pull: { items: { productId } } }, // Remove the item with the matching productId
      { new: true } // Return the updated document
    );

    if (!result) {
      return res.status(404).json({ error: "Cart or product not found" });
    }

    return res.status(200).json({ message: "Cart item deleted successfully", cart: result });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
