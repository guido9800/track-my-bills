
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

  // AppHeader is h-16 (4rem/64px).
  // MonthNav section: content (buttons h-10=2.5rem) + py-4 (1rem top + 1rem bottom) = 4.5rem.
  // Top offset for MonthNav: 4rem (height of AppHeader)
  // Top offset for UpcomingBillsWidget: 4rem (AppHeader) + 4.5rem (MonthNav) = 8.5rem

  if (isLoading) {
    return (
      // Main wrapper for the page content for skeleton
      <div>
        {/* Month Navigation Section - Sticky below AppHeader */}
        <div className="sticky top-[4rem] z-20 border-b bg-background">
          <div className="container mx-auto flex items-center justify-center space-x-4 px-4 py-4">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-8 w-48" /> {/* Matches h2 w-48 */}
              <Skeleton className="h-10 w-10" />
          </div>
        </div>

        {/* Upcoming Bills Widget Section - Sticky below AppHeader and Month Navigation */}
        <div className="sticky top-[8.5rem] z-10 border-b bg-background">
          <div className="container mx-auto px-4 py-6">
            <Skeleton className="h-40 w-full" /> {/* Matches UpcomingBillsWidget approx height */}
          </div>
        </div>

        {/* Scrollable Bill List Area Skeleton - This content will scroll normally */}
        <div className="container mx-auto px-4 pt-8 pb-8">
          <div className="space-y-2 mb-6"> {/* Mimics BillList header */}
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
    // Main wrapper for the page
    <div>
      {/* Month Navigation Section - Sticky below AppHeader */}
      <div className="sticky top-[4rem] z-20 border-b bg-background">
        <div className="container mx-auto flex items-center justify-center space-x-4 px-4 py-4">
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
      </div>

      {/* Upcoming Bills Widget Section - Sticky below AppHeader and Month Navigation */}
      <div className="sticky top-[8.5rem] z-10 border-b bg-background">
        <div className="container mx-auto px-4 py-6">
            <UpcomingBillsWidget bills={monthlyBills} />
        </div>
      </div>

      {/* Scrollable Bill List Area - This content will scroll normally */}
      <div className="container mx-auto px-4 pt-8 pb-8">
        {/* pt-8 provides space so content doesn't start hidden under the last sticky element */}
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
