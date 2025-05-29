
"use client";

import { useState, useEffect, useCallback }
from 'react';
import type { Bill } from '@/lib/types';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import type { StoragePreference } from '@/components/AppHeader';
import { firestore } from '@/lib/firebase'; // Import firestore
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp, // For potential future use with Firestore Timestamps
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'billtrack_bills';
const STORAGE_PREFERENCE_KEY = 'billtrack-storage-preference';

export function useBills() {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storagePreference, setStoragePreference] = useState<StoragePreference>('local');
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

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
    const loadBills = async () => {
      setIsLoading(true);
      setFirestoreError(null);
      console.log(`[useBills] Load effect triggered. User: ${user?.uid}, Pref: ${storagePreference}`);

      if (user && storagePreference === 'cloud') {
        console.log(`[useBills] User logged in (${user.uid}) and preference is cloud. Attempting to load from Firestore.`);
        try {
          const billsCollectionRef = collection(firestore, 'users', user.uid, 'bills');
          const q = query(billsCollectionRef); // Consider adding orderBy if using Firestore Timestamps
          const querySnapshot = await getDocs(q);
          const firestoreBills: Bill[] = [];
          querySnapshot.forEach((docSnap) => { // Renamed doc to docSnap to avoid conflict with firebase/firestore doc function
            const data = docSnap.data();
            // Assuming Firestore data matches Bill type. Date fields are already ISO strings.
            firestoreBills.push({ id: docSnap.id, ...data } as Bill);
          });
          setBills(firestoreBills);
          console.log("[useBills] Bills loaded from Firestore:", firestoreBills);
        } catch (error) {
          console.error("[useBills] Error loading bills from Firestore:", error);
          setFirestoreError("Failed to load bills from cloud. Please try again.");
          setBills([]); // Clear bills on error
        }
      } else {
        console.log(`[useBills] Using localStorage. User: ${user ? user.uid : 'none'}, Pref: ${storagePreference}`);
        try {
          const storedBills = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (storedBills) {
            setBills(JSON.parse(storedBills));
          } else {
            setBills([]);
          }
        } catch (error) {
          console.error("Failed to load bills from localStorage:", error);
          setBills([]);
        }
      }
      setIsLoading(false);
    };

    // Only load bills if user state is determined (not loading)
    // and if storage preference is known (though it defaults to 'local')
    if (!user && storagePreference === 'cloud') {
        console.log("[useBills] User not logged in, but preference is cloud. Clearing bills and waiting for login or pref change.");
        setBills([]);
        setIsLoading(false);
    } else {
        loadBills();
    }
  }, [user, storagePreference]);


  // Effect to save bills to localStorage (if preference is local)
  useEffect(() => {
    // Only save to localStorage if preference is local and not loading
    if (!isLoading && storagePreference === 'local') {
      console.log("[useBills] Saving bills to localStorage (preference is local).");
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bills));
      } catch (error) {
        console.error("Failed to save bills to localStorage:", error);
      }
    }
  }, [bills, isLoading, storagePreference]);

  const addBill = useCallback(async (newBillData: Omit<Bill, 'id' | 'paid' | 'createdAt'>) => {
    setFirestoreError(null);
    const clientGeneratedId = crypto.randomUUID(); // Generate ID for optimistic update and local state
    const billWithClientData: Bill = {
      ...newBillData,
      id: clientGeneratedId,
      paid: false,
      createdAt: new Date().toISOString(),
    };

    if (user && storagePreference === 'cloud') {
      console.log(`[useBills] Adding bill to Firestore for user ${user.uid}:`, newBillData);
      // Data to be stored in Firestore (without the client-generated ID)
      const firestoreBillData = {
        name: newBillData.name,
        amount: newBillData.amount,
        dueDate: newBillData.dueDate,
        category: newBillData.category,
        recurrenceType: newBillData.recurrenceType,
        recurrenceStartDate: newBillData.recurrenceStartDate,
        paid: false,
        createdAt: billWithClientData.createdAt,
      };
      try {
        const billsCollectionRef = collection(firestore, 'users', user.uid, 'bills');
        const docRef = await addDoc(billsCollectionRef, firestoreBillData);
        // Optimistically update local state with Firestore-generated ID
        setBills((prevBills) => [{ ...firestoreBillData, id: docRef.id } as Bill, ...prevBills.filter(b => b.id !== clientGeneratedId)]);
        console.log("[useBills] Bill added to Firestore with ID:", docRef.id);
      } catch (error) {
        console.error("[useBills] Error adding bill to Firestore:", error);
        setFirestoreError("Failed to add bill to cloud. Please try again.");
        // Optionally remove the optimistically added bill if Firestore fails
        setBills((prevBills) => prevBills.filter(b => b.id !== clientGeneratedId));
      }
    } else {
      setBills((prevBills) => [billWithClientData, ...prevBills]);
    }
  }, [user, storagePreference]);

  const updateBill = useCallback(async (updatedBill: Bill) => {
    setFirestoreError(null);
    if (user && storagePreference === 'cloud') {
      console.log(`[useBills] Updating bill in Firestore for user ${user.uid}:`, updatedBill);
      try {
        const billDocRef = doc(firestore, 'users', user.uid, 'bills', updatedBill.id);
        const { id, ...dataToUpdate } = updatedBill; // Exclude 'id' from data written to Firestore fields
        await updateDoc(billDocRef, dataToUpdate);
        setBills((prevBills) =>
          prevBills.map((bill) => (bill.id === updatedBill.id ? updatedBill : bill))
        );
        console.log("[useBills] Bill updated in Firestore:", updatedBill.id);
      } catch (error) {
        console.error("[useBills] Error updating bill in Firestore:", error);
        setFirestoreError("Failed to update bill in cloud. Please try again.");
      }
    } else {
      setBills((prevBills) =>
        prevBills.map((bill) => (bill.id === updatedBill.id ? updatedBill : bill))
      );
    }
  }, [user, storagePreference, bills]);

  const togglePaidStatus = useCallback(async (billId: string) => {
    setFirestoreError(null);
    const originalBills = bills; // Keep a copy for potential revert on error
    const billToUpdate = originalBills.find(b => b.id === billId);
    if (!billToUpdate) return;

    const newPaidStatus = !billToUpdate.paid;

    // Optimistic UI update
    setBills((prevBills) =>
      prevBills.map((bill) =>
        bill.id === billId ? { ...bill, paid: newPaidStatus } : bill
      )
    );

    if (user && storagePreference === 'cloud') {
      console.log(`[useBills] Toggling paid status in Firestore for bill ${billId} (user ${user.uid}) to ${newPaidStatus}`);
      try {
        const billDocRef = doc(firestore, 'users', user.uid, 'bills', billId);
        await updateDoc(billDocRef, { paid: newPaidStatus });
        console.log("[useBills] Bill paid status toggled in Firestore:", billId);
      } catch (error) {
        console.error("[useBills] Error toggling paid status in Firestore:", error);
        setFirestoreError("Failed to update bill status in cloud. Please try again.");
        setBills(originalBills); // Revert optimistic update on error
      }
    }
  }, [bills, user, storagePreference]);

  const deleteBill = useCallback(async (billId: string) => {
    setFirestoreError(null);
    const originalBills = bills; // Keep for revert
    
    // Optimistic UI update
    setBills((prevBills) => prevBills.filter((bill) => bill.id !== billId));

    if (user && storagePreference === 'cloud') {
      console.log(`[useBills] Deleting bill from Firestore for bill ${billId} (user ${user.uid})`);
      try {
        const billDocRef = doc(firestore, 'users', user.uid, 'bills', billId);
        await deleteDoc(billDocRef);
        console.log("[useBills] Bill deleted from Firestore:", billId);
      } catch (error) {
        console.error("[useBills] Error deleting bill from Firestore:", error);
        setFirestoreError("Failed to delete bill from cloud. Please try again.");
        setBills(originalBills); // Revert optimistic update
      }
    }
  }, [user, storagePreference, bills]);

  const getBillsForMonth = useCallback((date: Date): Bill[] => {
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
    return bills.find(bill => bill.id === id);
  }, [bills]);

  const sortBills = useCallback((billsToSort: Bill[]): Bill[] => {
    return [...billsToSort].sort((a, b) => {
      if (a.paid !== b.paid) {
        return a.paid ? 1 : -1;
      }
      try {
        return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime();
      } catch (error) {
        return 0;
      }
    });
  }, []);

  return {
    bills,
    isLoading,
    storagePreference,
    firestoreError, 
    addBill,
    updateBill,
    togglePaidStatus,
    deleteBill,
    getBillsForMonth,
    getBillById,
    sortBills,
  };
}

    