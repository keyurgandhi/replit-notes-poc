import { useState, useEffect, useCallback } from 'react';

export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}

const STORAGE_KEY = 'notes-app-notes';

const SEED_NOTES: Note[] = [
  {
    id: crypto.randomUUID(),
    title: 'Morning pages',
    body: 'The sun is just coming up. I need to remember to water the plants today. Streaming consciousness helps clear the mind before starting work. The coffee smells good.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    isPinned: true,
  },
  {
    id: crypto.randomUUID(),
    title: 'Project ideas',
    body: '- A quiet note taking app\n- A garden watering tracker\n- A recipe organizer focused on simplicity',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    isPinned: false,
  },
  {
    id: crypto.randomUUID(),
    title: 'Reading list',
    body: '1. The Design of Everyday Things\n2. Thinking, Fast and Slow\n3. The Shape of Design',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    isPinned: false,
  }
];

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          setNotes(parsed);
        } else {
          setNotes(SEED_NOTES);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_NOTES));
        }
      } catch (e) {
        setNotes(SEED_NOTES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_NOTES));
      }
    } else {
      setNotes(SEED_NOTES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_NOTES));
    }
    setIsLoaded(true);
  }, []);

  const saveNotes = useCallback((newNotes: Note[]) => {
    setNotes(newNotes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
  }, []);

  const createNote = useCallback(() => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: '',
      body: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
    };
    saveNotes([newNote, ...notes]);
    return newNote;
  }, [notes, saveNotes]);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    const updatedNotes = notes.map(n => 
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    );
    saveNotes(updatedNotes);
  }, [notes, saveNotes]);

  const deleteNote = useCallback((id: string) => {
    saveNotes(notes.filter(n => n.id !== id));
  }, [notes, saveNotes]);

  const togglePin = useCallback((id: string) => {
    const updatedNotes = notes.map(n => 
      n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() } : n
    );
    saveNotes(updatedNotes);
  }, [notes, saveNotes]);

  return {
    notes,
    isLoaded,
    createNote,
    updateNote,
    deleteNote,
    togglePin
  };
}
