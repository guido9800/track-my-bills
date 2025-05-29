
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Bill } from '@/lib/types';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import type { StoragePreference } from '@/components/AppHeader'; // Import StoragePreference type

const LOCAL_STORAGE_KEY = 'billtrack_bills';
const STORAGE_PREFERENCE_KEY = 'billtrack-storage-preference';

export function useBills() {
  const { user } = useAuth(); // Get current user
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storagePreference, setStoragePreference] = useState<StoragePreference>('local');

  // Effect to load storage preference
  useEffect(() => {
    try {
      const savedPreference = localStorage.getItem(STORAGE_PREFERENCE_KEY) as StoragePreference | null;
      if (savedPreference) {
        setStoragePreference(savedPreference);
      }
    } catch (error) {
      console.error("Failed to load storage preference from localStorage:", error);
    }
  }, []);


  // Effect to load bills based on user and storage preference
  useEffect(() => {
    setIsLoading(true);
    if (user && storagePreference === 'cloud') {
      console.log(`[useBills] User logged in (${user.uid}) and preference is cloud. TODO: Implement Firestore loading.`);
      // TODO: Implement Firestore loading logic here
      // For now, clear local bills if switching to cloud and not yet implemented, or load empty
      setBills([]); 
      setIsLoading(false);
    } else {
      console.log(`[useBills] Using localStorage. User: ${user ? user.uid : 'none'}, Preference: ${storagePreference}`);
      try {
        const storedBills = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedBills) {
          setBills(JSON.parse(storedBills));
        } else {
          setBills([]); // Initialize with empty array if nothing in localStorage
        }
      } catch (error) {
        console.error("Failed to load bills from localStorage:", error);
        setBills([]); // Initialize with empty array on error
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, storagePreference]);


  // Effect to save bills to localStorage (if preference is local)
  useEffect(() => {
    if (!isLoading && storagePreference === 'local') {
      console.log("[useBills] Saving bills to localStorage (preference is local).");
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bills));
      } catch (error) {
        console.error("Failed to save bills to localStorage:", error);
      }
    }
  }, [bills, isLoading, storagePreference]);

  const addBill = useCallback((newBillData: Omit<Bill, 'id' | 'paid' | 'createdAt'>) => {
    const newBill: Bill = {
      ...newBillData,
      id: crypto.randomUUID(),
      paid: false,
      createdAt: new Date().toISOString(),
    };

    if (user && storagePreference === 'cloud') {
      console.log(`[useBills] TODO: Add bill to Firestore for user ${user.uid}:`, newBill);
      // Placeholder: In a real scenario, you'd add to Firestore and then update local state
      // or refetch. For now, we'll optimistically update local state for UI responsiveness.
      setBills((prevBills) => [...prevBills, newBill]); 
    } else {
      setBills((prevBills) => [...prevBills, newBill]);
    }
  }, [user, storagePreference]);

  const updateBill = useCallback((updatedBill: Bill) => {
     if (user && storagePreference === 'cloud') {
      console.log(`[useBills] TODO: Update bill in Firestore for user ${user.uid}:`, updatedBill);
      // Placeholder for Firestore update logic
      setBills((prevBills) =>
        prevBills.map((bill) => (bill.id === updatedBill.id ? updatedBill : bill))
      );
    } else {
      setBills((prevBills) =>
        prevBills.map((bill) => (bill.id === updatedBill.id ? updatedBill : bill))
      );
    }
  }, [user, storagePreference]);
  
  const togglePaidStatus = useCallback((billId: string) => {
    const billToUpdate = bills.find(b => b.id === billId);
    if (!billToUpdate) return;

    const newPaidStatus = !billToUpdate.paid;

    if (user && storagePreference === 'cloud') {
      console.log(`[useBills] TODO: Toggle paid status in Firestore for bill ${billId} (user ${user.uid}) to ${newPaidStatus}`);
      // Placeholder
      setBills((prevBills) =>
        prevBills.map((bill) =>
          bill.id === billId ? { ...bill, paid: newPaidStatus } : bill
        )
      );
    } else {
      setBills((prevBills) =>
        prevBills.map((bill) =>
          bill.id === billId ? { ...bill, paid: newPaidStatus } : bill
        )
      );
    }
  }, [bills, user, storagePreference]);

  const deleteBill = useCallback((billId: string) => {
    if (user && storagePreference === 'cloud') {
      console.log(`[useBills] TODO: Delete bill from Firestore for bill ${billId} (user ${user.uid})`);
      // Placeholder
      setBills((prevBills) => prevBills.filter((bill) => bill.id !== billId));
    } else {
      setBills((prevBills) => prevBills.filter((bill) => bill.id !== billId));
    }
  }, [user, storagePreference]);

  const getBillsForMonth = useCallback((date: Date): Bill[] => {
    // This function filters the currently loaded 'bills' state.
    // Firestore fetching for a specific month would happen in the main loading effect.
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    return bills.filter(bill => {
      try {
        const dueDate = parseISO(bill.dueDate);
        return isWithinInterval(dueDate, { start: monthStart, end: monthEnd });
      } catch (error) {
        console.error(`Invalid due date for bill ${bill.id}: ${bill.dueDate}`);
        return false;
      }
    });
  }, [bills]);

  const getBillById = useCallback((id: string): Bill | undefined => {
    // This function searches the currently loaded 'bills' state.
    return bills.find(bill => bill.id === id);
  }, [bills]);

  const sortBills = useCallback((billsToSort: Bill[]): Bill[] => {
    return [...billsToSort].sort((a, b) => {
      if (a.paid !== b.paid) {
        return a.paid ? 1 : -1; // Unpaid bills first
      }
      try {
        return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime(); // Then sort by due date
      } catch (error) {
         // if dates are invalid, keep original order relative to each other
        return 0;
      }
    });
  }, []);

  return {
    bills,
    isLoading,
    storagePreference, // Expose storagePreference if UI needs to react to it elsewhere
    addBill,
    updateBill,
    togglePaidStatus,
    deleteBill,
    getBillsForMonth,
    getBillById,
    sortBills,
  };
}
