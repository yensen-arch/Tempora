import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from "../../../lib/dbConnect";
import Order from "../../models/orders";
import { getSession } from '@auth0/nextjs-auth0';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // Get user session for authentication
  const session = await getSession(req, res);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email parameter is required" });
  }

  // Security check: ensure user can only access their own orders
  if (email !== session.user.email) {
    return res.status(403).json({ error: "Unauthorized access to orders" });
  }

  try {
    await dbConnect();

    const orders = await Order.find({ email }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({ error: "An error occurred while fetching orders" });
  }
}