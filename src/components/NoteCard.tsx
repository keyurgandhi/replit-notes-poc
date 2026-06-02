import { Note } from "@/hooks/use-notes";
import { format } from "date-fns";
import { Trash2, Edit3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this note?")) {
      onDelete(note.id);
    }
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-md transition-all duration-300 bg-card border-card-border overflow-hidden flex flex-col h-[280px]"
      onClick={() => onEdit(note)}
      data-testid={`card-note-${note.id}`}
    >
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-xl font-serif line-clamp-1 group-hover:text-primary transition-colors">
          {note.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden relative">
        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm">
          {note.content}
        </p>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
      </CardContent>
      <CardFooter className="pt-4 border-t border-border/50 shrink-0 flex items-center justify-between text-xs text-muted-foreground">
        <span>{format(new Date(note.updatedAt), "MMM d, yyyy")}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={(e) => { e.stopPropagation(); onEdit(note); }}
            data-testid={`button-edit-${note.id}`}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            data-testid={`button-delete-${note.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
