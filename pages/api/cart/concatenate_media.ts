// pages/api/media/concatenate_media.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import cloudinary from "../../../lib/cloudinary";
import { Media } from "../../models/media";

interface ConcatenateRequest {
  videoUrls: string[];
  email: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { videoUrls, email } = req.body as ConcatenateRequest;
    if (!videoUrls || !Array.isArray(videoUrls) || videoUrls.length < 2)
      return res.status(400).json({ error: 'At least two video URLs are required for concatenation' });
    if (!email)
      return res.status(400).json({ error: 'Email is required' });

    // Extract public IDs from Cloudinary URLs
    const publicIds = videoUrls.map(url => {
      const parts = url.split('/');
      const file = parts[parts.length - 1];
      const id = file.split('.')[0];
      return id.replace(/^v\d+_/, '');
    });
    console.log('Starting concatenation with public IDs:', publicIds);

    // Retrieve durations for each video resource
    const durations = await Promise.all(
      publicIds.map(async (id) => {
        const resource = await cloudinary.api.resource(id, { resource_type: "video" });
        if (!resource.duration) {
          throw new Error(`Duration not found for video with id: ${id}`);
        }
        return resource.duration;
      })
    );

    // Compute numeric start offsets for each overlay
    let cumulativeOffset = durations[0]; // first video's duration
    const overlays = publicIds.slice(1).map((id, idx) => {
      const trans = {
        overlay: { resource_type: "video", public_id: id },
        flags: "splice",
        start_offset: cumulativeOffset.toString()
      };
      cumulativeOffset += durations[idx + 1];
      return trans;
    });

    const concatenationOptions = {
      resource_type: "video",
      type: "upload",
      timeout: 240000,
      transformation: [
        { width: 640, height: 360, crop: "fill", quality: "auto:low" },
        ...overlays
      ]
    };

    console.log('Concatenation options:', JSON.stringify(concatenationOptions, null, 2));

    // Upload using the first video as base
    const concatenatedResult = await cloudinary.uploader.upload(
      videoUrls[0],
      concatenationOptions
    );
    console.log('Concatenation successful:', concatenatedResult);

    // Update database with concatenated video info
    await Media.findOneAndUpdate(
      { email },
      {
        $push: {
          files: {
            fileUrl: concatenatedResult.secure_url,
            mediaType: "video",
            originalFormat: "mp4",
            isConcatenated: true,
            originalVideos: videoUrls
          },
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      concatenatedUrl: concatenatedResult.secure_url,
      originalUrls: videoUrls
    });
  } catch (error) {
    console.error('Concatenation error:', error);
    res.status(500).json({
      error: 'Failed to concatenate videos',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
