// TimelineControls.tsx
import React from 'react';
import { Undo, Redo } from "lucide-react";

interface TimelineControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  onTrim: () => void;
  onSplice: () => void;
  onSubmit: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const TimelineControls: React.FC<TimelineControlsProps> = ({
  onUndo,
  onRedo,
  onTrim,
  onSplice,
  onSubmit,
  canUndo,
  canRedo
}) => {
  return (
    <div className="flex mb-2 space-x-2">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="px-3 py-1 bg-gray-500 text-white rounded disabled:opacity-50"
      >
        <Undo />
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="px-3 py-1 bg-gray-500 text-white rounded disabled:opacity-50"
      >
        <Redo />
      </button>
      <button
        onClick={onTrim}
        className="px-3 py-1 bg-blue-500 text-white rounded"
      >
        Pre Cut
      </button>
      <button
        onClick={onSplice}
        className="px-3 py-1 bg-red-500 text-white rounded"
      >
        Splice
      </button>
      <button
        onClick={onSubmit}
        className="px-3 py-1 bg-green-500 text-white rounded"
      >
        Submit
      </button>
    </div>
  );
};

export default TimelineControls;