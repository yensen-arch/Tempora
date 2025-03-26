import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";
import Cart from "../../../lib/models/Cart";
import Product from "../../../lib/models/Products";
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
    const { audioDuration, email } = req.body;
    if (!audioDuration) {
      return res
        .status(400)
        .json({ message: "Audio duration is required." });
    }
    if (userEmail !== email) {
      return res.status(403).json({ message: "Forbidden: Email mismatch" });
    }
    
    let cart = await Cart.findOne({ email });
    if (!cart) {
      cart = new Cart({ email, items: [] });
    }
    
    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: "No items in cart to upgrade." });
    }
    
    const currentItem = cart.items[0];
    if (!currentItem || !currentItem.productId) {
      return res.status(400).json({ message: "Invalid item in cart." });
    }
    
    const requiredMinutes = Math.ceil(audioDuration / 60);
    
    const suitableProducts = await Product.find({ 
      minutes: { $gte: requiredMinutes },
    }).sort({ minutes: 1 });
    
    if (!suitableProducts || suitableProducts.length === 0) {
      return res.status(404).json({ 
        message: "No suitable product found for the given audio duration." 
      });
    }
    
    const newProduct = suitableProducts[0];
    
    cart.items[0] = {
      productId: newProduct._id,
      name: newProduct.name,
      cost: newProduct.cost,
      image: newProduct.image,
      minutes: newProduct.minutes,
      category: newProduct.category,
      quantity: 1
    };
    
    await cart.save();
    
    return res.status(200).json({ 
      message: "Product upgraded successfully", 
      cart: cart,
      product: newProduct
    });
  } catch (err) {
    console.error("Error upgrading product:", err);
    return res.status(500).json({ 
      message: "An error occurred while upgrading the product",
      error: err instanceof Error ? err.message : "Unknown error"
    });
  }
});