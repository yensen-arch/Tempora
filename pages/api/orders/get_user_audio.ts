import { NextApiRequest, NextApiResponse } from "next";
import {
  withApiAuthRequired,
  getSession,
} from "@auth0/nextjs-auth0";
import dbConnect from "../../../lib/dbConnect";
import Order from "../../models/orders";

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await dbConnect();

    // Get user session
    const session = getSession(req, res);
    if (!session || !session.user || !session.user.email) {
      return res.status(401).json({ error: "Unauthorized: No valid session" });
    }

    const email = session.user.email;

    const order = await Order.findOne({ email }).sort({ createdAt: -1 }).lean();

    if (!order || !order.fileUrl) {
      return res.status(404).json({ error: "Media clip not found" });
    }

    return res.status(200).json({ success: true, mediaUrl: order.fileUrl });
  } catch (error) {
    console.error("Error fetching media URL:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
});
