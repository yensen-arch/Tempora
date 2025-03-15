import { NextApiRequest, NextApiResponse } from 'next';
import { withApiAuthRequired, getAccessToken } from "@auth0/nextjs-auth0";
import Cart from '../../models/Cart'; 

export default withApiAuthRequired(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { accessToken } = await getAccessToken(req, res);
    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized: No access token" });
    }

  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Invalid email' });
  }

  try {
    const cart = await Cart.findOne({ email });

    if (!cart) {
      return res.status(201).json({ message: 'Cart not found' });
    }

    return res.status(200).json(cart.items); // Return only the items in the cart
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
});
