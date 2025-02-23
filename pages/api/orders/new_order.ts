import { NextApiRequest, NextApiResponse } from "next";
import { getIronSession, IronSession } from "iron-session";
import dbConnect from "../../../lib/dbConnect";
import Order from "../../models/orders";
import { sessionOptions, SessionData } from "../../../lib/sessionConfig";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await dbConnect();

  const session: IronSession<SessionData> = await getIronSession<SessionData>(req, res, sessionOptions);
  console.log(session);

  if (!session.fileUrl) {
    return res.status(400).json({ error: "No uploaded file found in session" });
  }

  try {
    const { firstName, lastName, email, address, city, state, zipCode, contactNumber, products } = req.body;

    if (!firstName || !lastName || !email || !address || !city || !state || !zipCode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const totalAmount = parseFloat(req.body.totalAmount);

    const newOrder = new Order({
      fileUrl: session.fileUrl,
      name: `${firstName} ${lastName}`,
      email,
      address,
      city,
      state,
      zipcode: zipCode,
      products,
      contactNumber: contactNumber || "N/A",
      totalAmount,
    });

    await newOrder.save();
    console.log(newOrder);

    session.fileUrl = undefined;
    await session.save();

    return res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
