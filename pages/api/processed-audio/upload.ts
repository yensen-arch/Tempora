import cloudinary from "../../../lib/cloudinary";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({
    maxFileSize: 100 * 1024 * 1024, // 100MB limit
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form data:", err);
      return res.status(500).json({ error: "Failed to parse form data" });
    }


    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!uploadedFile.mimetype || !uploadedFile.mimetype.startsWith("audio/")) {
      return res.status(400).json({ error: "Only audio files are allowed" });
    }

    try {
      console.log(`Uploading file: ${uploadedFile.originalFilename}`);

      const result = await cloudinary.uploader.upload(uploadedFile.filepath, {
        resource_type: "video",
        timeout: 240000,
        chunk_size: 10000000,
      });

      console.log("Cloudinary upload result:", result);

      res.status(200).json({ fileUrl: result.secure_url });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });
}
