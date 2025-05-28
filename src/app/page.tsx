
"use client";

import { useEffect, useState } from "react";
import { BillList } from "@/components/BillList";
import { UpcomingBillsWidget } from "@/components/UpcomingBillsWidget";
import { useBills } from "@/hooks/useBills";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format, addMonths, subMonths } from 'date-fns';
import { PlusCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { bills, isLoading, getBillsForMonth, sortBills, togglePaidStatus, deleteBill } = useBills();
  const [currentDate, setCurrentDate] = useState(new Date()); 

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  const monthlyBills = getBillsForMonth(currentDate);
  const currentMonthName = format(currentDate, 'MMMM yyyy');

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col h-full">
        {/* Month Nav Skeleton (shrink-0) */}
        <div className="flex justify-center items-center mb-6 space-x-4 shrink-0">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-10" />
        </div>

        {/* Upcoming Bills Widget Skeleton (shrink-0) */}
        <div className="shrink-0">
          <Skeleton className="h-40 w-full" />
        </div>
        
        {/* Scrollable Area Skeleton (flex-1 overflow-y-auto) */}
        <div className="mt-8 flex-1 overflow-y-auto">
          <div className="space-y-2 mb-6"> {/* This is the "Bills for..." heading */}
              <Skeleton className="h-8 w-1/3" /> 
          </div>
          <Skeleton className="h-20 w-full mb-3" />
          <Skeleton className="h-20 w-full mb-3" />
          <Skeleton className="h-20 w-full mb-3" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 flex flex-col h-full">
      {/* Month Navigation */}
      <div className="flex justify-center items-center mb-6 space-x-4 shrink-0">
        <Button variant="outline" size="icon" onClick={handlePreviousMonth} aria-label="Previous month">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h2 className="text-2xl font-semibold text-center text-primary w-48">
          {currentMonthName}
        </h2>
        <Button variant="outline" size="icon" onClick={handleNextMonth} aria-label="Next month">
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Upcoming Bills Widget - stays fixed */}
      <div className="shrink-0">
        <UpcomingBillsWidget bills={monthlyBills} />
      </div>
      
      {/* Scrollable Bill List Area */}
      <div className="mt-8 flex-1 overflow-y-auto pb-4"> {/* Added pb-4 for some bottom spacing within scroll */}
        <BillList 
          bills={monthlyBills} 
          monthName={currentMonthName}
          onTogglePaid={togglePaidStatus}
          onDeleteBill={deleteBill}
          sortBills={sortBills} 
        />
        {monthlyBills.length === 0 && bills.length === 0 && !isLoading && (
           <div className="mt-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              It looks like you don't have any bills yet for any month.
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
    </div>
  );
}
