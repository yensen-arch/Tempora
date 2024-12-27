import { NextApiRequest, NextApiResponse } from 'next';
import Cart from '../../models/Cart'; 

const getCartItems = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
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
};

export default getCartItems;
