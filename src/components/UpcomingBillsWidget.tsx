"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Bill } from "@/lib/types";
import { TrendingUp, TrendingDown, DollarSign, ListChecks } from "lucide-react";
import { format, parseISO, isFuture, isToday } from 'date-fns';

interface UpcomingBillsWidgetProps {
  bills: Bill[]; // Bills for the current month
}

export function UpcomingBillsWidget({ bills }: UpcomingBillsWidgetProps) {
  const summary = useMemo(() => {
    const unpaidBills = bills.filter(bill => !bill.paid);
    const totalDue = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);
    const paidBillsCount = bills.length - unpaidBills.length;
    
    let nextDueBill: Bill | null = null;
    if (unpaidBills.length > 0) {
      nextDueBill = unpaidBills
        .filter(bill => isFuture(parseISO(bill.dueDate)) || isToday(parseISO(bill.dueDate)))
        .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime())[0] || null;
    }

    return {
      unpaidCount: unpaidBills.length,
      totalDue,
      paidCount: paidBillsCount,
      nextDueBill,
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
      <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div className="flex flex-col items-start gap-1 p-4 rounded-lg bg-primary/5">
          <div className="flex items-center text-sm text-primary/80">
            <DollarSign className="h-4 w-4 mr-1" />
            Total Due (Unpaid)
          </div>
          <div className="text-3xl font-bold text-primary">
            ${summary.totalDue.toFixed(2)}
          </div>
        </div>
        <div className="flex flex-col items-start gap-1 p-4 rounded-lg bg-accent/10">
          <div className="flex items-center text-sm text-accent-foreground/80">
            <TrendingDown className="h-4 w-4 mr-1 text-accent" />
            Unpaid Bills
          </div>
          <div className="text-3xl font-bold text-accent">
            {summary.unpaidCount}
          </div>
        </div>
        <div className="flex flex-col items-start gap-1 p-4 rounded-lg bg-green-500/10">
           <div className="flex items-center text-sm text-green-700/80 dark:text-green-400/80">
            <TrendingUp className="h-4 w-4 mr-1 text-green-600 dark:text-green-500" />
            Paid Bills
          </div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-500">
            {summary.paidCount}
          </div>
        </div>
        {summary.nextDueBill && (
           <div className="sm:col-span-2 md:col-span-3 flex flex-col items-start gap-1 p-4 rounded-lg bg-secondary/20 border border-secondary">
             <p className="text-sm text-secondary-foreground/80">Next Due Bill:</p>
             <p className="text-lg font-semibold text-secondary-foreground">
               {summary.nextDueBill.name} - ${summary.nextDueBill.amount.toFixed(2)} on {format(parseISO(summary.nextDueBill.dueDate), 'MMM d')}
             </p>
           </div>
        )}
         {bills.length === 0 && (
            <div className="sm:col-span-2 md:col-span-3 p-4 text-center text-muted-foreground">
                No bills scheduled for this month yet.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
