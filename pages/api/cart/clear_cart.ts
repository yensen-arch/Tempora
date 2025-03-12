import { NextApiRequest, NextApiResponse } from "next";
import Cart from "../../models/Cart";
import dbConnect from "../../../lib/dbConnect";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow DELETE requests
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try{
    await dbConnect();
    const {email} = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Valid email is required" });
    }
    const cart = await Cart.findOneAndDelete({ email });

    return res.status(200).json({message: "Cart cleared"});

  }catch(err){
    console.error(err);
    return res.status(500).json({message: "cart not cleared"});
  }
}
