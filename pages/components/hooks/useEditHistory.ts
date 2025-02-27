// hooks/useEditHistory.ts
import { useState } from 'react';
import { Edit } from '../types';

export const useEditHistory = (
  duration: number,
  setVisibleStart: React.Dispatch<React.SetStateAction<number>>,
  setVisibleEnd: React.Dispatch<React.SetStateAction<number>>
) => {
  const [editHistory, setEditHistory] = useState<Edit[]>([]);
  const [undoneEdits, setUndoneEdits] = useState<Edit[]>([]);

  const updateEditHistory = (newEdit: Edit) => {
    setEditHistory((prevEdits) => [...prevEdits, newEdit]);
    // Clear the redo stack when a new edit is made
    setUndoneEdits([]);
  };

  const undo = () => {
    if (editHistory.length > 0) {
      // Remove the last edit from activeEdits and add to undoneEdits
      const lastEdit = editHistory[editHistory.length - 1];
      setEditHistory((prevEdits) => prevEdits.slice(0, -1));
      setUndoneEdits((prevUndone) => [...prevUndone, lastEdit]);

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
      setUndoneEdits((prevUndone) => prevUndone.slice(0, -1));
      setEditHistory((prevEdits) => [...prevEdits, editToRedo]);

      // Apply the redone edit
      if (editToRedo.type === "trim") {
        setVisibleStart(editToRedo.start);
        setVisibleEnd(editToRedo.end);
      }
    }
  };

  return {
    editHistory,
    undoneEdits,
    updateEditHistory,
    undo,
    redo
  };
};