// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  given_name: { type: String },
  family_name: { type: String },
  userType: { type: String, default: 'normal' },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;