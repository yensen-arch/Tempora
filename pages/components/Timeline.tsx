// Timeline.tsx - Enhanced with zoom controls
import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import { useUser } from "@auth0/nextjs-auth0/client";
import TrimOverlay from "./TrimOverlay";
import SpliceOverlay from "./SpliceOverlay";
import EditMachine from "./EditMachine";
import TimelineControls from "./TimelineControls";
import TimelineSlider from "./TimelineSlider";
import { useEditHistoryContext } from "../context/EditHistoryContext";
import { useTimelineState } from "./hooks/useTimelineState";
import { useMediaLoader } from "./hooks/useMediaLoader";

interface TimelineProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  duration: number;
}

const Timeline: React.FC<TimelineProps> = ({ videoRef, duration }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderX = useMotionValue(0);
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showTrim, setShowTrim] = useState(false);
  const [showSplice, setShowSplice] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Custom hooks for state management
  const {
    visibleStart,
    visibleEnd,
    zoom,
    handleZoom,
    setVisibleStart,
    setVisibleEnd,
  } = useTimelineState(duration);

  const {
    editHistory,
    undoneEdits,
    updateEditHistory,
    undo,
    redo,
    setEditHistoryFromApi,
  } = useEditHistoryContext();
  const { decodedUrl, decodedAudioUrl } = useMediaLoader(user?.email);

  // Handle zoom with mouse wheel
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const direction = e.deltaY > 0 ? -1 : 1; // Reverse direction for intuitive zoom
        handleZoom(direction);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [handleZoom]);

  useEffect(() => {
    if (editHistory.length > 0) {
      // Find the most recent trim edit
      const lastTrimEdit = [...editHistory]
        .filter((edit) => edit.type === "trim")
        .pop();

      if (lastTrimEdit) {
        // Update timeline view to match the last trim
        setVisibleStart(lastTrimEdit.start);
        setVisibleEnd(lastTrimEdit.end);

        // Update video position
        if (videoRef.current) {
          videoRef.current.currentTime = lastTrimEdit.start;
        }
      }
    }
  }, [editHistory, setVisibleStart, setVisibleEnd]);

  // In Timeline.tsx, modify how you call undo/redo
  const handleUndo = () => {
    undo({
      onTrim: (start, end) => {
        setVisibleStart(start);
        setVisibleEnd(end);
        if (videoRef.current) videoRef.current.currentTime = start;
      },
      onResetTrim: () => {
        setVisibleStart(0);
        setVisibleEnd(duration);
        if (videoRef.current) videoRef.current.currentTime = 0;
      },
    });
  };

  const handleRedo = () => {
    redo({
      onTrim: (start, number, end) => {
        setVisibleStart(start);
        setVisibleEnd(end);
        if (videoRef.current) videoRef.current.currentTime = start;
      },
    });
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        handleSave();
        event.preventDefault();
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

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
    setHasUnsavedChanges(true);
    setVisibleEnd((prev) => prev - (adjustedEnd - adjustedStart));

    if (videoRef.current) {
      videoRef.current.currentTime = adjustedStart;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("api/cart/save_edits", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user?.email,
          editHistory,
        }),
      });
      setHasUnsavedChanges(false);
      console.log("saved edits:", await res.json());
    } catch {
      console.log("Cannot save edits, try again later");
    } finally {
      setIsSaving(false);
    }
  };

  //this syncs the timeline with the fresh editfistory from the server
  useEffect(() => {
    if (editHistory.length > 0) {
      const lastTrimEdit = [...editHistory]
        .filter((edit) => edit.type === "trim")
        .pop();

      if (lastTrimEdit) {
        setVisibleStart(lastTrimEdit.start);
        setVisibleEnd(lastTrimEdit.end);
      }
    }
  }, [editHistory]);

  const handleTrimUpdate = (start: number, end: number) => {
    // Calculate new trim points relative to the current trim
    const actualStart =
      currentTrim.start + start * (currentTrim.end - currentTrim.start);
    const actualEnd =
      currentTrim.start + end * (currentTrim.end - currentTrim.start);

    updateEditHistory({ start: actualStart, end: actualEnd, type: "trim" });
    setVisibleStart(actualStart);
    setVisibleEnd(actualEnd);
    setHasUnsavedChanges(true);

    if (videoRef.current) {
      videoRef.current.currentTime = actualStart;
    }
  };

  const trimStartPercent = (currentTrim.start / duration) * 100;
  const trimWidthPercent =
    ((currentTrim.end - currentTrim.start) / duration) * 100;

  // Helper function to format time in mm:ss format
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate zoom percentage
  const zoomPercentage = Math.round(zoom * 100);

  // Reset zoom to show full timeline
  const handleResetZoom = () => {
    setVisibleStart(currentTrim.start);
    setVisibleEnd(currentTrim.end);
  };

  return (
    <>
      <div className="relative w-full max-w-3xl mt-4 rounded-lg p-8">
        <div className="relative w-full">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="w-full sm:w-auto">
              <TimelineControls
                onUndo={handleUndo}
                onRedo={handleRedo}
                onTrim={() => {
                  setShowTrim(true);
                  setShowSplice(false);
                }}
                onSplice={() => {
                  setShowSplice(true);
                  setShowTrim(false);
                }}
                processing={processing}
                onSubmit={() => setSubmitClicked(true)}
                onSave={handleSave}
                canUndo={editHistory.length > 0}
                canRedo={undoneEdits.length > 0}
                isSaving={isSaving}
              />
            </div>

            {/* Zoom controls */}
            <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">
                Zoom: {zoomPercentage}%
              </span>
              <div className="flex items-center gap-1">
                <button
                  className="p-1 w-8 h-8 flex items-center justify-center text-sm bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => handleZoom(-1)}
                  aria-label="Zoom out"
                >
                  -
                </button>
                <button
                  className="p-1 w-8 h-8 flex items-center justify-center text-sm bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => handleZoom(1)}
                  aria-label="Zoom in"
                >
                  +
                </button>
                <button
                  className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                  onClick={handleResetZoom}
                >
                  Reset
                </button>
              </div>
              <div className="text-xs text-gray-500 whitespace-nowrap">
                {formatTime(visibleStart)} - {formatTime(visibleEnd)}
              </div>
            </div>
          </div>

          <div
            ref={containerRef}
            className="relative w-full h-16 sm:h-20 overflow-visible border-b border-gray-200"
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
              className="absolute bg-opacity-50"
              style={{
                width: `${trimWidthPercent}%`,
                left: `${trimStartPercent}%`,
              }}
            />

            <TimelineSlider
              visibleStart={visibleStart}
              visibleEnd={visibleEnd}
              zoom={zoom}
              editHistory={editHistory}
            />

            <motion.div
              className="absolute top-0 w-0.5 h-10 sm:h-12 bg-red-500 z-10"
              style={{ x: sliderX }}
              drag="x"
              dragConstraints={containerRef}
              dragElastic={0}
              dragMomentum={false}
              onDrag={handleDrag}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
            >
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rotate-45 mt-0.5 sm:mt-1" />
            </motion.div>
          </div>
        </div>
        {decodedUrl ? (
          <EditMachine
            edits={editHistory}
            submitClicked={submitClicked}
            setSubmitClicked={setSubmitClicked}
            setProcessing={setProcessing}
            audioUrl={decodedAudioUrl}
          />
        ) : (
          <div>Loading video...</div>
        )}
      </div>
    </>
  );
};

export default Timeline;
