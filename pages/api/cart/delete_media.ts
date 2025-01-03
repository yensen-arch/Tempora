import cloudinary from '../../../lib/cloudinary';
import dbConnect from '../../../lib/dbConnect';
import { Media } from '../../models/media';

export default async function handler(req, res) {
    if (req.method === "DELETE") {
      const { email, fileUrl } = req.body;
  
      if (!email || !fileUrl) {
        return res
          .status(400)
          .json({ message: "Email and fileUrl are required." });
      }
  
      try {
        // Step 1: Extract public ID from the file URL
        const public_id = fileUrl.split("/").slice(-1)[0].split(".")[0];
  console.log(public_id)
        // Step 2: Delete file from Cloudinary
        const result = await cloudinary.uploader.destroy(public_id);
  console.log(result)
        if (result.result !== "ok") {
          return res
            .status(500)
            .json({ message: "Failed to delete file from Cloudinary." });
        }
  
        // Step 3: Connect to the database
        await dbConnect();
  
        // Step 4: Remove file from the database for the user
        const mediaRecord = await Media.findOneAndUpdate(
          { email, "files.fileUrl": fileUrl },
          { $pull: { files: { fileUrl } } },
          { new: true }
        );
  
        if (!mediaRecord) {
          return res
            .status(404)
            .json({ message: "Media record not found for the given email and fileUrl." });
        }
  
        // Success response
        return res
          .status(200)
          .json({
            message: "File deleted successfully from Cloudinary and database.",
            result,
          });
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ message: "An error occurred while processing the request.", error });
      }
    } else {
      res.status(405).json({ message: "Method Not Allowed. Use DELETE." });
    }
  }
