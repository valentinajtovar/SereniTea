'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare } from "lucide-react";

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CrisisModal = ({ isOpen, onClose }: CrisisModalProps) => {
  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-gray-800">No Estás Solo</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            Si estás en una crisis, por favor, busca ayuda. Hay ayuda disponible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="my-4">
            <p className="text-center text-gray-700">Contacta a tu psicólogo asignado inmediatamente para apoyo personal, o usa la línea nacional para ayuda 24/7.</p>
        </div>

        <div className="flex flex-col space-y-3">
            <Button variant="outline" className="bg-green-100 border-green-300 text-green-800 hover:bg-green-200">
                <MessageSquare className="mr-2 h-4 w-4" />
                Habla con tu grupo de apoyo, no lo olvides
            </Button>
            <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">Si esto no sirve, </p>
        </div>
            <a href="tel:988">
              <Button variant="outline" className="w-full border-gray-300">
                  <Phone className="mr-2 h-4 w-4" />
                  Llamar a la Línea de Crisis y Suicidio (988)
              </Button>
            </a>
        </div>
        
        <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">Recuerda, pedir ayuda es una señal de fortaleza.</p>
        </div>

        <AlertDialogCancel onClick={onClose} className="absolute top-2 right-2">X</AlertDialogCancel>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CrisisModal;
