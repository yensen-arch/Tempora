import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import Cart from "../../models/Cart";

const connectToDB = async () => {
  if (mongoose.connections[0].readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectToDB();

    const { email, product } = req.body;

    if (!email || !product) {
      return res.status(400).json({ message: "email and product details are required." });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ email });

    if (!cart) {
      // Create a new cart if it doesn't exist
      cart = new Cart({ email, items: [] });
    }

    // Check if the product already exists in the cart
    const existingItem = cart.items.find((item) => item.productId === product.id);

    if (existingItem) {
      // If the product already exists, return without making changes
      return res.status(200).json({ message: "Product already exists in the cart", cart });
    }

    cart.items = [];
    cart.items.push({
      productId: product.id,
      name: product.name,
      image: product.image,
      cost: product.cost,
      minutes: product.minutes,
      quantity: 1, // Default quantity
    });

    await cart.save();

    res.status(200).json({ message: "Item added to cart successfully", cart });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
