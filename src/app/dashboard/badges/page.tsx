import BadgePage from './badge';

// `badge.tsx` ya es un componente cliente que exporta por defecto `BadgePage`.
// Este archivo `page.tsx` permite que Next.js sirva la ruta /dashboard/badges
// porque el App Router mapea `src/app/.../page.tsx` a la URL correspondiente.

export default function Page() {
  return <BadgePage />;
}
