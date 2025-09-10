import Link from "next/link";
import {
  BookOpen,
  LayoutGrid,
  MessageSquare,
  Phone,
  Sparkles,
  HelpCircle,
  MessageCircle,
  Menu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Logo } from "./logo";
import { Separator } from "../ui/separator";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Logo />
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            <LayoutGrid className="w-4 h-4 mr-1 inline-block" />
            Panel
          </Link>
          <Link
            href="/forum"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            <MessageSquare className="w-4 h-4 mr-1 inline-block" />
            Foro
          </Link>
          <Link
            href="/discover"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            <Sparkles className="w-4 h-4 mr-1 inline-block" />
            Descubrir
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-xs sm:text-sm px-2 sm:px-4">
                <HelpCircle className="mr-1 sm:mr-2 h-4 w-4" /> 
                <span className="hidden sm:inline">Soporte en Crisis</span>
                <span className="sm:hidden">Crisis</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">
                  No Estás Solo
                </DialogTitle>
                <DialogDescription>
                  Si estás en una crisis, por favor, busca ayuda. Hay ayuda disponible.
                </DialogDescription>
              </DialogHeader>
              <Separator />
              <div className="py-4 space-y-4">
                <p>
                  Contacta a tu psicólogo asignado inmediatamente para apoyo personal, o usa la línea nacional para ayuda 24/7.
                </p>
                <Button className="w-full" asChild>
                  <a href="tel:123-456-7890">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contactar a tu Psicólogo
                  </a>
                </Button>
                <Button variant="secondary" className="w-full" asChild>
                  <a href="tel:988">
                    <Phone className="mr-2 h-4 w-4" />
                    Llamar a la Línea de Crisis y Suicidio (988)
                  </a>
                </Button>
              </div>
              <DialogFooter>
                <p className="text-sm text-muted-foreground text-center w-full">Recuerda, pedir ayuda es una señal de fortaleza.</p>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col gap-4 py-4">
                  <SheetClose asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                      <LayoutGrid className="w-5 h-5" /> Panel
                    </Link>
                  </SheetClose>
                   <SheetClose asChild>
                    <Link href="/forum" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                      <MessageSquare className="w-5 h-5" /> Foro
                    </Link>
                  </SheetClose>
                   <SheetClose asChild>
                    <Link href="/discover" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                      <Sparkles className="w-5 h-5" /> Descubrir
                    </Link>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
