// hooks/useTimelineState.ts
import { useState, useCallback } from 'react';

export const useTimelineState = (duration: number) => {
  const [zoom, setZoom] = useState(1);
  const [visibleStart, setVisibleStart] = useState(0);
  const [visibleEnd, setVisibleEnd] = useState(duration);

  const handleZoom = useCallback((direction: number) => {
    setZoom((prevZoom) => {
      const newZoom = Math.min(5, Math.max(1, prevZoom + direction * 0.5));
      
      if (newZoom === prevZoom) return prevZoom;
      
      const midpoint = (visibleStart + visibleEnd) / 2;
      
      const visibleDuration = duration / newZoom;
      
      const newStart = Math.max(0, midpoint - visibleDuration / 2);
      const newEnd = Math.min(duration, midpoint + visibleDuration / 2);
      
      setVisibleStart(newStart);
      setVisibleEnd(newEnd);
      
      return newZoom;
    });
  }, [duration, visibleStart, visibleEnd]);

  const handlePan = useCallback((direction: 'left' | 'right', amount: number = 0.2) => {
    const visibleDuration = visibleEnd - visibleStart;
    
    const panAmount = visibleDuration * amount;
    
    if (direction === 'left') {
      const newStart = Math.max(0, visibleStart - panAmount);
      const newEnd = newStart + visibleDuration;
      
      if (newEnd > duration) {
        setVisibleEnd(duration);
        setVisibleStart(duration - visibleDuration);
      } else {
        setVisibleStart(newStart);
        setVisibleEnd(newEnd);
      }
    } else {
      const newEnd = Math.min(duration, visibleEnd + panAmount);
      const newStart = newEnd - visibleDuration;
      
      if (newStart < 0) {
        setVisibleStart(0);
        setVisibleEnd(visibleDuration);
      } else {
        setVisibleStart(newStart);
        setVisibleEnd(newEnd);
      }
    }
  }, [visibleStart, visibleEnd, duration]);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setVisibleStart(0);
    setVisibleEnd(duration);
  }, [duration]);

  return {
    zoom,
    visibleStart,
    visibleEnd,
    handleZoom,
    handlePan,
    resetZoom,
    setVisibleStart,
    setVisibleEnd
  };
};