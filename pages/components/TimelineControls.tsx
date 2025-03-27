// TimelineControls.tsx
"use client";

import React from "react";
import { Undo, Redo } from "lucide-react";

interface TimelineControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  onTrim: () => void;
  onSplice: () => void;
  onSubmit: () => void;
  onSave: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isSaving: boolean;
  processing: boolean
}

const TimelineControls: React.FC<TimelineControlsProps> = ({
  onUndo,
  onRedo,
  onTrim,
  onSplice,
  onSave,
  onSubmit,
  canUndo,
  canRedo,
  isSaving,
  processing,
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
        className="px-3 py-1 bg-yellow-500 text-black rounded"
      >
        Trim
      </button>
      <button
        onClick={onSplice}
        className="px-3 py-1 bg-red-500 text-white rounded"
      >
        Splice
      </button>
      <button
        onClick={onSave}
        disabled={isSaving}
        className="px-3 py-1 bg-blue-700 text-white rounded disabled:opacity-50"
      >
        Save
      </button>
      <button
        onClick={onSubmit}
        disabled={processing}
        className="px-3 py-1 bg-green-500 text-white rounded disabled:opacity-50"
      >
        {processing? "Please Wait..." : "Submit"}
      </button>
    </div>
  );
};

export default TimelineControls;
