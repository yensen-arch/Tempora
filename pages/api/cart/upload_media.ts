import cloudinary from "../../../lib/cloudinary";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { Media } from "../../models/media";

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing
    responseLimit: false, // Disable response size limit
  },
};

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

    const email = session.user.email;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const form = formidable({
      multiples: true,
      maxFileSize: 1000 * 1024 * 1024,
      maxTotalFileSize: 5000 * 1024 * 1024,
      maxFields: 10,
      keepExtensions: true,
    });

    // Convert form parsing to Promise to avoid callback issues
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const uploadedFiles = Array.isArray(files.file) ? files.file : [files.file];
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadPromises = uploadedFiles.map(async (file) => {
      const fileType = file.mimetype;

      // Validate file type
      if (!fileType?.startsWith("video/") && !fileType?.startsWith("audio/")) {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Use "video" as the resource type for both audio and video files
      const resourceType = "video";

      // Cloudinary upload options
      const uploadOptions = {
        resource_type: resourceType,
        timeout: 240000,
        chunk_size: 10000000,
        transformation: [
          {
            width: 480,
            height: 270,
            crop: "fill",
            quality: "auto:low",
            bitrate: "500k",
            fps: "24",
          },
        ],
      };

      // Upload file to Cloudinary
      const result = await cloudinary.uploader.upload(
        file.filepath,
        uploadOptions
      );
      return result.secure_url;
    });

    // Wait for all uploads to complete
    const fileUrls = await Promise.all(uploadPromises);

    await Media.findOneAndUpdate(
      { email },
      {
        $set: {
          file: {
            fileUrl: fileUrls[0],
            mediaType: "video",
            duration: fileUrls[0].duration,
            audioPath: fileUrls[0].secure_url,
            isConcatenated: true,
            uploadedAt: new Date(), // Ensures uploadedAt is updated
          },
          editHistory: [],
        },
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({ fileUrls });
  } catch (error) {
    console.error("Error processing files:", error);
    return res.status(500).json({
      error: "Failed to process files",
      message: error.message || "Unknown error",
    });
  }
});
