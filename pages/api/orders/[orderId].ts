import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from "../../../lib/dbConnect";
import Order from "../../../lib/models/orders";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId } = req.query;
  const { status } = req.body;
  console.log(req.body);
  console.log(status, orderId);

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  try {
    await dbConnect();

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ error: "An error occurred while updating order status" });
  }
}
