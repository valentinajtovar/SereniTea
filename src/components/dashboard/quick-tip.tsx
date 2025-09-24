'use client';

import { Lightbulb } from 'lucide-react';

const QuickTip = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center mb-2">
        <Lightbulb className="h-5 w-5 text-yellow-400 mr-2" />
        <h4 className="font-semibold text-gray-700">Consejo Rápido</h4>
      </div>
      <p className="text-sm text-gray-600">
        Recuerda ser amable contigo mismo hoy. Cada pequeño paso es un progreso. Prueba un ejercicio de mindfulness de 5 minutos si te sientes abrumado.
      </p>
    </div>
  );
};

export default QuickTip;
