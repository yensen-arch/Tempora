import { NextApiRequest, NextApiResponse } from "next";
import Cart from "../../models/Cart";
import dbConnect from "../../../lib/dbConnect";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";

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

    const cart = await Cart.findOneAndDelete({ email: userEmail });

    return res.status(200).json({ message: "Cart cleared" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Cart not cleared" });
  }
});
