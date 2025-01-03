import { NextApiRequest, NextApiResponse } from "next";
import { Media } from "../../models/media";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const media = await Media.findOne({ email });

    if (!media || !media.files || media.files.length === 0) {
      return res.status(404).json({ error: "No files found for the given email" });
    }

    const fileUrls = media.files.map((file) => file.fileUrl);

    return res.status(200).json({ fileUrls });
  } catch (error) {
    console.error("Error fetching media:", error);
    return res.status(500).json({ error: "Failed to fetch media" });
  }
}
