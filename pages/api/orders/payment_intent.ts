import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import dbConnect from "../../../lib/dbConnect";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { user } = getSession(req, res);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await dbConnect();

  try {
    const {
      firstName,
      lastName,
      email,
      address,
      city,
      state,
      zipCode,
      contactNumber,
      products,
      totalAmount,
    } = req.body;

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), //cents
      currency: "usd",
      payment_method_types: ["card"],
      receipt_email: email,
    });
    console.log(
      firstName,
      lastName,
      email,
      address,
      city,
      state,
      zipCode,
      contactNumber,
      products,
      totalAmount
    );

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe payment error:", error);
    return res.status(500).json({ error: "Payment processing failed" });
  }
});
