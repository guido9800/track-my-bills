"use client";

import type { BillCategory } from "@/lib/types";
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
      return <HelpCircle {...props} />;
  }
}

export const BillCategories: BillCategory[] = ["Housing", "Utilities", "Subscription", "Loan", "Insurance", "Other"];
