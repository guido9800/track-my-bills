export type BillCategory = "Housing" | "Utilities" | "Subscription" | "Loan" | "Insurance" | "Other";

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO string format (e.g., "2024-07-15")
  paid: boolean;
  category: BillCategory;
  createdAt: string; // ISO string for timestamp
}
