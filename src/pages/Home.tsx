import { useState } from "react";
import { useNotes, Note } from "@/hooks/use-notes";
import { NoteCard } from "@/components/NoteCard";
import { NoteDialog } from "@/components/NoteDialog";
import { Button } from "@/components/ui/button";
import { Plus, BookText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { notes, createNote, updateNote, deleteNote } = useNotes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { toast } = useToast();

  const handleOpenNew = () => {
    setEditingNote(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setIsDialogOpen(true);
  };

  const handleSave = (noteData: Pick<Note, "title" | "content">) => {
    if (editingNote) {
      updateNote(editingNote.id, noteData);
      toast({
        title: "Note updated",
        description: "Your note has been successfully updated.",
      });
    } else {
      createNote(noteData);
      toast({
        title: "Note created",
        description: "Your new note has been saved.",
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    toast({
      title: "Note deleted",
      description: "The note has been removed.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <BookText className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-serif font-semibold text-foreground">Jot</h1>
          </div>
          <Button onClick={handleOpenNew} data-testid="button-new-note" className="gap-2 shadow-sm rounded-full">
            <Plus className="h-4 w-4" />
            New Note
          </Button>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-12">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-secondary p-6 rounded-full mb-6">
              <BookText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">No notes yet</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Welcome to Jot. A quiet, personal space for your thoughts. 
              Create your first note to get started.
            </p>
            <Button onClick={handleOpenNew} size="lg" className="rounded-full gap-2">
              <Plus className="h-5 w-5" />
              Create First Note
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      <NoteDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        note={editingNote}
        onSave={handleSave}
      />
    </div>
  );
}
