'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
      <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
        <Icons.logo className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">Serenitea</span>
      </Link>
      <Link
        href="/dashboard"
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary',
          pathname === '/dashboard' ? 'text-foreground' : 'text-foreground/60'
        )}
      >
        Panel Principal
      </Link>
      <Link
        href="/dashboard/diario"
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary',
          pathname === '/dashboard/diario' ? 'text-foreground' : 'text-foreground/60'
        )}
      >
        Diario
      </Link>
      <Link
        href="/dashboard/tasks"
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary',
          pathname === '/dashboard/tasks' ? 'text-foreground' : 'text-foreground/60'
        )}
      >
        Tareas
      </Link>
    </nav>
  );
}
