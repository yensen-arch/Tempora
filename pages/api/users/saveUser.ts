import dbConnect from '../../../lib/dbConnect';
import User from '../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { auth0Id, email, given_name, family_name } = req.body;

  try {
    await dbConnect();

    // Check if user already exists
    let user = await User.findOne({ auth0Id });
    if (!user) {
      // Create new user
      user = await User.create({ auth0Id, email, given_name, family_name });
    }

    res.status(200).json({ message: 'User saved successfully', user });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
