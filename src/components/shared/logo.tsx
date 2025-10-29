import Link from 'next/link';
import { Leaf } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Back to homepage">
       <img src="/logo.png" alt="Logo SereniTea" className="h-8 w-8" />
      <span className="text-xl font-bold font-headline">SereniTea</span>
    </Link>
  );
}
