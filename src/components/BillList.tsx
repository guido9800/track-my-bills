
"use client";

import type { Bill } from "@/lib/types";
import { BillItem } from "@/components/BillItem";
// import { useBills } from "@/hooks/useBills"; // No longer needed here
import { FileText, AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface BillListProps {
  bills: Bill[];
  monthName: string;
  onTogglePaid: (id: string) => void;
  onDeleteBill: (id: string) => void;
  sortBills: (billsToSort: Bill[]) => Bill[];
}

export function BillList({ bills, monthName, onTogglePaid, onDeleteBill, sortBills }: BillListProps) {
  // const { togglePaidStatus, deleteBill, sortBills } = useBills(); // Removed
  
  const sortedBillsToDisplay = sortBills(bills);

  if (sortedBillsToDisplay.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed rounded-lg">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-muted-foreground">No Bills for {monthName}</h3>
        <p className="text-muted-foreground">Looks like you're all clear for this month, or you haven't added any bills yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold mb-4 text-primary">Bills for {monthName}</h2>
      <AnimatePresence>
        {sortedBillsToDisplay.map((bill) => (
          <motion.div
            key={bill.id}
            layout // Animate layout changes (e.g., when sorting)
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <BillItem
              bill={bill}
              onTogglePaid={onTogglePaid} // Pass down the prop
              onDelete={onDeleteBill}     // Pass down the prop
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
