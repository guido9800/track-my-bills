
"use client";

import { useEffect, useState } from "react";
import { BillList } from "@/components/BillList";
import { UpcomingBillsWidget } from "@/components/UpcomingBillsWidget";
import { useBills } from "@/hooks/useBills";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from 'date-fns';
import { PlusCircle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { bills, isLoading, getBillsForMonth, sortBills, togglePaidStatus, deleteBill } = useBills();
  const [currentDate, setCurrentDate] = useState(new Date()); // For displaying current month name

  const monthlyBills = getBillsForMonth(currentDate);
  // Sorting is now handled within BillList or by passing sorted bills
  // const sortedMonthlyBills = sortBills(monthlyBills); 

  const currentMonthName = format(currentDate, 'MMMM yyyy');

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-40 w-full mb-6" />
        <div className="space-y-2 mb-6">
            <Skeleton className="h-8 w-1/3" />
        </div>
        <Skeleton className="h-20 w-full mb-3" />
        <Skeleton className="h-20 w-full mb-3" />
        <Skeleton className="h-20 w-full mb-3" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <UpcomingBillsWidget bills={monthlyBills} />
      
      <div className="mt-8">
        <BillList 
          bills={monthlyBills} 
          monthName={currentMonthName}
          onTogglePaid={togglePaidStatus}
          onDeleteBill={deleteBill}
          sortBills={sortBills} 
        />
      </div>

      {monthlyBills.length === 0 && bills.length === 0 && (
         <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            It looks like you don't have any bills yet.
          </p>
          <Link href="/add-bill" passHref>
            <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Your First Bill
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
