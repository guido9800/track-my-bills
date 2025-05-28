"use client";

import type { Bill } from "@/lib/types";
import { BillItem } from "@/components/BillItem";
import { useBills } from "@/hooks/useBills";
import { FileText, AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface BillListProps {
  bills: Bill[];
  monthName: string;
}

export function BillList({ bills: initialBills, monthName }: BillListProps) {
  const { togglePaidStatus, deleteBill, sortBills } = useBills();
  
  // The useBills hook manages the source of truth for bills.
  // To ensure this component reacts to changes from the hook (e.g., after adding a bill and navigating back),
  // we should re-fetch and sort the bills from the hook if initialBills is not always up-to-date.
  // However, if page.tsx correctly passes the updated & sorted bills, this local sort is fine.
  // For robustness, let's assume initialBills is the set to display and sort that.
  const sortedBills = sortBills(initialBills);

  if (sortedBills.length === 0) {
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
        {sortedBills.map((bill) => (
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
              onTogglePaid={togglePaidStatus}
              onDelete={deleteBill}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
