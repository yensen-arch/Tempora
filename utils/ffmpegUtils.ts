"use client";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export const processVideo = async (videoUrl: string, edits: any) => {
  // Create FFmpeg instance with the new API
  const ffmpeg = new FFmpeg();
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd';

  // Load FFmpeg with the new method
  if (!ffmpeg.loaded) {
    try {
      // Load the core and required files from CDN
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
    } catch (error) {
      console.error("Error loading FFmpeg:", error);
      return null;
    }
  }

  try {
    // Fetch video file
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Error fetching video: ${response.status} ${response.statusText}`);
    }
    const videoBlob = await response.blob();
    const videoName = "input.mp4";
    const arrayBuffer = await videoBlob.arrayBuffer();

    // Write file using the new API
    await ffmpeg.writeFile(videoName, new Uint8Array(arrayBuffer));

    let filterComplex = "";
    let streamCount = edits.length;

    // Create individual trimmed segments
    edits.forEach((edit, index) => {
      filterComplex += 
        `[0:v]trim=start=${edit.start}:end=${edit.end},setpts=PTS-STARTPTS[v${index}];` +
        `[0:a]atrim=start=${edit.start}:end=${edit.end},asetpts=PTS-STARTPTS[a${index}];`;
    });

    // Add concat filter for video and audio streams
    if (streamCount > 0) {
      filterComplex += 
        `${Array.from({length: streamCount}, (_, i) => `[v${i}]`).join('')}concat=n=${streamCount}:v=1:a=0[outv];` +
        `${Array.from({length: streamCount}, (_, i) => `[a${i}]`).join('')}concat=n=${streamCount}:v=0:a=1[outa]`;
    }

    const outputFile = "output.mp4";
    const cmd = ["-i", videoName];

    if (filterComplex && streamCount > 0) {
      cmd.push("-filter_complex", filterComplex);
      cmd.push("-map", "[outv]");
      cmd.push("-map", "[outa]");
    } else {
      cmd.push("-c", "copy");
    }

    cmd.push(outputFile);

    // Execute command using the new API
    await ffmpeg.exec(cmd);

    // Read the output file using the new API
    const data = await ffmpeg.readFile(outputFile);
    const uint8Array = new Uint8Array(data as ArrayBuffer);

    return URL.createObjectURL(new Blob([uint8Array], { type: "video/mp4" }));
  } catch (error) {
    console.error("Error processing video:", error);
    return null;
  }
};