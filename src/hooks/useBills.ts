
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
  // Timestamp, // Not using Firestore Timestamps directly for date fields in this iteration
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
    } catch (error)
{
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
          const q = query(billsCollectionRef); // Consider adding orderBy for consistent ordering, e.g., orderBy('dueDate')
          const querySnapshot = await getDocs(q);
          const firestoreBills: Bill[] = [];
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            // Firestore data should match Bill type structure. Dates are stored as ISO strings.
            firestoreBills.push({
              id: docSnap.id,
              name: data.name,
              amount: data.amount,
              dueDate: data.dueDate, // Assuming stored as ISO string
              paid: data.paid,
              category: data.category,
              createdAt: data.createdAt, // Assuming stored as ISO string
              recurrenceType: data.recurrenceType,
              recurrenceStartDate: data.recurrenceStartDate,
            } as Bill);
          });
          setBills(firestoreBills);
          console.log("[useBills] Bills loaded from Firestore:", firestoreBills.length);
        } catch (error: any) {
          console.error("[useBills] Error loading bills from Firestore:", error);
          setFirestoreError(`Failed to load bills from cloud: ${error.message}`);
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

    if (!user && storagePreference === 'cloud') {
        console.log("[useBills] User not logged in, but preference is cloud. Clearing bills and waiting for login or pref change.");
        setBills([]);
        setIsLoading(false); // Stop loading if no user and cloud preference
    } else {
        loadBills();
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

  const addBill = useCallback(async (newBillData: Omit<Bill, 'id' | 'paid' | 'createdAt'>) => {
    setIsLoading(true);
    setFirestoreError(null);
    const createdAtISO = new Date().toISOString();

    if (user && storagePreference === 'cloud') {
      console.log(`[useBills] Adding bill to Firestore for user ${user.uid}:`, newBillData.name);
      const firestoreBillData = {
        ...newBillData,
        paid: false,
        createdAt: createdAtISO,
      };
      try {
        const billsCollectionRef = collection(firestore, 'users', user.uid, 'bills');
        const docRef = await addDoc(billsCollectionRef, firestoreBillData);
        const newBillWithId: Bill = { ...firestoreBillData, id: docRef.id };
        setBills((prevBills) => [newBillWithId, ...prevBills]);
        console.log("[useBills] Bill added to Firestore with ID:", docRef.id);
      } catch (error: any) {
        console.error("[useBills] Error adding bill to Firestore:", error);
        setFirestoreError(`Failed to add bill to cloud: ${error.message}`);
      }
    } else {
      const billWithClientData: Bill = {
        ...newBillData,
        id: crypto.randomUUID(),
        paid: false,
        createdAt: createdAtISO,
      };
      setBills((prevBills) => [billWithClientData, ...prevBills]);
      console.log("[useBills] Bill added to localStorage:", billWithClientData.id);
    }
    setIsLoading(false);
  }, [user, storagePreference]);

  const updateBill = useCallback(async (updatedBill: Bill) => {
    setIsLoading(true);
    setFirestoreError(null);
    if (user && storagePreference === 'cloud') {
      console.log(`[useBills] Updating bill in Firestore for user ${user.uid}:`, updatedBill.id);
      try {
        const billDocRef = doc(firestore, 'users', user.uid, 'bills', updatedBill.id);
        // Ensure we don't try to write 'id' as a field if it's the document ID
        const { id, ...dataToUpdate } = updatedBill;
        await updateDoc(billDocRef, dataToUpdate);
        setBills((prevBills) =>
          prevBills.map((bill) => (bill.id === updatedBill.id ? updatedBill : bill))
        );
        console.log("[useBills] Bill updated in Firestore:", updatedBill.id);
      } catch (error: any) {
        console.error("[useBills] Error updating bill in Firestore:", error);
        setFirestoreError(`Failed to update bill in cloud: ${error.message}`);
      }
    } else {
      setBills((prevBills) =>
        prevBills.map((bill) => (bill.id === updatedBill.id ? updatedBill : bill))
      );
      console.log("[useBills] Bill updated in localStorage:", updatedBill.id);
    }
    setIsLoading(false);
  }, [user, storagePreference]);

  const togglePaidStatus = useCallback(async (billId: string) => {
    setFirestoreError(null);
    const billToUpdate = bills.find(b => b.id === billId);
    if (!billToUpdate) return;

    const newPaidStatus = !billToUpdate.paid;
    const updatedBill = { ...billToUpdate, paid: newPaidStatus };

    // Optimistic UI update
    setBills((prevBills) =>
      prevBills.map((bill) => (bill.id === billId ? updatedBill : bill))
    );

    if (user && storagePreference === 'cloud') {
      console.log(`[useBills] Toggling paid status in Firestore for bill ${billId} (user ${user.uid}) to ${newPaidStatus}`);
      try {
        const billDocRef = doc(firestore, 'users', user.uid, 'bills', billId);
        await updateDoc(billDocRef, { paid: newPaidStatus });
        console.log("[useBills] Bill paid status toggled in Firestore:", billId);
      } catch (error: any) {
        console.error("[useBills] Error toggling paid status in Firestore:", error);
        setFirestoreError(`Failed to update bill status in cloud: ${error.message}`);
        // Revert optimistic update on error
        setBills((prevBills) =>
          prevBills.map((bill) => (bill.id === billId ? billToUpdate : bill))
        );
      }
    } else {
        console.log("[useBills] Bill status toggled in localStorage:", billId);
    }
  }, [bills, user, storagePreference]);

  const deleteBill = useCallback(async (billId: string) => {
    setFirestoreError(null);
    const billsBeforeDelete = bills; // For potential revert

    // Optimistic UI update
    setBills((prevBills) => prevBills.filter((bill) => bill.id !== billId));

    if (user && storagePreference === 'cloud') {
      console.log(`[useBills] Deleting bill from Firestore for bill ${billId} (user ${user.uid})`);
      try {
        const billDocRef = doc(firestore, 'users', user.uid, 'bills', billId);
        await deleteDoc(billDocRef);
        console.log("[useBills] Bill deleted from Firestore:", billId);
      } catch (error: any) {
        console.error("[useBills] Error deleting bill from Firestore:", error);
        setFirestoreError(`Failed to delete bill from cloud: ${error.message}`);
        setBills(billsBeforeDelete); // Revert optimistic update
      }
    } else {
        console.log("[useBills] Bill deleted from localStorage:", billId);
    }
  }, [bills, user, storagePreference]);

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
        // If date parsing fails, keep original order relative to each other
        return 0;
      }
    });
  }, []);

  return {
    bills,
    isLoading,
    storagePreference, // Expose storagePreference for potential UI indicators
    firestoreError,    // Expose firestoreError for UI display
    addBill,
    updateBill,
    togglePaidStatus,
    deleteBill,
    getBillsForMonth,
    getBillById,
    sortBills,
  };
}
