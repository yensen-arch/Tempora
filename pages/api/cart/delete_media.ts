import cloudinary from "../../../lib/cloudinary";
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { Media } from "../../../lib/models/media";

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method Not Allowed. Use DELETE." });
  }

  try {
    await dbConnect();

    const session = await getSession(req, res);
    if (!session || !session.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No session found" });
    }

    const userEmail = session.user.email;
    if (!userEmail) {
      return res
        .status(403)
        .json({ message: "Forbidden: No email in session" });
    }

    const { fileUrl, resourceType } = req.body;
    if (!fileUrl || !resourceType) {
      return res
        .status(400)
        .json({ message: "fileUrl and resourceType are required." });
    }

    const public_id = fileUrl.split("/").slice(-1)[0].split(".")[0];
    const validResourceTypes = ["video", "raw"];
    if (!validResourceTypes.includes(resourceType)) {
      return res
        .status(400)
        .json({
          message:
            "Invalid resource type. Allowed values are 'video' or 'raw'.",
        });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: resourceType,
    });
    console.log("Cloudinary deletion result:", result);
    if (result.result !== "ok") {
      return res
        .status(500)
        .json({
          message: "Failed to delete file from Cloudinary.",
          cloudinaryResult: result,
        });
    }

    // Delete media entry from database
    const deletedMedia = await Media.findOneAndDelete({
      email: userEmail,
      "file.fileUrl": fileUrl,
    });
    if (!deletedMedia) {
      return res
        .status(404)
        .json({ message: "Media entry not found in the database." });
    }

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
      .json({
        message: "An error occurred while processing the request.",
        error,
      });
  }
});
