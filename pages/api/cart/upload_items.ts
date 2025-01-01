import cloudinary from "../../../lib/cloudinary";
import { Media } from "../../models/media";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
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
        // Validate MIME type for video and audio
        const fileType = file.mimetype;
        if (!fileType.startsWith("video/") && !fileType.startsWith("audio/")) {
          return res
            .status(400)
            .json({ error: `Unsupported file type: ${fileType}` });
        }

        const resourceType = fileType.startsWith("audio/") ? "audio" : "video";

        const result = await cloudinary.uploader.upload(file.filepath, {
          resource_type: resourceType, 
          quality: "50", 
          bitrate: "500k",
          fps: "20",
          format: resourceType === "audio" ? "mp3" : "mp4",
        });

        fileUrls.push(result.secure_url);

        await Media.findOneAndUpdate(
          { email },
          {
            $push: {
              files: {
                fileUrl: result.secure_url,
                mediaType: resourceType,
              },
            },
          },
          { upsert: true, new: true }
        );
      }

      return res.status(200).json({ fileUrls });
    } catch (error) {
      console.error("Error processing files:", error);
      return res.status(500).json({ error: "Failed to process the files" });
    }
  });
}
