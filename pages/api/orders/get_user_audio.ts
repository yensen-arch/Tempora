import { NextApiRequest, NextApiResponse } from "next";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import dbConnect from "../../../lib/dbConnect";
import Order from "../../../lib/models/orders";

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
    const session = await getSession(req, res);
    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized: No valid session" });
    }

    const email = session.user.email;
    const orders = await Order.find({ email }).sort({ createdAt: -1 }).lean();

    if (!orders || orders.length === 0) {
      throw new Error("No orders found");
    }

    // Extract file URLs
    const mediaUrls = orders
      .map((order) => order.fileUrl)
      .filter((fileUrl): fileUrl is string => typeof fileUrl === "string");

    if (mediaUrls.length === 0) {
      throw new Error("No valid file URLs found");
    }

    return res.status(200).json({ success: true, mediaUrls });
  } catch (error) {
    console.error("Error fetching media URLs:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
});
