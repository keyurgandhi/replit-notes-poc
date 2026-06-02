import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Moon, 
  Sun, 
  BookOpen,
  AlignLeft,
  Calendar,
  X
} from "lucide-react";
import { useNotes } from "@/hooks/use-notes";
import { useTheme } from "@/hooks/use-theme";

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
}

function countWordsAndChars(text: string) {
  const chars = text.length;
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  return { chars, words };
}

function App() {
  const { notes, isLoaded, createNote, updateNote, deleteNote, togglePin } = useNotes();
  const { theme, toggleTheme } = useTheme();
  
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const selectedNoteIdRef = useRef<string | null>(null);
  
  // Update draft when selected note changes
  useEffect(() => {
    if (selectedNoteId !== selectedNoteIdRef.current) {
      selectedNoteIdRef.current = selectedNoteId;
      const note = notes.find(n => n.id === selectedNoteId);
      if (note) {
        setDraftTitle(note.title);
        setDraftBody(note.body);
      } else {
        setDraftTitle("");
        setDraftBody("");
      }
    }
  }, [selectedNoteId, notes]);

  // Handle keyboard shortcut for new note
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleCreateNote();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createNote]);

  const handleCreateNote = () => {
    const newNote = createNote();
    setSelectedNoteId(newNote.id);
    setSearchQuery("");
  };

  const handleDeleteNote = () => {
    if (!selectedNoteId) return;
    if (window.confirm("Are you sure you want to delete this note?")) {
      deleteNote(selectedNoteId);
      setSelectedNoteId(null);
    }
  };

  const handleUpdate = useCallback((title: string, body: string) => {
    if (!selectedNoteId) return;
    updateNote(selectedNoteId, { title, body });
  }, [selectedNoteId, updateNote]);

  // Debounced auto-save
  useEffect(() => {
    if (!selectedNoteId) return;
    const note = notes.find(n => n.id === selectedNoteId);
    if (!note) return;
    
    if (draftTitle !== note.title || draftBody !== note.body) {
      const timeoutId = setTimeout(() => {
        handleUpdate(draftTitle, draftBody);
      }, 400);
      return () => clearTimeout(timeoutId);
    }
  }, [draftTitle, draftBody, selectedNoteId, handleUpdate, notes]);

  // Sort and filter notes
  const filteredNotes = useMemo(() => {
    let result = notes;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        n => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
      );
    }
    
    return result.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, searchQuery]);

  if (!isLoaded) return <div className="min-h-screen bg-background" />;

  const selectedNote = notes.find(n => n.id === selectedNoteId);
  const { words, chars } = countWordsAndChars(draftBody);

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground">
        
        {/* Sidebar */}
        <aside className="w-80 border-r border-border flex flex-col bg-card/30 shrink-0">
          <div className="p-4 flex flex-col gap-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <BookOpen className="w-5 h-5" />
                <h1 className="font-serif font-semibold text-lg tracking-tight">Journal</h1>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="dark-mode-toggle"
                  title="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button 
                  onClick={handleCreateNote}
                  className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  data-testid="new-note-button"
                  title="New Note (Cmd/Ctrl+N)"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-md py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                data-testid="search-input"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          
          <div className="px-4 py-2 text-xs font-medium text-muted-foreground flex justify-between items-center bg-muted/20">
            <span>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
            {searchQuery && <span>{filteredNotes.length} matches</span>}
          </div>

          <div 
            className="flex-1 overflow-y-auto p-2 space-y-1"
            data-testid="note-list"
          >
            {filteredNotes.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm mt-10">
                {searchQuery ? "No notes found matching your search." : "No notes yet."}
              </div>
            ) : (
              filteredNotes.map((note, index) => (
                <div 
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  data-testid={`note-card-${note.id}`}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 animate-in fade-in slide-in-from-left-4
                    ${selectedNoteId === note.id 
                      ? 'bg-primary/10 border-primary/30 border shadow-sm' 
                      : 'hover:bg-muted border border-transparent'
                    }
                  `}
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-serif font-medium truncate pr-6 ${!note.title ? 'text-muted-foreground italic' : ''}`}>
                      {note.title || "Untitled"}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(note.id);
                      }}
                      data-testid={`pin-note-button`}
                      className={`absolute right-2 top-3 p-1.5 rounded-md transition-opacity
                        ${note.isPinned ? 'text-primary opacity-100' : 'text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-background/50'}
                      `}
                      title={note.isPinned ? "Unpin note" : "Pin note"}
                    >
                      <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">
                    {note.body || "No content"}
                  </p>
                  <div className="text-[10px] text-muted-foreground/70 font-medium">
                    {formatDate(note.updatedAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Editor Area */}
        <main className="flex-1 flex flex-col relative bg-background">
          {selectedNote ? (
            <>
              <header className="px-8 py-5 border-b border-border/30 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Edited {format(new Date(selectedNote.updatedAt), "MMMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                </div>
                <button
                  onClick={handleDeleteNote}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  data-testid="delete-note-button"
                  title="Delete note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </header>
              
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto p-8 lg:p-12 pb-32">
                  <input
                    type="text"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    placeholder="Note Title"
                    className="w-full text-4xl font-serif font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground/40 text-foreground mb-6"
                    data-testid="note-title-input"
                  />
                  <textarea
                    value={draftBody}
                    onChange={(e) => setDraftBody(e.target.value)}
                    placeholder="Start writing..."
                    className="w-full min-h-[50vh] text-lg leading-relaxed bg-transparent border-none outline-none placeholder:text-muted-foreground/40 text-foreground resize-none"
                    data-testid="note-body-input"
                    spellCheck="false"
                  />
                </div>
              </div>
              
              <footer className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none">
                <div className="max-w-3xl mx-auto flex justify-end">
                  <div 
                    className="flex items-center gap-3 text-xs font-medium text-muted-foreground bg-card/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border shadow-sm pointer-events-auto"
                    data-testid="word-count-display"
                  >
                    <div className="flex items-center gap-1.5">
                      <AlignLeft className="w-3.5 h-3.5" />
                      <span>{words} words</span>
                    </div>
                    <span className="w-1 h-1 rounded-full bg-border"></span>
                    <span>{chars} chars</span>
                  </div>
                </div>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-700">
              <div className="w-24 h-24 mb-6 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                <BookOpen className="w-10 h-10 text-primary/40" />
              </div>
              <h2 className="text-2xl font-serif font-medium mb-2">A quiet space for your thoughts.</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
                Select a note from the sidebar to start writing, or create a new one to capture something on your mind.
              </p>
              <button
                onClick={handleCreateNote}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">Create your first note</span>
              </button>
            </div>
          )}
        </main>
      </div>
  );
}

export default App;
