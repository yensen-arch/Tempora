// pages/api/cart/delete_media.ts
import cloudinary from "../../../lib/cloudinary";
import dbConnect from "../../../lib/dbConnect";
import { Media } from "../../models/media";

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    const { email, fileUrl, resourceType } = req.body;

    if (!email || !fileUrl || !resourceType) {
      return res.status(400).json({
        message: "Email, fileUrl, and resourceType are required.",
      });
    }

    try {
      const public_id = fileUrl.split("/").slice(-1)[0].split(".")[0];
      const validResourceTypes = ["video", "raw"];
      if (!validResourceTypes.includes(resourceType)) {
        return res.status(400).json({
          message: "Invalid resource type. Allowed values are 'video' or 'raw'.",
        });
      }

      const result = await cloudinary.uploader.destroy(public_id, {
        resource_type: resourceType,
      });
      console.log("Cloudinary deletion result:", result);
      if (result.result !== "ok") {
        return res.status(500).json({
          message: "Failed to delete file from Cloudinary.",
          cloudinaryResult: result,
        });
      }
      await dbConnect();

      const mediaRecord = await Media.findOneAndUpdate(
        { email, "files.fileUrl": fileUrl },
        { $pull: { files: { fileUrl } } },
        { new: true }
      );

      if (!mediaRecord) {
        return res.status(404).json({
          message: "Media record not found for the given email and fileUrl.",
        });
      }
      return res.status(200).json({
        message: "File deleted successfully from Cloudinary and database.",
        result,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "An error occurred while processing the request.",
        error,
      });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed. Use DELETE." });
  }
}
