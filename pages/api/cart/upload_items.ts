import cloudinary from "../../../lib/cloudinary";
import { Media } from "../../models/media";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false, // Disable bodyParser for file handling
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form data:", err);
      return res.status(500).json({ error: "Failed to parse form data" });
    }

    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const uploadedFiles = Array.isArray(files.file) ? files.file : [files.file];

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    try {
      const fileUrls: string[] = [];

      for (const file of uploadedFiles) {
        // Directly upload the file to Cloudinary
        const result = await cloudinary.uploader.upload(file.filepath, {
          resource_type: "video", // Handles video uploads
          quality: "auto", // Compress the video
          format: "mp4", // Convert to MP4
        });

        // Save video URL and email to MongoDB
        const newMedia = new Media({
          email,
          fileUrl: result.secure_url,
          mediaType: "video", // Specify media type
        });
        await newMedia.save();

        fileUrls.push(result.secure_url);
      }

      return res.status(200).json({ fileUrls });
    } catch (error) {
      console.error("Error processing files:", error);
      return res.status(500).json({ error: "Failed to process the files" });
    }
  });
}
