import { withApiAuthRequired, getAccessToken } from "@auth0/nextjs-auth0";
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

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { accessToken } = await getAccessToken(req, res);
    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized: No access token" });
    }

    await connectToDB();
    const { email, product } = req.body;
    if (!email || !product) {
      return res.status(400).json({ message: "Email and product details are required." });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ email });

    if (!cart) {
      cart = new Cart({ email, items: [] });
    }

    const existingItem = cart.items.find((item) => item.productId === product.id);
    if (existingItem) {
      return res.status(200).json({ message: "Product already exists in the cart", cart });
    }

    cart.items = [];
    cart.items.push({
      productId: product.id,
      name: product.name,
      image: product.image,
      cost: product.cost,
      minutes: product.minutes,
      quantity: 1,
    });

    await cart.save();

    res.status(200).json({ message: "Item added to cart successfully", cart });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
