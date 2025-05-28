"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, LayoutDashboard } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-primary">
            <path d="M19 5c-1.5 0-3 .7-4 2s-2.5 2-4 2-3-.7-4-2S5 5 3.5 5"/>
            <path d="M12 12h2"/>
            <path d="M12 16h4"/>
            <path d="M12 8h1"/>
            <path d="M5 21V5c0-1.7 1.3-3 3-3h8c1.7 0 3 1.3 3 3v16"/>
            <path d="M12 3v18"/>
          </svg>
          <span className="text-2xl font-bold text-primary">BillTrack</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/" passHref>
            <Button variant="ghost" size="icon" aria-label="Dashboard">
              <LayoutDashboard className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/add-bill" passHref>
            <Button variant="default" size="sm">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Bill
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
