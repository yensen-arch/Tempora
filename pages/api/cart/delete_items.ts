import { NextApiRequest, NextApiResponse } from "next";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import Cart from "../../models/Cart";
import dbConnect from "../../../lib/dbConnect";

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await dbConnect();
    const session = await getSession(req, res);
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized: No session found" });
    }

    const userEmail = session.user.email;
    if (!userEmail) {
      return res.status(403).json({ error: "Forbidden: No email in session" });
    }

    const { productId } = req.body;
    if (!productId || typeof productId !== "string") {
      return res.status(400).json({ error: "Valid productId is required" });
    }

    // Find the cart
    const cart = await Cart.findOne({ email: userEmail });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Check if the product exists in the cart
    const itemIndex = cart.items.findIndex((item: any) => item.productId === productId);
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
});
