import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { Media } from "../../../lib/models/media";

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await dbConnect();

    const session =await getSession(req, res);
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

    const { editHistory } = req.body;

    if (!Array.isArray(editHistory)) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const updatedMedia = await Media.findOneAndUpdate(
      { email: userEmail },
      { $set: { editHistory } },
      { new: true }
    );

    if (!updatedMedia) {
      return res
        .status(404)
        .json({ message: "Media not found for the given email" });
    }

    return res
      .status(200)
      .json({
        message: "Edit history updated successfully",
        media: updatedMedia,
      });
  } catch (error) {
    console.error("Error updating edit history:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
