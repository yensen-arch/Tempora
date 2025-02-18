import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, useMotionValue } from "framer-motion";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
} from "lucide-react";
import TrimOverlay from "./TrimOverlay";
import SpliceOverlay from "./SpliceOverlay";
interface TimelineProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  duration: number;
}
import EditMachine from "./EditMachine";

type Edit = {
  start: number;
  end: number;
  type: "trim" | "splice";
};

const Timeline: React.FC<TimelineProps> = ({ videoRef, duration }) => {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderX = useMotionValue(0);
  const { user } = useUser();
  const email = user?.email;
  const [isDragging, setIsDragging] = useState(false);
  const [visibleStart, setVisibleStart] = useState(0);
  const [visibleEnd, setVisibleEnd] = useState(duration);
  const [showTrim, setShowTrim] = useState(false);
  const [editHistory, setEditHistory] = useState<
    { start: number; end: number; type: "trim" | "splice" }[]
  >([]);
  const [undoneEdits, setUndoneEdits] = useState<Edit[]>([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  const [showSplice, setShowSplice] = useState(false);
  const [submitClicked, setSubmitClicked] = useState(false);

  const router = useRouter();
  const { videoUrl, audioPath: audioUrl } = router.query;
  const [decodedUrl, setDecodedUrl] = useState<string | null>(null);
  const [decodedAudioUrl, setDecodedAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!videoUrl || !audioUrl) {
      fetch("/api/cart/get_uploaded_media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP ${res.status}: ${errorText}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data.fileUrl) {
            setDecodedUrl(decodeURIComponent(data.fileUrl));
            setDecodedAudioUrl(decodeURIComponent(data.audioPath));
            console.log(data.fileUrl);
          } else {
            throw new Error("No file URL found in the response.");
          }
        })
    } else{
      setDecodedUrl(videoUrl);
      setDecodedAudioUrl(audioUrl);
    }
  }, [decodedUrl, videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateSlider = () => {
      const video = videoRef.current;
      if (!video || !containerRef.current || isDragging) return;

      const currentTime = video.currentTime;
      let adjustedTime = currentTime;

      // Adjust for any spliced sections before current time
      const splices = editHistory.filter((edit) => edit.type === "splice");
      for (const splice of splices) {
        if (currentTime >= splice.end) {
          adjustedTime -= splice.end - splice.start;
        } else if (currentTime >= splice.start) {
          video.currentTime = splice.end + 0.1; //prevents loop
          adjustedTime = splice.end - (splice.end - splice.start);
          break;
        }
      }

      const visibleDuration = visibleEnd - visibleStart;
      const progress = (adjustedTime - visibleStart) / visibleDuration;
      const containerWidth = containerRef.current.offsetWidth;
      sliderX.set(
        Math.max(0, Math.min(containerWidth, progress * containerWidth))
      );

      if (adjustedTime >= visibleEnd) {
        video.pause();
      }
    };

    video.addEventListener("timeupdate", updateSlider);
    return () => video.removeEventListener("timeupdate", updateSlider);
  }, [videoRef, sliderX, isDragging, visibleStart, visibleEnd, editHistory]);

  const handleZoom = (direction: number) => {
    setZoom((prevZoom) => {
      const newZoom = Math.min(5, Math.max(1, prevZoom + direction * 0.5));
      const midpoint = (visibleStart + visibleEnd) / 2;
      const visibleDuration = duration / newZoom;
      const newStart = Math.max(0, midpoint - visibleDuration / 2);
      const newEnd = Math.min(duration, midpoint + visibleDuration / 2);
      setVisibleStart(newStart);
      setVisibleEnd(newEnd);
      return newZoom;
    });
  };

  const handleDrag = (_, info: { point: { x: number } }) => {
    if (videoRef.current && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const progress = Math.max(0, Math.min(1, info.point.x / containerWidth));
      const newTime = visibleStart + progress * (visibleEnd - visibleStart);

      if (!isNaN(newTime) && isFinite(newTime)) {
        videoRef.current.currentTime = Math.max(
          visibleStart,
          Math.min(visibleEnd, newTime)
        );
      }
    }
  };

  const currentTrim = editHistory[editHistory.length - 1] || {
    start: 0,
    end: duration,
  };

  const updateEditHistory = (newEdit: Edit) => {
    setEditHistory(prevEdits => [...prevEdits, newEdit]);
    // Clear the redo stack when a new edit is made
    setUndoneEdits([]);
  };

  const handleSpliceUpdate = (start: number, end: number) => {
    const visibleDuration = visibleEnd - visibleStart;
    const rawStart = visibleStart + start * visibleDuration;
    const rawEnd = visibleStart + end * visibleDuration;

    // Get actual video time positions
    let adjustedStart = rawStart;
    let adjustedEnd = rawEnd;

    // Sort splices by start time
    const previousSplices = editHistory
      .filter((edit) => edit.type === "splice")
      .sort((a, b) => a.start - b.start);

    // Calculate cumulative offset at each point
    let cumulativeOffset = 0;
    for (const splice of previousSplices) {
      const spliceLength = splice.end - splice.start;
      if (rawStart > splice.start) {
        adjustedStart += spliceLength;
      }
      if (rawEnd > splice.start) {
        adjustedEnd += spliceLength;
      }
      cumulativeOffset += spliceLength;
    }

    updateEditHistory({
      start: adjustedStart,
      end: adjustedEnd,
      type: "splice",
    });

    setVisibleEnd((prev) => prev - (adjustedEnd - adjustedStart));

    if (videoRef.current) {
      videoRef.current.currentTime = adjustedStart;
    }
  };

  const undo = () => {
    if (editHistory.length > 0) {
      // Remove the last edit from activeEdits and add to undoneEdits
      const lastEdit = editHistory[editHistory.length - 1];
      setEditHistory(prevEdits => prevEdits.slice(0, -1));
      setUndoneEdits(prevUndone => [...prevUndone, lastEdit]);
      
      // Apply the second-to-last edit state (or reset if no edits remain)
      if (editHistory.length > 1) {
        const previousEdit = editHistory[editHistory.length - 2];
        if (previousEdit.type === "trim") {
          setVisibleStart(previousEdit.start);
          setVisibleEnd(previousEdit.end);
        }
      } else {
        setVisibleStart(0);
        setVisibleEnd(duration);
      }
    }
  };

  const redo = () => {
    if (undoneEdits.length > 0) {
      // Move the last undone edit back to activeEdits
      const editToRedo = undoneEdits[undoneEdits.length - 1];
      setUndoneEdits(prevUndone => prevUndone.slice(0, -1));
      setEditHistory(prevEdits => [...prevEdits, editToRedo]);
      
      // Apply the redone edit
      if (editToRedo.type === "trim") {
        setVisibleStart(editToRedo.start);
        setVisibleEnd(editToRedo.end);
      }
    }
  };
  console.log(visibleStart, visibleEnd);

  const handleTrimUpdate = (start: number, end: number) => {
    // Calculate new trim points relative to the current trim
    const actualStart =
      currentTrim.start + start * (currentTrim.end - currentTrim.start);
    const actualEnd =
      currentTrim.start + end * (currentTrim.end - currentTrim.start);

    updateEditHistory({ start: actualStart, end: actualEnd, type: "trim" });
    setVisibleStart(actualStart);
    setVisibleEnd(actualEnd);

    if (videoRef.current) {
      videoRef.current.currentTime = actualStart;
    }
  };
  const trimStartPercent = (currentTrim.start / duration) * 100;
  const trimWidthPercent =
    ((currentTrim.end - currentTrim.start) / duration) * 100;
  console.log(editHistory);
  return (
    <div className="relative w-full max-w-3xl mt-4 rounded-lg p-8">
      {/* Rest of the component remains the same until the timeline section */}
      <div className="relative">
        <button
          onClick={undo}
          disabled={editHistory.length === 0}
          className="mb-2 px-3 py-1 bg-gray-500 text-white rounded disabled:opacity-50"
        >
          <Undo />
        </button>
        <button
          onClick={redo}
          disabled={undoneEdits.length === 0}
          className="mb-2 ml-2 px-3 py-1 bg-gray-500 text-white rounded disabled:opacity-50"
        >
          <Redo />
        </button>
        <button
          onClick={() => setShowTrim(true)}
          className="mb-2 px-3 py-1 bg-blue-500 text-white rounded"
        >
          Pre Cut
        </button>

        <button
          onClick={() => setShowSplice(true)}
          className="mb-2 ml-2 px-3 py-1 bg-red-500 text-white rounded"
        >
          Splice
        </button>

        <button
          onClick={() => setSubmitClicked((prev) => !prev)}
          className="mb-2 ml-2 px-3 py-1 bg-green-500 text-white rounded"
        >
          Submit
        </button>
        <div
          ref={containerRef}
          className="relative w-full h-20 overflow-hidden border-b border-gray-200"
        >
          {showTrim && (
            <TrimOverlay
              duration={1}
              onTrimChange={handleTrimUpdate}
              onClose={() => setShowTrim(false)}
              initialStart={0}
              initialEnd={1}
            />
          )}

          {showSplice && (
            <SpliceOverlay
              duration={1}
              onSpliceChange={handleSpliceUpdate}
              onClose={() => setShowSplice(false)}
              initialStart={0}
              initialEnd={1}
            />
          )}

          <div
            className="absolute h-12 bg-opacity-50"
            style={{
              width: `${trimWidthPercent}%`,
              left: `${trimStartPercent}%`,
            }}
          />

          {Array.from({
            length: Math.ceil((visibleEnd - visibleStart) / zoom) + 1,
          }).map((_, i) => {
            const time = visibleStart + i * zoom;
            if (time > visibleEnd) return null;

            // Get actual video time by accounting for all previous splices
            let displayTime = time;
            const orderedSplices = editHistory
              .filter((edit) => edit.type === "splice")
              .sort((a, b) => a.start - b.start);

            for (const splice of orderedSplices) {
              const spliceLength = splice.end - splice.start;
              if (displayTime >= splice.start) {
                displayTime += spliceLength;
              }
            }

            return (
              <div
                key={i}
                className="absolute top-0 h-8"
                style={{
                  left: `${
                    ((time - visibleStart) / (visibleEnd - visibleStart)) * 100
                  }%`,
                }}
              >
                <div className="h-full w-px bg-black" />
                <div className="absolute top-full transform -translate-x-1/2 text-xs text-gray-500 mt-1">
                  {displayTime.toFixed(1)}s
                </div>
              </div>
            );
          })}

          <motion.div
            className="absolute top-0 w-0.5 h-12 bg-red-500 z-10"
            style={{ x: sliderX }}
            drag="x"
            dragConstraints={containerRef}
            dragElastic={0}
            dragMomentum={false}
            onDrag={handleDrag}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
          >
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rotate-45 mt-1" />
          </motion.div>
        </div>
      </div>
      {decodedUrl ? (
        <EditMachine videoUrl={decodedUrl} edits={editHistory} submitClicked={submitClicked} audioUrl={decodedAudioUrl}/>
      ) : (
        <div>Loading video...</div>
      )}
    </div>
  );
};

export default Timeline;
