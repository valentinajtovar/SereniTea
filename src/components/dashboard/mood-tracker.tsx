'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type JournalEntry } from "@/types";

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
      <h3 className="font-headline text-2xl text-gray-800 mb-4">Tu Historial de Ánimo</h3>
      <TooltipProvider>
        <div className="flex items-center space-x-1 h-12 bg-gray-100 rounded-lg p-2">
          {entries.length > 0 ? (
            entries.slice(0, 30).reverse().map(entry => (
              <Tooltip key={entry._id}>
                <TooltipTrigger asChild>
                  <div 
                    className={`w-full h-full rounded-md cursor-pointer transition-colors duration-300 ${moodColors[entry.mainEmotion] || moodColors.default}`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{entry.mainEmotion} ({entry.emotionEmoji})</p>
                  <p className="text-xs text-gray-600">{formatTooltipDate(new Date(entry.createdAt))}</p>
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
