export type LikertOption = { label: string; value: number };

export const likert4: LikertOption[] = [
  { label: 'Nunca', value: 0 },
  { label: 'Rara vez', value: 1 },
  { label: 'A veces', value: 2 },
  { label: 'Frecuentemente', value: 3 },
];

export const EAT26_SHORT = [
  { id: 'q1', text: 'Me preocupa comer alimentos con calorías.' },
  { id: 'q2', text: 'Me salto comidas.' },
  { id: 'q3', text: 'Me siento culpable después de comer.' },
  { id: 'q4', text: 'Controlo estrictamente qué y cuánto como.' },
  { id: 'q5', text: 'Me peso con frecuencia.' },
  { id: 'q6', text: 'Hago ejercicio excesivo para controlar mi peso.' },
];
