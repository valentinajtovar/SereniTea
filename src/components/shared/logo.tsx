import Link from 'next/link';
import { Leaf } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Back to homepage">
      <Leaf className="h-6 w-6 text-primary-foreground bg-primary/90 p-1 rounded-md" />
      <span className="text-xl font-bold font-headline">SereniTea</span>
    </Link>
  );
}
