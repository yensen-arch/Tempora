"use client";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

type Edit = {
  type: "trim" | "splice";
  start: number;
  end: number;
};

export const preProcessEdits = (edits: Edit[]) => {
  if (!edits.length) return [];

  const allEdits = [...edits];
  
  const keepers = allEdits.filter(edit => edit.type === "trim")
    .sort((a, b) => a.start - b.start);
  
  const removers = allEdits.filter(edit => edit.type === "splice")
    .sort((a, b) => a.start - b.start);
  
  const mergedKeepers: Edit[] = [];
  for (const trim of keepers) {
    const lastKeeper = mergedKeepers[mergedKeepers.length - 1];
    if (!lastKeeper || trim.start > lastKeeper.end) {
      mergedKeepers.push({...trim});
    } else {
      // Take the maximum start and minimum end
      lastKeeper.start = Math.max(lastKeeper.start, trim.start);
      lastKeeper.end = Math.min(lastKeeper.end, trim.end);
      
      // If this makes the segment invalid, remove it
      if (lastKeeper.start >= lastKeeper.end) {
        mergedKeepers.pop();
      }
    }
  }
  
  const finalSegments: Edit[] = [];
  
  for (const keeper of mergedKeepers) {
    let currentStart = keeper.start;
    let currentEnd = keeper.end;
    
    const relevantRemovers = removers.filter(
      r => r.end > currentStart && r.start < currentEnd
    );
    
    if (relevantRemovers.length === 0) {
      finalSegments.push({...keeper});
      continue;
    }
    
    relevantRemovers.sort((a, b) => a.start - b.start);
    
    for (const remover of relevantRemovers) {
      if (remover.start <= currentStart) {
        if (remover.end >= currentEnd) {
          currentStart = currentEnd;
          break;
        } else {
          currentStart = remover.end;
        }
      } else {
        if (remover.start > currentStart) {
          finalSegments.push({
            type: "trim",
            start: currentStart,
            end: remover.start
          });
        }
        
        if (remover.end >= currentEnd) {
          currentStart = currentEnd;
          break;
        } else {
          currentStart = remover.end;
        }
      }
    }
    
    if (currentStart < currentEnd) {
      finalSegments.push({
        type: "trim",
        start: currentStart,
        end: currentEnd
      });
    }
  }
  
  return finalSegments.sort((a, b) => a.start - b.start);
};

export const processAudio = async (audioUrl: string, edits: Edit[]) => {
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

    const segmentsToKeep = preProcessEdits(edits);
    
    if (segmentsToKeep.length === 0) {
      await ffmpeg.exec([
        '-f', 'lavfi',
        '-i', 'anullsrc=r=44100:cl=stereo',
        '-t', '0.1',
        'output.mp3'
      ]);
    } else {
      let filterComplex = "";
      let streamCount = 0;
      let allSegments = [];
      
      segmentsToKeep.forEach((segment, index) => {
        filterComplex += `[0:a]atrim=start=${segment.start}:end=${segment.end},asetpts=PTS-STARTPTS[a${streamCount}];`;
        allSegments.push(`[a${streamCount}]`);
        streamCount++;
      });

      if (streamCount > 0) {
        filterComplex += `${allSegments.join('')}concat=n=${streamCount}:v=0:a=1[outa]`;
      }

      await ffmpeg.exec([
        '-i', audioName,
        '-filter_complex', filterComplex,
        '-map', '[outa]',
        'output.mp3'
      ]);
    }

    const data = await ffmpeg.readFile('output.mp3');
    const uint8Array = new Uint8Array(data as ArrayBuffer);

    return URL.createObjectURL(new Blob([uint8Array], { type: "audio/mp3" }));
  } catch (error) {
    console.error("Error processing audio:", error);
    return null;
  } finally {
    await ffmpeg.terminate();
  }
};