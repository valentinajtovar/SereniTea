'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { JournalEntry } from "./journal-entries"; // Assuming type export from journal-entries

// 1. Define colors for each primary emotion
const moodColors: { [key: string]: string } = {
  Alegria: 'bg-green-400 hover:bg-green-500',
  Calma: 'bg-blue-400 hover:bg-blue-500',
  Sorpresa: 'bg-yellow-400 hover:bg-yellow-500',
  Tristeza: 'bg-gray-400 hover:bg-gray-500',
  Enojo: 'bg-red-400 hover:bg-red-500',
  default: 'bg-gray-200 hover:bg-gray-300'
};

const MoodTracker = ({ entries }: { entries: JournalEntry[] }) => {

  // Helper to format date for the tooltip
  const formatTooltipDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      <h3 className="font-headline text-xl text-gray-700 mb-4">Tu Historial de Ánimo</h3>
      <p className="text-sm text-gray-500 mb-4">
        Cada bloque representa un día. Pasa el cursor sobre ellos para ver los detalles.
      </p>
      <TooltipProvider>
        <div className="flex flex-wrap gap-2">
          {entries.length > 0 ? (
            // We reverse the array to show the oldest first in the tracker
            [...entries].reverse().map(entry => (
              <Tooltip key={entry.id}>
                <TooltipTrigger asChild>
                  <div className={`w-8 h-8 rounded-md cursor-pointer transition-all`}>
                     <div className={`w-full h-full rounded-md ${moodColors[entry.mainEmotion] || moodColors.default}`} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{entry.mainEmotion} ({entry.emotionEmoji})</p>
                  <p className="text-xs text-gray-600">{formatTooltipDate(entry.createdAt.toDate())}</p>
                </TooltipContent>
              </Tooltip>
            ))
          ) : (
            <p className="text-gray-400 italic text-sm">No hay datos suficientes para mostrar el historial.</p>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default MoodTracker;
