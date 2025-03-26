import cloudinary from "../../../lib/cloudinary";
import { NextApiRequest, NextApiResponse } from "next";
import formidable, { Files, Fields } from "formidable";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { Media } from "../../../lib/models/media";

// Extend formidable types
interface CustomFile {
  filepath: string;
  mimetype?: string;
}

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
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
    if (!session?.user) {
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

    const [fields, files] = await new Promise<[Fields, Files]>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      }
    );

    const fileArray = files.file as CustomFile[];
    const uploadedFiles = Array.isArray(fileArray)
      ? fileArray
      : fileArray
      ? [fileArray]
      : [];

    if (uploadedFiles.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadLargeFile = (file: CustomFile) => {
      return new Promise<any>((resolve, reject) => {
        if (!file) {
          return reject(new Error("No file provided"));
        }

        const fileType = file.mimetype;

        if (
          !fileType?.startsWith("video/") &&
          !fileType?.startsWith("audio/")
        ) {
          return reject(new Error(`Unsupported file type: ${fileType}`));
        }

        const resourceType = "video";

        const uploadOptions: any = {
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

        cloudinary.uploader.upload_large(
          file.filepath,
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error("Upload failed:", error);
              reject(error);
            } else {
              console.log("Upload completed successfully:", result);
              resolve(result);
            }
          }
        );
      });
    };

    const uploadPromises = uploadedFiles.map(uploadLargeFile);
    const uploadResults = await Promise.all(uploadPromises);

    if (uploadResults.length === 0) {
      return res.status(400).json({ error: "Failed to upload any files" });
    }

    const fileUrls = uploadResults.map((result) => result.secure_url);
    const firstUploadResult = uploadResults[0];

    if (!firstUploadResult || !firstUploadResult.public_id) {
      return res
        .status(500)
        .json({ error: "Failed to get valid upload result from Cloudinary" });
    }

    const publicId = firstUploadResult.public_id;
    console.log("Public ID:", publicId);

    let videoDuration = 0;
    try {
      const videoResource = await cloudinary.api.resource(publicId, {
        resource_type: "video",
        media_metadata: true,
      });
      videoDuration = videoResource.duration || 0;
      console.log("Video duration:", videoDuration);
    } catch (error) {
      console.error("Error getting video resource:", error);
    }

    let audioResult: any;
    try {
      audioResult = await cloudinary.uploader.upload(
        firstUploadResult.secure_url,
        {
          resource_type: "video",
          format: "mp3",
          transformation: [
            { resource_type: "video", format: "mp3", audio_codec: "mp3" },
          ],
        }
      );
      console.log("Audio extraction result:", audioResult);
    } catch (error) {
      console.error("Error extracting audio:", error);
    }

    await Media.findOneAndUpdate(
      { email },
      {
        $set: {
          file: {
            fileUrl: firstUploadResult.secure_url,
            mediaType: "video",
            duration: videoDuration,
            audioPath: audioResult?.secure_url || null,
            isConcatenated: false,
            uploadedAt: new Date(),
          },
          editHistory: [],
        },
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      fileUrls,
      duration: videoDuration,
      audioPath: audioResult?.secure_url || null,
    });
  } catch (error) {
    console.error("Error processing files:", error);
    return res.status(500).json({
      error: "Failed to process files",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
