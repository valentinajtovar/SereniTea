'use client';

import { useState } from 'react';
import { doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { MoreHorizontal, Trash2, Edit, CheckCircle2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { type JournalEntry } from '@/types';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from '@/components/ui/textarea';

const formatDetailedDate = (timestamp: Timestamp) => {
  const date = timestamp.toDate();
  const timeString = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  return `${date.toLocaleDateString('es-ES')} a las ${timeString}`;
};

// Make this a presentational component
const JournalEntries = ({ entries, isLoading }: { entries: JournalEntry[], isLoading: boolean }) => {
  const { toast } = useToast();

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editText, setEditText] = useState("");

  const handleDeleteClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEntry) return;

    try {
      await deleteDoc(doc(db, "journal_entries", selectedEntry.id));
      toast({ title: "Entrada eliminada", description: "Tu entrada del diario ha sido borrada permanentemente." });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar la entrada.", variant: "destructive" });
    }
    setIsDeleteAlertOpen(false);
    setSelectedEntry(null);
  };

  const handleEditClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setEditText(entry.journal);
    setIsEditDialogOpen(true);
  };

  const handleConfirmEdit = async () => {
    if (!selectedEntry || !editText.trim()) return;

    const entryRef = doc(db, "journal_entries", selectedEntry.id);

    try {
      await updateDoc(entryRef, { journal: editText });
      toast({ title: "Entrada actualizada", action: <CheckCircle2 className="text-green-500" /> });
    } catch (error) {
        toast({ title: "Error", description: "No se pudo actualizar la entrada.", variant: "destructive" });
    }
    setIsEditDialogOpen(false);
    setSelectedEntry(null);
    setEditText("");
  };

  return (
    <>
      <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-gray-700">Tus Entradas Recientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
             <p className="text-gray-500 italic">Cargando entradas...</p>
          ) : entries.length > 0 ? (
            entries.map(entry => (
              <div key={entry.id} className="border-b border-purple-100 pb-3 last:border-b-0 group">
                <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-grow">
                        <p className="text-sm font-semibold text-gray-800">
                            {entry.emotionEmoji} {entry.mainEmotion}
                        </p>
                        <p className="text-sm text-gray-600 break-words mt-1">
                            {entry.journal}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">{formatDetailedDate(entry.createdAt)}</p>
                    </div>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0 h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(entry)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(entry)} className="text-red-500">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Eliminar</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">Aún no tienes entradas en tu diario.</p>
          )}
        </CardContent>
      </Card>

      {/* --- Dialogs for Edit/Delete --- */}
       <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que quieres eliminar esta entrada?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La entrada se borrará permanentemente de nuestros servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Entrada del Diario</DialogTitle>
          </DialogHeader>
          <Textarea 
            value={editText} 
            onChange={(e) => setEditText(e.target.value)} 
            className="min-h-[200px] my-4"
            placeholder='Escribe aquí tu entrada...'
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleConfirmEdit}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JournalEntries;
