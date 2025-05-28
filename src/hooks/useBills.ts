
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Bill, BillCategory } from '@/lib/types';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const STORAGE_KEY = 'billtrack_bills';

export function useBills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedBills = localStorage.getItem(STORAGE_KEY);
      if (storedBills) {
        setBills(JSON.parse(storedBills));
      }
    } catch (error) {
      console.error("Failed to load bills from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
      } catch (error) {
        console.error("Failed to save bills to localStorage:", error);
      }
    }
  }, [bills, isLoading]);

  const addBill = useCallback((newBillData: Omit<Bill, 'id' | 'paid' | 'createdAt'>) => {
    const newBill: Bill = {
      ...newBillData,
      id: crypto.randomUUID(),
      paid: false,
      createdAt: new Date().toISOString(),
    };
    setBills((prevBills) => [...prevBills, newBill]);
  }, []);

  const updateBill = useCallback((updatedBill: Bill) => {
    setBills((prevBills) =>
      prevBills.map((bill) => (bill.id === updatedBill.id ? updatedBill : bill))
    );
  }, []);
  
  const togglePaidStatus = useCallback((billId: string) => {
    setBills((prevBills) =>
      prevBills.map((bill) =>
        bill.id === billId ? { ...bill, paid: !bill.paid } : bill
      )
    );
  }, []);

  const deleteBill = useCallback((billId: string) => {
    setBills((prevBills) => prevBills.filter((bill) => bill.id !== billId));
  }, []);

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
    addBill,
    updateBill,
    togglePaidStatus,
    deleteBill,
    getBillsForMonth,
    getBillById,
    sortBills,
  };
}
