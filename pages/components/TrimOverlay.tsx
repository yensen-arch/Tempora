import { useState } from "react";

interface TrimOverlayProps {
  duration: number;
  onTrimChange: (start: number, end: number) => void;
  onClose: () => void;
}

const TrimOverlay: React.FC<TrimOverlayProps> = ({ duration, onTrimChange, onClose }) => {
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(duration);

  const handleTrimChange = () => {
    onTrimChange(start, end);
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
      <div className="relative w-full h-16 border-2 border-blue-500">
        {/* Left Handle */}
        <div
          className="absolute left-0 w-3 h-full bg-blue-500 cursor-ew-resize"
          draggable
          onDrag={(e) => {
            const newStart = Math.max(0, start + e.movementX / 10);
            setStart(newStart);
          }}
        />
        {/* Right Handle */}
        <div
          className="absolute right-0 w-3 h-full bg-blue-500 cursor-ew-resize"
          draggable
          onDrag={(e) => {
            const newEnd = Math.min(duration, end + e.movementX / 10);
            setEnd(newEnd);
          }}
        />
      </div>
      <button onClick={handleTrimChange} className="absolute bottom-2 px-3 py-1 bg-blue-500 text-white rounded">
        Save Trim
      </button>
    </div>
  );
};

export default TrimOverlay;
