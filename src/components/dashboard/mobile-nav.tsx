'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, View } from 'lucide-react';
import { Icons } from '@/components/icons';

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <Link
          href="/dashboard"
          className="mr-6 flex items-center space-x-2"
          onClick={() => setOpen(false)}
        >
          <Icons.logo className="h-6 w-6" />
          <span className="font-bold">Serenitea</span>
        </Link>
        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            <Link
              href="/dashboard"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === '/dashboard' ? 'text-foreground' : 'text-foreground/60'
              )}
              onClick={() => setOpen(false)}
            >
              Panel Principal
            </Link>
            <Link
              href="/dashboard/diario"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === '/dashboard/diario' ? 'text-foreground' : 'text-foreground/60'
              )}
              onClick={() => setOpen(false)}
            >
              Diario
            </Link>
            <Link
              href="/dashboard/tasks"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === '/dashboard/tasks' ? 'text-foreground' : 'text-foreground/60'
              )}
              onClick={() => setOpen(false)}
            >
              Tareas
            </Link>
            <Link
              href="/dashboard/badges"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === '/dashboard/badges' ? 'text-foreground' : 'text-foreground/60'
              )}
              onClick={() => setOpen(false)}
            >
              Logros
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
