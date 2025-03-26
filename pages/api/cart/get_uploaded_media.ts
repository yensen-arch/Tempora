import { NextApiRequest, NextApiResponse } from "next";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { Media } from "../../../lib/models/media";

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getSession(req, res);
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

    const media = await Media.findOne({ email: userEmail });

    if (!media || !media.file) {
      return res.status(404).json({ error: "No files found for this user" });
    }

    const fileDetails = { ...media.file, editHistory: media.editHistory };
    console.log("Media found:", fileDetails);
    return res.status(200).json(fileDetails);
  } catch (error) {
    console.error("Error fetching media:", error);
    return res.status(500).json({ error: "Failed to fetch media" });
  }
});
