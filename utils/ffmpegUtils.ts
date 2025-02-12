"use client";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export const processVideo = async (videoUrl: string, edits: any) => {
  // Create FFmpeg instance with the new API
  const ffmpeg = new FFmpeg();
  
  // Load FFmpeg with the new method
  if (!ffmpeg.loaded) {
    try {
      // Load the core and required files from CDN
      await ffmpeg.load({
        coreURL: await toBlobURL(`/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`/ffmpeg-core.wasm`, 'application/wasm'),
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

    // Write file using the new API
    await ffmpeg.writeFile(videoName, new Uint8Array(await videoBlob.arrayBuffer()));

    let filterComplex = "";
    let mapVideo = "";
    let mapAudio = "";
    edits.forEach((edit: { start: number; end: number; type: string }, index: number) => {
      if (edit.type === "trim" || edit.type === "splice") {
        filterComplex += `[0:v]trim=start=${edit.start}:end=${edit.end},setpts=PTS-STARTPTS[v${index}]; `;
        filterComplex += `[0:a]atrim=start=${edit.start}:end=${edit.end},asetpts=PTS-STARTPTS[a${index}]; `;
        mapVideo += `[v${index}]`;
        mapAudio += `[a${index}]`;
      }
    });

    const outputFile = "output.mp4";
    const cmd = ["-i", videoName];

    if (filterComplex) {
      cmd.push("-filter_complex", filterComplex);
      cmd.push("-map", mapVideo);
      cmd.push("-map", mapAudio);
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