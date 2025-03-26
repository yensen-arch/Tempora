import dbConnect from "../../../lib/dbConnect";
import { NextApiRequest, NextApiResponse } from "next";
import User from "../../../lib/models/User";

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { auth0Id, email, given_name, family_name } = req.body;

  try {
    await dbConnect();

    // Check if user already exists
    const user = await User.findOneAndUpdate(
      { auth0Id }, // Find by auth0Id
      { email, given_name, family_name }, // Update these fields
      { 
        new: true, // Return the updated document
        upsert: true // Create if doesn't exist
      }
    );

    res.status(200).json({ message: "User saved successfully", user });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
