
"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Bill } from "@/lib/types";
import { TrendingUp, TrendingDown, DollarSign, ListChecks } from "lucide-react";
import { format, parseISO, isFuture, isToday } from 'date-fns';
import { Separator } from "@/components/ui/separator";

interface UpcomingBillsWidgetProps {
  bills: Bill[]; // Bills for the current month
}

export function UpcomingBillsWidget({ bills }: UpcomingBillsWidgetProps) {
  const summary = useMemo(() => {
    const unpaidBills = bills.filter(bill => !bill.paid);
    const totalDue = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);
    const paidBillsCount = bills.length - unpaidBills.length;
    
    const upcomingUnpaidBills = unpaidBills
      .filter(bill => {
        try {
          const dueDate = parseISO(bill.dueDate);
          return isFuture(dueDate) || isToday(dueDate);
        } catch (e) {
          console.error("Error parsing due date for bill:", bill.name, bill.dueDate, e);
          return false;
        }
      })
      .sort((a, b) => {
         try {
           return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime();
         } catch (e) {
           return 0; // Keep original order if dates are invalid
         }
      });

    let foundNextDueBills: Bill[] = [];
    let foundNextDueDateFormatted: string | null = null;

    if (upcomingUnpaidBills.length > 0) {
      const firstDueDateStr = upcomingUnpaidBills[0].dueDate;
      try {
        const firstDueDate = parseISO(firstDueDateStr);
        foundNextDueBills = upcomingUnpaidBills.filter(bill => bill.dueDate === firstDueDateStr);
        foundNextDueDateFormatted = format(firstDueDate, 'MMM d, yyyy');
      } catch (e) {
        console.error("Error processing first due date:", firstDueDateStr, e);
        foundNextDueDateFormatted = "Invalid Date";
      }
    }

    return {
      unpaidCount: unpaidBills.length,
      totalDue,
      paidCount: paidBillsCount,
      nextDueBills: foundNextDueBills,
      nextDueDateFormatted: foundNextDueDateFormatted,
    };
  }, [bills]);

  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2 text-primary">
          <ListChecks className="h-6 w-6"/>
          Monthly Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          <div className="flex flex-col items-start gap-0.5 p-2 md:p-3 rounded-lg bg-primary/5">
            <div className="flex items-center text-xs sm:text-sm text-primary/80">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Total Due
            </div>
            <div className="text-base sm:text-lg md:text-xl font-bold text-primary">
              ${summary.totalDue.toFixed(2)}
            </div>
          </div>
          <div className="flex flex-col items-start gap-0.5 p-2 md:p-3 rounded-lg bg-accent/10">
            <div className="flex items-center text-xs sm:text-sm text-accent">
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-accent" />
              Unpaid Bills
            </div>
            <div className="text-base sm:text-lg md:text-xl font-bold text-accent">
              {summary.unpaidCount}
            </div>
          </div>
          <div className="flex flex-col items-start gap-0.5 p-2 md:p-3 rounded-lg bg-green-500/10">
             <div className="flex items-center text-xs sm:text-sm text-green-700/80 dark:text-green-400/80">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-green-600 dark:text-green-500" />
              Paid Bills
            </div>
            <div className="text-base sm:text-lg md:text-xl font-bold text-green-600 dark:text-green-500">
              {summary.paidCount}
            </div>
          </div>
        </div>
        
        {summary.nextDueBills.length > 0 && summary.nextDueDateFormatted && (
           <div className="flex flex-col gap-2 p-3 sm:p-4 rounded-lg bg-secondary/20 border border-secondary">
             <p className="text-xs sm:text-sm text-secondary-foreground/80 shrink-0">
               Next Bills Due on {summary.nextDueDateFormatted}:
             </p>
             <div className="max-h-24 sm:max-h-32 overflow-y-auto space-y-1.5 sm:space-y-2 pr-2"> {/* Scrollable container */}
               {summary.nextDueBills.map((bill, index) => (
                 <React.Fragment key={bill.id}>
                   <div className="flex justify-between items-center">
                     <span className="text-sm sm:text-md font-semibold text-secondary-foreground truncate" title={bill.name}>
                       {bill.name}
                     </span>
                     <span className="text-sm sm:text-md font-semibold text-secondary-foreground whitespace-nowrap">
                       ${bill.amount.toFixed(2)}
                     </span>
                   </div>
                   {index < summary.nextDueBills.length - 1 && (
                     <Separator className="bg-secondary/50 my-1" />
                   )}
                 </React.Fragment>
               ))}
             </div>
           </div>
        )}

         {bills.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
                No bills scheduled for this month yet.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
