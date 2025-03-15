import { NextApiRequest, NextApiResponse } from "next";
import { withApiAuthRequired, getAccessToken } from "@auth0/nextjs-auth0";
import { Media } from "../../models/media";

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { accessToken } = await getAccessToken(req, res);
  if (!accessToken) {
    return res.status(401).json({ message: "Unauthorized: No access token" });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const media = await Media.findOne({ email });

    if (!media || !media.file) {
      return res
        .status(404)
        .json({ error: "No files found for the given email" });
    }
    const fileDetails = { ...media.file, editHistory: media.editHistory };
    return res.status(200).json(fileDetails);
  } catch (error) {
    console.error("Error fetching media:", error);
    return res.status(500).json({ error: "Failed to fetch media" });
  }
});
