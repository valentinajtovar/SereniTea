import Link from "next/link";
import {
  LayoutGrid,
  ClipboardList,
  Users,
  Menu,
} from "lucide-react";

import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

export function PsychologistHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Logo />
        </div>
        <nav className="hidden md:flex items-center gap-4 sm:gap-6 text-sm">
          <Link
            href="/dashboard/psychologist"
            className="transition-colors hover:text-foreground/80 text-foreground"
          >
            <LayoutGrid className="w-4 h-4 mr-1 hidden sm:inline-block" />
            Panel
          </Link>
          <Link
            href="/dashboard/psychologist/patients"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            <Users className="w-4 h-4 mr-1 hidden sm:inline-block" />
            Pacientes
          </Link>
          <Link
            href="/dashboard/psychologist/tasks"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            <ClipboardList className="w-4 h-4 mr-1 hidden sm:inline-block" />
            Tareas
          </Link>
        </nav>
        <div className="md:hidden flex-1">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
               <div className="py-4">
                 <Logo />
               </div>
               <div className="flex flex-col gap-4 py-4">
                  <SheetClose asChild>
                    <Link href="/dashboard/psychologist" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                      <LayoutGrid className="w-5 h-5" /> Panel
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/dashboard/psychologist/patients" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                      <Users className="w-5 h-5" /> Pacientes
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/dashboard/psychologist/tasks" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                      <ClipboardList className="w-5 h-5" /> Tareas
                    </Link>
                  </SheetClose>
                </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="md:hidden">
            <Logo />
        </div>
      </div>
    </header>
  );
}
