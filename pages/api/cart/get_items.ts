import { NextApiRequest, NextApiResponse } from "next";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import Cart from "../../models/Cart";

export default withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
      const session = await getSession(req, res);
      if (!session || !session.user) {
        return res
          .status(401)
          .json({ message: "Unauthorized: No session found" });
      }

      const userEmail = session.user.email;
      if (!userEmail) {
        return res
          .status(403)
          .json({ message: "Forbidden: No email in session" });
      }

      const cart = await Cart.findOne({ email: userEmail });

      if (!cart) {
        return res.status(201).json({ message: "Cart not found" });
      }

      return res.status(200).json(cart.items); // Return only the items in the cart
    } catch (error) {
      console.error("Error fetching cart:", error);
      return res.status(500).json({ message: "Server error", error });
    }
  }
);
