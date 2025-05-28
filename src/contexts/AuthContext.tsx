
"use client";

import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('[AuthContext] Initializing, setting up onAuthStateChanged listener.');
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('[AuthContext] onAuthStateChanged triggered. currentUser:', currentUser);
      setUser(currentUser);
      setLoading(false);
    });
    return () => {
      console.log('[AuthContext] Cleaning up onAuthStateChanged listener.');
      unsubscribe();
    }
  }, []);

  const logout = async () => {
    console.log('[AuthContext] logout initiated.');
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      console.log('[AuthContext] Firebase sign out successful.');
      // localStorage.removeItem('billtrack_bills'); // Example
      router.push('/login');
    } catch (error) {
      console.error("[AuthContext] Error signing out: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Route Protection Logic
  useEffect(() => {
    console.log(`[AuthContext] Route protection effect. Loading: ${loading}, User: ${user ? user.uid : null}, Pathname: ${pathname}`);
    if (!loading) {
      const publicPaths = ['/login', '/signup'];
      const isPublicPath = publicPaths.includes(pathname);
      console.log(`[AuthContext] Pathname: ${pathname}, Is Public: ${isPublicPath}`);

      if (!user && !isPublicPath) {
        console.log('[AuthContext] Condition met: !user && !isPublicPath. Redirecting to /login.');
        router.push('/login');
      } else if (user && isPublicPath) {
        console.log('[AuthContext] Condition met: user && isPublicPath. Redirecting to /.');
        router.push('/');
      } else {
        console.log('[AuthContext] No redirect condition met.');
      }
    }
  }, [user, loading, pathname, router]);


  if (loading && !['/login', '/signup'].includes(pathname)) {
    console.log(`[AuthContext] Displaying loader for protected route: ${pathname}`);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading authentication...</p>
      </div>
    );
  }
  
  console.log(`[AuthContext] Rendering children. Loading: ${loading}, User: ${user ? user.uid : null}, Pathname: ${pathname}`);
  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
