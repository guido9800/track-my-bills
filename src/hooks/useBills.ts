
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Bill } from '@/lib/types';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import type { StoragePreference } from '@/components/AppHeader';
import { firestore } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  writeBatch, // Added for batch operations
  setDoc, // Added for setting doc with specific ID
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
    } catch (error) {
      console.error("Failed to load storage preference from localStorage:", error);
    }
  }, []);

  const loadBills = useCallback(async (forceFirestoreLoad = false) => {
    setIsLoading(true);
    setFirestoreError(null);
    console.log(`[useBills] Load effect triggered. User: ${user?.uid}, Pref: ${storagePreference}, ForceFirestore: ${forceFirestoreLoad}`);

    if (user && (storagePreference === 'cloud' || forceFirestoreLoad)) {
      console.log(`[useBills] User logged in (${user.uid}) and preference is cloud (or forced). Attempting to load from Firestore.`);
      try {
        const billsCollectionRef = collection(firestore, 'users', user.uid, 'bills');
        const q = query(billsCollectionRef);
        const querySnapshot = await getDocs(q);
        const firestoreBills: Bill[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          firestoreBills.push({
            id: docSnap.id,
            name: data.name,
            amount: data.amount,
            dueDate: data.dueDate,
            paid: data.paid,
            category: data.category,
            createdAt: data.createdAt,
            recurrenceType: data.recurrenceType,
            recurrenceStartDate: data.recurrenceStartDate,
          } as Bill);
        });
        setBills(firestoreBills);
        console.log("[useBills] Bills loaded from Firestore:", firestoreBills.length);
      } catch (error: any) {
        console.error("[useBills] Error loading bills from Firestore:", error);
        setFirestoreError(`Failed to load bills from cloud: ${error.message}`);
        setBills([]);
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
  }, [user, storagePreference]);


  // Effect to load bills based on user and storage preference
  useEffect(() => {
    if (!user && storagePreference === 'cloud') {
      console.log("[useBills] User not logged in, but preference is cloud. Clearing bills and waiting for login or pref change.");
      setBills([]);
      setIsLoading(false);
    } else {
      loadBills();
    }
  }, [user, storagePreference, loadBills]);


  // Effect to save bills to localStorage (if preference is local and not loading)
  useEffect(() => {
    if (!isLoading && storagePreference === 'local') {
      console.log("[useBills] Saving bills to localStorage (preference is local). Bill count:", bills.length);
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
        // Firestore will auto-generate an ID
        const docRef = await addDoc(billsCollectionRef, firestoreBillData);
        const newBillWithId: Bill = { ...firestoreBillData, id: docRef.id }; // Use Firestore generated ID
        setBills((prevBills) => [newBillWithId, ...prevBills]);
        console.log("[useBills] Bill added to Firestore with ID:", docRef.id);
      } catch (error: any) {
        console.error("[useBills] Error adding bill to Firestore:", error);
        setFirestoreError(`Failed to add bill to cloud: ${error.message}`);
      }
    } else {
      const billWithClientData: Bill = {
        ...newBillData,
        id: crypto.randomUUID(), // Generate local UUID
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
        const { id, ...dataToUpdate } = updatedBill; // Exclude id from data written to Firestore fields
        await setDoc(billDocRef, dataToUpdate, { merge: true }); // Use setDoc with merge for update
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
    const updatedBillFields = { ...billToUpdate, paid: newPaidStatus };

    setBills((prevBills) =>
      prevBills.map((bill) => (bill.id === billId ? updatedBillFields : bill))
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
        setBills((prevBills) => // Revert optimistic update on error
          prevBills.map((bill) => (bill.id === billId ? billToUpdate : bill))
        );
      }
    } else {
      console.log("[useBills] Bill status toggled in localStorage:", billId);
    }
  }, [bills, user, storagePreference]);

  const deleteBill = useCallback(async (billId: string) => {
    setFirestoreError(null);
    const billsBeforeDelete = [...bills]; // For potential revert

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
        return 0;
      }
    });
  }, []);

  const getRawLocalBills = useCallback((): Bill[] => {
    try {
      const storedBills = localStorage.getItem(LOCAL_STORAGE_KEY);
      return storedBills ? JSON.parse(storedBills) : [];
    } catch (error) {
      console.error("[useBills] Failed to load local bills for count/upload:", error);
      return [];
    }
  }, []);

  const uploadLocalBillsToCloud = useCallback(async () => {
    if (!user) {
      console.error("[useBills] User not logged in. Cannot upload to cloud.");
      throw new Error("User not logged in. Please log in to upload bills.");
    }
    console.log(`[useBills] Uploading local bills to Firestore for user ${user.uid}`);
    const localBillsToUpload = getRawLocalBills();

    if (localBillsToUpload.length === 0) {
      console.log("[useBills] No local bills to upload.");
      return; // Or throw new Error("No local bills to upload.");
    }

    const billsCollectionRef = collection(firestore, 'users', user.uid, 'bills');
    const batch = writeBatch(firestore);

    localBillsToUpload.forEach((bill) => {
      const { id, ...billData } = bill; // Prepare data for Firestore
      const billDocRef = doc(billsCollectionRef, id); // Use local bill's ID as Firestore document ID
      batch.set(billDocRef, billData, { merge: true }); // Merge true: update if exists, create if not
    });

    try {
      await batch.commit();
      console.log(`[useBills] Successfully uploaded/merged ${localBillsToUpload.length} bills to Firestore.`);
      // After successful upload, reload bills from Firestore to reflect changes
      await loadBills(true); // Force a load from Firestore
      // Optional: You might want to clear local bills after successful upload
      // localStorage.removeItem(LOCAL_STORAGE_KEY);
      // setBills([]); // if loadBills(true) doesn't immediately update
    } catch (error: any) {
      console.error("[useBills] Error uploading bills to Firestore:", error);
      setFirestoreError(`Failed to upload bills to cloud: ${error.message}`); // Set error state
      throw new Error(`Failed to upload bills to cloud: ${error.message}`);
    }
  }, [user, getRawLocalBills, loadBills]);


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
    getRawLocalBills, // Expose for AppHeader
    uploadLocalBillsToCloud, // Expose for AppHeader
  };
}
