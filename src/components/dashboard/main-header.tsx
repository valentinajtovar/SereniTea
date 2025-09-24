'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import CrisisModal from './crisis-modal';
import { ShieldQuestion, Leaf } from 'lucide-react'; // <-- 1. Import Leaf icon
import Link from 'next/link'; // <-- 2. Import Link for navigation

const MainHeader = () => {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
            {/* 3. Replaced Image with the icon and text structure */}
            <Link href="/" className="flex items-center gap-2" aria-label="Back to homepage">
                <Leaf className="h-7 w-7 text-purple-100 bg-purple-600/90 p-1 rounded-md" />
                <span className="text-xl font-bold font-headline text-gray-800">SereniTea</span>
            </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600 font-medium">
            <a href="/dashboard" className="hover:text-purple-600">Panel</a>
            <a href="/forum" className="hover:text-purple-600">Foro</a>
            <a href="#" className="hover:text-purple-600">Descubrir</a>
          </nav>
        </div>
        <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white rounded-lg" onClick={() => setModalOpen(true)}>
          <ShieldQuestion className="mr-2 h-4 w-4" />
          Soporte en Crisis
        </Button>
      </header>
      <CrisisModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default MainHeader;
