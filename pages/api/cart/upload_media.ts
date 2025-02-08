import cloudinary from "../../../lib/cloudinary";
import { Media } from "../../models/media";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing
    responseLimit: false, // Disable response size limit
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const form = formidable({
    multiples: true, // Allow multiple files
    maxFileSize: 100 * 1024 * 1024, // 100MB max file size
    maxFields: 10, // Max number of non-file fields
    keepExtensions: true, // Keep original file extensions
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form data:", err);
      res.status(500).json({ error: "Failed to parse form data" });
      return;
    }

    const { email } = req.query;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const uploadedFiles = Array.isArray(files.file) ? files.file : [files.file];
    if (!uploadedFiles || uploadedFiles.length === 0) {
      res.status(400).json({ error: "No files uploaded" });
      return;
    }

    try {
      const uploadPromises = uploadedFiles.map(async (file) => {
        const fileType = file.mimetype;

        // Validate file type (allow any audio or video format)
        if (
          !fileType?.startsWith("video/") &&
          !fileType?.startsWith("audio/")
        ) {
          throw new Error(`Unsupported file type: ${fileType}`);
        }

        // Use "video" as the resource type for both audio and video files
        const resourceType = "video";

        // Cloudinary upload options
        const uploadOptions = {
          resource_type: resourceType,
          timeout: 240000, // 4 min timeout
          chunk_size: 10000000, // 10MB chunk size for large files
          transformation: [
            { width: 640, height: 360, crop: "limit", quality: "auto:low" }
          ],
        };

        console.log(`Uploading file: ${file.originalFilename} (${fileType})`);

        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(
          file.filepath,
          uploadOptions
        );
        console.log("Cloudinary upload result:", result);

        // Save file URL and metadata to database
        await Media.findOneAndUpdate(
          { email },
          {
            $push: {
              files: {
                fileUrl: result.secure_url,
                mediaType: resourceType,
                originalFormat: fileType.split("/")[1], // Extract file extension
              },
            },
          },
          { upsert: true, new: true } // Create new document if it doesn't exist
        );

        return result.secure_url;
      });

      // Wait for all uploads to complete
      const fileUrls = await Promise.all(uploadPromises);
      res.status(200).json({ fileUrls });
    } catch (error) {
      console.error("Error processing files:", error);
      res.status(500).json({ error: "Failed to process files" });
    }
  });
}
