
'use client';

import { useState, useEffect } from 'react';
import { MoreHorizontal, Trash2, Edit, CheckCircle2 } from 'lucide-react';
import { auth } from '@/lib/firebase-client';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

const formatDetailedDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const timeString = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `${date.toLocaleDateString('es-ES')} a las ${timeString}`;
};

const AllJournalEntries = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const fetchJournalEntries = async () => {
        setIsLoading(true);
        const user = auth.currentUser;

        if (!user) {
            setIsLoading(false);
            return;
        }

        try {
            const token = await user.getIdToken();
            const response = await fetch(`/api/journal`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch entries');
            }

            const data = await response.json();
            setEntries(data);
        } catch (error) {
            console.error("Error fetching journal entries: ", error);
            toast({ title: "Error", description: "No se pudieron cargar las entradas del diario.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    fetchJournalEntries();
  }, [toast]);

  const handleDeleteClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEntry) return;
    const user = auth.currentUser;
    if (!user) return;

    try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/journal?id=${selectedEntry._id}`, { 
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to delete entry');
        
        setEntries(prevEntries => prevEntries.filter(entry => entry._id !== selectedEntry._id));
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
    const user = auth.currentUser;
    if (!user) return;

    try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/journal?id=${selectedEntry._id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ journal: editText }),
        });

        if (!response.ok) throw new Error('Failed to update entry');

        const updatedEntry = await response.json();
        setEntries(prevEntries => prevEntries.map(entry => entry._id === updatedEntry._id ? updatedEntry : entry));
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
      <Card className="shadow-lg">
        <CardHeader><CardTitle>Tu Diario</CardTitle><CardDescription>Un espacio para todas tus reflexiones.</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-purple-500" /><p className="ml-2 text-gray-500">Cargando...</p></div>
          ) : entries.length === 0 ? (
            <p className="text-center text-gray-500 italic py-4">No tienes entradas en tu diario.</p>
          ) : (
            <div className="space-y-4">
              {entries.map(entry => (
                  <div key={entry._id} className="p-3 bg-white rounded-lg shadow-sm group">
                      <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 text-2xl">{entry.emotionEmoji}</div>
                          <div className="flex-grow">
                              <p className="text-gray-800 font-semibold">{entry.mainEmotion} - {entry.subEmotion}</p>
                              <p className="text-gray-600 break-words mt-1">{entry.journal}</p>
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
              ))}
              </div>
          )}
        </CardContent>
      </Card>

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
}

export default AllJournalEntries;
