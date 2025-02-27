// Timeline.tsx - Main component file
import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import { useUser } from "@auth0/nextjs-auth0/client";
import TrimOverlay from "./TrimOverlay";
import SpliceOverlay from "./SpliceOverlay";
import EditMachine from "./EditMachine";
import TimelineControls from "./TimelineControls";
import TimelineSlider from "./TimelineSlider";
import { useEditHistory } from "./hooks/useEditHistory";
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

  // Custom hooks for state management
  const {
    visibleStart,
    visibleEnd,
    zoom,
    handleZoom,
    setVisibleStart,
    setVisibleEnd,
  } = useTimelineState(duration);

  const { editHistory, undoneEdits, updateEditHistory, undo, redo } =
    useEditHistory(duration, setVisibleStart, setVisibleEnd);

  const { decodedUrl, decodedAudioUrl } = useMediaLoader(user?.email);

  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [editHistory]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        handleSave();
        event.preventDefault();
        return ""
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }
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

    setVisibleEnd((prev) => prev - (adjustedEnd - adjustedStart));

    if (videoRef.current) {
      videoRef.current.currentTime = adjustedStart;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try{
      const res = await fetch('api/cart/save_edits', {
        method: 'PUT',
        headers: {
          'Content-Type': "application/json",
        },
        body: JSON.stringify({
          email: user?.email,
          editHistory
        })
      });
      console.log(res.json());
    }catch{
      console.log("Cannot save edits, try again later");
    }finally{
      setIsSaving(false);
    }
  }

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

  return (
    <>
    <div className="relative w-full max-w-3xl mt-4 rounded-lg p-8">
      <div className="relative">
        <TimelineControls
          onUndo={undo}
          onRedo={redo}
          onTrim={() => {setShowTrim(true); setShowSplice(false)}}
          onSplice={() => {setShowSplice(true); setShowTrim(false)}}
          onSubmit={() => setSubmitClicked((prev) => !prev)}
          onSave={handleSave}
          canUndo={editHistory.length > 0}
          canRedo={undoneEdits.length > 0}
          isSaving={isSaving}
        />

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

          <TimelineSlider
            visibleStart={visibleStart}
            visibleEnd={visibleEnd}
            zoom={zoom}
            editHistory={editHistory}
          />

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
        <EditMachine
          videoUrl={decodedUrl}
          edits={editHistory}
          submitClicked={submitClicked}
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
