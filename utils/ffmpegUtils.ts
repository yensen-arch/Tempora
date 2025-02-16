"use client";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export const processAudio = async (audioUrl: string, edits: any) => {
  // Create FFmpeg instance
  const ffmpeg = new FFmpeg();
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd';

  // Load FFmpeg
  if (!ffmpeg.loaded) {
    try {
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
    // Fetch audio file
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(`Error fetching audio: ${response.status} ${response.statusText}`);
    }
    const audioBlob = await response.blob();
    const audioName = "input.mp3";
    const arrayBuffer = await audioBlob.arrayBuffer();

    // Write file
    await ffmpeg.writeFile(audioName, new Uint8Array(arrayBuffer));

    let filterComplex = "";
    let streamCount = edits.length;

    // Create individual trimmed segments
    edits.forEach((edit, index) => {
      filterComplex += `[0:a]atrim=start=${edit.start}:end=${edit.end},asetpts=PTS-STARTPTS[a${index}];`;
    });

    // Concatenate segments
    if (streamCount > 0) {
      filterComplex += `${Array.from({ length: streamCount }, (_, i) => `[a${i}]`).join('')}concat=n=${streamCount}:v=0:a=1[outa]`;
    }

    const outputFile = "output.mp3";
    const cmd = ["-i", audioName];

    if (filterComplex && streamCount > 0) {
      cmd.push("-filter_complex", filterComplex);
      cmd.push("-map", "[outa]");
    } else {
      cmd.push("-c", "copy");
    }

    cmd.push(outputFile);

    // Execute command
    await ffmpeg.exec(cmd);

    // Read output file
    const data = await ffmpeg.readFile(outputFile);
    const uint8Array = new Uint8Array(data as ArrayBuffer);

    return URL.createObjectURL(new Blob([uint8Array], { type: "audio/mp3" }));
  } catch (error) {
    console.error("Error processing audio:", error);
    return null;
  }
};
