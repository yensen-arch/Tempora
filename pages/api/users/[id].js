import dbConnect from '../../../lib/dbConnect';
import User from '../../models/User';

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;
  const user = await User.findOne({ auth0Id: id });

  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({ userType: user.userType });
}
