import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";
import Cart from "../../models/Cart";
import dbConnect from "../../../lib/dbConnect";

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getSession(req, res);
    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized: No session found" });
    }
    const userEmail = session.user.email;
    if (!userEmail) {
      return res.status(403).json({ message: "Forbidden: No email in session" });
    }

    await dbConnect();
    const { email, product } = req.body;
    if (!email || !product) {
      return res
        .status(400)
        .json({ message: "Email and product details are required." });
    }

    if (userEmail !== email) {
      return res.status(403).json({ message: "Forbidden: Email mismatch" });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ email });

    if (!cart) {
      cart = new Cart({ email, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.productId === product.id
    );
    if (existingItem) {
      return res
        .status(200)
        .json({ message: "Product already exists in the cart", cart });
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
