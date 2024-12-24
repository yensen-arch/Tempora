import dbConnect from '../../../lib/dbConnect';
import Product from '../../models/Products';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { name, minutes, cost, description, image, tags } = req.body;

  // Validate request body
  if (!name || !minutes || !cost || !image) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: name, minutes, cost, or image.',
    });
  }

  try {
    // Connect to the database
    await dbConnect();

    // Create a new product document
    const newProduct = await Product.create({
      name,
      minutes,
      cost,
      description,
      image,
      tags,
    });

    // Respond with the created product
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
}
