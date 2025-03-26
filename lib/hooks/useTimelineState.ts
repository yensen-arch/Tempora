// hooks/useTimelineState.ts
import { useState } from 'react';

export const useTimelineState = (duration: number) => {
  const [zoom, setZoom] = useState(1);
  const [visibleStart, setVisibleStart] = useState(0);
  const [visibleEnd, setVisibleEnd] = useState(duration);

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

  return {
    zoom,
    visibleStart,
    visibleEnd,
    handleZoom,
    setVisibleStart,
    setVisibleEnd
  };
};