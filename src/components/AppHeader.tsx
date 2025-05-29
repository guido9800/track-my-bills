
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlusCircle, LayoutDashboard, Palette, Sun, Moon, Monitor, LogOut, LogIn, Database, Smartphone, UploadCloud } from 'lucide-react';
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
import { useState, useEffect, useCallback } from 'react';
import { useBills } from '@/hooks/useBills';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type StoragePreference = "local" | "cloud";

export function AppHeader() {
  const {
    appearanceMode,
    setAppearanceMode,
    colorScheme,
    setColorScheme
  } = useAppTheme();
  const { user, logout, loading: authLoading } = useAuth();
  const { getRawLocalBills, uploadLocalBillsToCloud, isLoading: billsLoading } = useBills(); // Get utilities from useBills
  const { toast } = useToast();

  const [iconVersion, setIconVersion] = useState<number | null>(null);
  const [storagePreference, setStoragePreference] = useState<StoragePreference>("local");
  const [localBillCountForSync, setLocalBillCountForSync] = useState(0);
  const [showUploadConfirmDialog, setShowUploadConfirmDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  console.log('[AppHeader] Rendering. User:', user ? user.uid : null, 'AuthLoading:', authLoading, 'Current Storage Pref:', storagePreference);

  useEffect(() => {
    console.log('[AppHeader] useEffect - User state updated:', user ? user.uid : null);
  }, [user]);

  useEffect(() => {
    console.log('[AppHeader] useEffect - AuthLoading state updated:', authLoading);
  }, [authLoading]);

  // Effect to load storage preference from localStorage and PWA icon version
  useEffect(() => {
    setIconVersion(Date.now());
    const savedPreference = localStorage.getItem("billtrack-storage-preference") as StoragePreference | null;
    if (savedPreference) {
      setStoragePreference(savedPreference);
      console.log('[AppHeader] Initial mount effect. Loaded storage preference:', savedPreference);
    } else {
      console.log('[AppHeader] Initial mount effect. No saved storage preference, default is local.');
    }
  }, []);
  
  // Effect to update local bill count for sync option
  useEffect(() => {
    if (user && storagePreference === 'cloud') {
      try {
        const count = getRawLocalBills().length;
        setLocalBillCountForSync(count);
        console.log('[AppHeader] Updated localBillCountForSync:', count);
      } catch (e) {
        console.error("[AppHeader] Error getting local bill count:", e);
        setLocalBillCountForSync(0);
      }
    } else {
      setLocalBillCountForSync(0);
    }
  }, [user, storagePreference, getRawLocalBills]);


  const handleStoragePreferenceChange = (value: string) => {
    const newPreference = value as StoragePreference;
    setStoragePreference(newPreference);
    localStorage.setItem("billtrack-storage-preference", newPreference);
    console.log('[AppHeader] Storage preference changed to:', newPreference);
    // useBills hook will react to this change via its own useEffect on storagePreference
  };

  const handleUploadAction = () => {
    if (localBillCountForSync > 0) {
      setShowUploadConfirmDialog(true);
    } else {
      toast({ title: "No Local Bills", description: "There are no local bills to upload." });
    }
  };

  const executeUpload = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to upload bills." });
      return;
    }
    setIsUploading(true);
    try {
      await uploadLocalBillsToCloud();
      toast({ title: "Upload Successful", description: `${localBillCountForSync} local bill(s) have been uploaded/merged to the cloud.` });
      // Re-check local bill count, might be zero if uploadLocalBillsToCloud clears them
      // or if they are now considered "synced"
      const updatedCount = getRawLocalBills().length; // Re-fetch count
      setLocalBillCountForSync(updatedCount); 
      // The useBills hook itself should handle reloading data from Firestore if it was modified.
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: error.message || "An unknown error occurred." });
    } finally {
      setIsUploading(false);
      setShowUploadConfirmDialog(false);
    }
  };

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

  // Conditional rendering for the entire header content based on auth loading state
  if (authLoading) {
    // You can put a more sophisticated loading skeleton for the header here if desired
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div style={{width: 28, height: 28}} className="rounded-sm bg-muted animate-pulse" />
            <span className="text-2xl font-bold text-primary">Track-My-Bills</span>
          </div>
          {/* Basic skeleton for buttons */}
          <div className="flex items-center gap-2">
             <div className="h-8 w-8 rounded-md bg-muted animate-pulse"></div>
             <div className="h-8 w-20 rounded-md bg-muted animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }


  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {iconVersion !== null ? (
              <Image
                src={`/icons/icon-192x192.png?v=${iconVersion}`}
                alt="Track-My-Bills App Icon"
                width={28}
                height={28}
                className="rounded-sm"
                key={iconVersion} // Add key to force re-render if iconVersion changes
              />
            ) : (
              <div style={{width: 28, height: 28}} className="rounded-sm bg-muted" /> // Placeholder during initial client render
            )}
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

            {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64"> {/* Increased width for new item */}
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem disabled className="text-xs text-muted-foreground overflow-hidden text-ellipsis">
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Storage Preference</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={storagePreference}
                      onValueChange={handleStoragePreferenceChange}
                    >
                      <DropdownMenuRadioItem value="local" className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        <span>Local Device</span>
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="cloud" className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        <span>Cloud Sync</span>
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    
                    {user && storagePreference === 'cloud' && localBillCountForSync > 0 && (
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault(); // Prevent menu from closing immediately
                          handleUploadAction();
                        }}
                        className="cursor-pointer group mt-1" // Added group for potential future styling
                        disabled={isUploading || billsLoading}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2 text-primary">
                            <UploadCloud className="h-4 w-4" />
                            <span>
                              {isUploading ? "Uploading..." : `Upload ${localBillCountForSync} local bill(s)`}
                            </span>
                          </div>
                           {isUploading && <span className="text-xs text-muted-foreground">Please wait...</span>}
                        </div>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive-foreground focus:bg-destructive/90" onSelect={logout}>
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
            }
          </div>
        </div>
      </header>
      {showUploadConfirmDialog && (
        <AlertDialog open={showUploadConfirmDialog} onOpenChange={setShowUploadConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Upload Local Bills to Cloud?</AlertDialogTitle>
              <AlertDialogDescription>
                You have {localBillCountForSync} bill(s) stored only on this device.
                Would you like to upload them to your cloud account?
                Bills in the cloud with the same ID will be updated/merged.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={executeUpload} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload to Cloud"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
