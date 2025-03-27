// context/EditHistoryContext.tsx
"use client";
import React, { createContext, useContext, useState } from 'react';
import { Edit } from '../hooks/types';

interface EditHistoryContextType {
  editHistory: Edit[];
  undoneEdits: Edit[];
  updateEditHistory: (newEdit: Edit) => void;
  undo: (callbacks: { onTrim?: (start: number, end: number) => void, onResetTrim?: () => void }) => void;
  redo: (callbacks: { onTrim?: (start: number, end: number) => void }) => void;
  setEditHistoryFromApi: (history: Edit[]) => void;
}

const EditHistoryContext = createContext<EditHistoryContextType | undefined>(undefined);

export const EditHistoryProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [editHistory, setEditHistory] = useState<Edit[]>([]);
  const [undoneEdits, setUndoneEdits] = useState<Edit[]>([]);

  const updateEditHistory = (newEdit: Edit) => {
    setEditHistory((prevEdits) => [...prevEdits, newEdit]);
    // Clear the redo stack when a new edit is made
    setUndoneEdits([]);
  };

  const undo = (callbacks: { onTrim?: (start: number, end: number) => void, onResetTrim?: () => void }) => {
    if (editHistory.length > 0) {
      // Remove the last edit from activeEdits and add to undoneEdits
      const lastEdit = editHistory[editHistory.length - 1];
      setEditHistory((prevEdits) => prevEdits.slice(0, -1));
      setUndoneEdits((prevUndone) => [...prevUndone, lastEdit]);

      // Apply the second-to-last edit state (or reset if no edits remain)
      if (editHistory.length > 1) {
        const previousEdit = editHistory[editHistory.length - 2];
        if (previousEdit.type === "trim" && callbacks.onTrim) {
          callbacks.onTrim(previousEdit.start, previousEdit.end);
        }
      } else {
        // Reset to initial state if no edits remain
        if (callbacks.onResetTrim) {
          callbacks.onResetTrim();
        }
      }
    }
  };

  const redo = (callbacks: { onTrim?: (start: number, end: number) => void }) => {
    if (undoneEdits.length > 0) {
      // Move the last undone edit back to activeEdits
      const editToRedo = undoneEdits[undoneEdits.length - 1];
      setUndoneEdits((prevUndone) => prevUndone.slice(0, -1));
      setEditHistory((prevEdits) => [...prevEdits, editToRedo]);

      // Apply the redone edit
      if (editToRedo.type === "trim" && callbacks.onTrim) {
        callbacks.onTrim(editToRedo.start, editToRedo.end);
      }
    }
  };

  const setEditHistoryFromApi = (history: Edit[]) => {
    setEditHistory(history);
    setUndoneEdits([]);
  };
  return (
    <EditHistoryContext.Provider
      value={{
        editHistory,
        undoneEdits,
        updateEditHistory,
        undo,
        redo,
        setEditHistoryFromApi
      }}
    >
      {children}
    </EditHistoryContext.Provider>
  );
};
export const useEditHistoryContext = () => {
  const context = useContext(EditHistoryContext);
  if (context === undefined) {
    throw new Error('useEditHistory must be used within an EditHistoryProvider');
  }
  return context;
};