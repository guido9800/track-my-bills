
"use client";

import type { BillCategory } from "@/lib/types"; // Import BillCategory type
import { BillCategories } from "@/lib/types"; // Import BillCategories constant
import { Home, Zap, Repeat, Landmark, ShieldCheck, Receipt, HelpCircle, type LucideProps } from "lucide-react";

interface CategoryIconProps extends LucideProps {
  category: BillCategory;
}

export function CategoryIcon({ category, ...props }: CategoryIconProps) {
  switch (category) {
    case "Housing":
      return <Home {...props} />;
    case "Utilities":
      return <Zap {...props} />;
    case "Subscription":
      return <Repeat {...props} />;
    case "Loan":
      return <Landmark {...props} />;
    case "Insurance":
      return <ShieldCheck {...props} />;
    case "Other":
      return <Receipt {...props} />;
    default:
      // Ensure all BillCategories values are handled or have a default
      // If category can be undefined or a string not in BillCategory, handle appropriately
      if (BillCategories.includes(category as any)) {
        return <HelpCircle {...props} />; // Or a specific icon for an unhandled known category
      }
      return <HelpCircle {...props} />; // Default for any other case
  }
}

// BillCategories constant is now imported from src/lib/types.ts
// export const BillCategories: BillCategory[] = ["Housing", "Utilities", "Subscription", "Loan", "Insurance", "Other"];
