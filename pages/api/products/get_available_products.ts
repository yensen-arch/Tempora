import dbConnect from '../../../lib/dbConnect';
import Product from '../../models/Products';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Connect to the database
    await dbConnect();

    // Fetch all products from the database
    const products = await Product.find({});

    // Respond with the fetched products
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
}
