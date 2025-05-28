
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlusCircle, LayoutDashboard, Palette, Sun, Moon, Monitor, LogOut, LogIn } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppTheme } from "@/components/ThemeProvider";
import type { ColorScheme, AppearanceMode } from "@/components/ThemeProvider";
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from 'react'; // Import useState and useEffect

export function AppHeader() {
  const { 
    appearanceMode, 
    setAppearanceMode, 
    colorScheme, 
    setColorScheme 
  } = useAppTheme();
  const { user, logout, loading } = useAuth();
  const [iconVersion, setIconVersion] = useState(Date.now()); // Add state for cache busting

  // This effect is not strictly necessary for Date.now() but useful if you wanted to update it on some event
  // For now, Date.now() in the src will change on re-renders.
  // If you want to force a refresh less often, you could update iconVersion based on some other trigger.

  const colorSchemes: {value: ColorScheme, label: string}[] = [
    { value: "teal", label: "Teal"},
    { value: "blue", label: "Blue (Default)" },
    { value: "orange", label: "Orange" },
  ];

  const appearanceModes: {value: AppearanceMode, label: string, icon: React.ElementType}[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const getInitials = (email?: string | null) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  // Function to manually refresh icon for testing (optional)
  // const refreshIcon = () => setIconVersion(Date.now());

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src={`/icons/icon-192x192.png?v=${iconVersion}`} // Added cache-busting query parameter
            alt="Track-My-Bills App Icon" 
            width={28} 
            height={28}
            className="rounded-sm"
            key={iconVersion} // Adding key prop also helps React re-render the Image component
          />
          <span className="text-2xl font-bold text-primary">Track-My-Bills</span>
        </Link>
        <div className="flex items-center gap-2">
          {user && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/" passHref>
                    <Button variant="ghost" size="icon" aria-label="Dashboard">
                      <LayoutDashboard className="h-5 w-5" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Main Dashboard</p>
                </TooltipContent>
              </Tooltip>
              <Link href="/add-bill" passHref>
                <Button variant="default" size="sm">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add Bill
                </Button>
              </Link>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Change theme">
                <Palette className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Color Scheme</DropdownMenuLabel>
              <DropdownMenuRadioGroup 
                value={colorScheme} 
                onValueChange={(value) => setColorScheme(value as ColorScheme)}
              >
                {colorSchemes.map((scheme) => (
                  <DropdownMenuRadioItem key={scheme.value} value={scheme.value}>
                    {scheme.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Appearance</DropdownMenuLabel>
              <DropdownMenuRadioGroup 
                value={appearanceMode || "system"} 
                onValueChange={(value) => setAppearanceMode(value as AppearanceMode)}
              >
                {appearanceModes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <DropdownMenuRadioItem key={mode.value} value={mode.value} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{mode.label}</span>
                    </DropdownMenuRadioItem>
                  );
                })}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {!loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {/* <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "User"} /> */}
                      <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onSelect={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" passHref>
                <Button variant="outline" size="sm">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
