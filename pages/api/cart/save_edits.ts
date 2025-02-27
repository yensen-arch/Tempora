import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import { Media } from "../../models/media";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await dbConnect();

    const { email, editHistory } = req.body;

    if (!email || !Array.isArray(editHistory)) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const updatedMedia = await Media.findOneAndUpdate(
      { email }, 
      { $set: { editHistory } }, 
      { new: true }
    );

    if (!updatedMedia) {
      return res.status(404).json({ message: "Media not found for the given email" });
    }

    return res.status(200).json({ message: "Edit history updated successfully", media: updatedMedia });

  } catch (error) {
    console.error("Error updating edit history:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
