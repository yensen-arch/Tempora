import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import Order from "../../models/orders";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await dbConnect();
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const order = await Order.findOne({ email }).sort({ createdAt: -1 }).lean();

    if (!order || !order.fileUrl) {
      return res.status(404).json({ error: "Media clip not found" });
    }

    return res.status(200).json({ success: true, mediaUrl: order.fileUrl });

  } catch (error) {
    console.error("Error fetching media URL:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
