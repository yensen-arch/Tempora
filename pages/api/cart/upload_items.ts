import formidable, { IncomingForm } from "formidable";
import cloudinary from "../../../lib/cloudinary";
import { Audio } from "../../models/Audio";

// Disable the default Next.js body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Initialize Formidable to parse incoming form data
    const form = new IncomingForm();
    form.uploadDir = "/tmp"; // Temp storage for uploaded files
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parsing error:", err);
        return res.status(500).json({ error: "Form parsing failed" });
      }

      // Extract email and file from the form fields and files
      const email = fields.email?.[0];
      const file = files.file?.[0]; // The uploaded video/audio file

      if (!email || !file) {
        return res.status(400).json({ error: "Email or file missing" });
      }

      // Upload the video file to Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: "video",
      });

      // Extract the audio URL by replacing the video URL path
      const audioUrl = result.secure_url.replace("/upload/", "/upload/af_audio/");

      // Save the audio URL to MongoDB (assumes Audio model exists)
      const newAudio = new Audio({ email, audioUrl });
      await newAudio.save();

      // Respond with the audio URL
      res.status(200).json({ audioUrl });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
