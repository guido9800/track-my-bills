
export const BillCategories = ["Housing", "Utilities", "Subscription", "Loan", "Insurance", "Other"] as const;
export type BillCategory = typeof BillCategories[number];

export const RecurrenceOptions = ["None", "Weekly", "Bi-Weekly", "Monthly", "Quarterly", "Yearly"] as const;
export type RecurrenceType = typeof RecurrenceOptions[number];

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO string format (e.g., "2024-07-15")
  paid: boolean;
  category: BillCategory;
  createdAt: string; // ISO string for timestamp
  recurrenceType?: RecurrenceType;
  recurrenceStartDate?: string; // ISO string format (e.g., "2024-07-15")
}
