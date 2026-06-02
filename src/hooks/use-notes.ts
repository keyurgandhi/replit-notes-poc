import { useState, useEffect } from "react";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem("notes");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse notes from localStorage");
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const createNote = (note: Pick<Note, "title" | "content">) => {
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    return newNote;
  };

  const updateNote = (id: string, note: Partial<Pick<Note, "title" | "content">>) => {
    setNotes((prev) => {
      const idx = prev.findIndex(n => n.id === id);
      if (idx === -1) return prev;
      const newNotes = [...prev];
      newNotes[idx] = { ...newNotes[idx], ...note, updatedAt: new Date().toISOString() };
      return newNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    });
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return { notes, createNote, updateNote, deleteNote };
}
