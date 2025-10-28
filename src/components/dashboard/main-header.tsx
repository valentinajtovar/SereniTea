'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase-client';
import { MainNav } from '@/components/dashboard/main-nav';
import { MobileNav } from '@/components/dashboard/mobile-nav';
import { UserNav } from '@/components/dashboard/user-nav';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function MainHeader() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const displayName = user?.displayName || 'Usuario';

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ description: "Has cerrado sesión exitosamente." });
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión: ', error);
      toast({ 
        title: "Error", 
        description: "No se pudo cerrar la sesión. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <MainNav />
        <MobileNav />
        <div className="flex items-center space-x-4">
          <p className="hidden text-sm font-medium sm:block">
            Hola, {displayName}
          </p>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
