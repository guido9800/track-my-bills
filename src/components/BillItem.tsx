
"use client";

import type { Bill } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/icons";
import { format, parseISO } from 'date-fns';
import { Trash2, Eye, Repeat as RepeatIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface BillItemProps {
  bill: Bill;
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
}

export function BillItem({ bill, onTogglePaid, onDelete }: BillItemProps) {
  const formattedDueDate = parseISO(bill.dueDate);

  return (
    <Card className={cn(
      "mb-3 transition-all duration-300 ease-in-out transform hover:shadow-xl",
      bill.paid ? "bg-muted/50 opacity-70" : "bg-card"
    )}>
      <CardContent className="p-4 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Checkbox
            id={`paid-${bill.id}`}
            checked={bill.paid}
            onCheckedChange={() => onTogglePaid(bill.id)}
            className="h-6 w-6 data-[state=checked]:bg-accent data-[state=checked]:border-accent focus-visible:ring-accent shrink-0"
            aria-label={`Mark ${bill.name} as ${bill.paid ? 'unpaid' : 'paid'}`}
          />
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary shrink-0">
            <CategoryIcon category={bill.category} className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <label htmlFor={`paid-${bill.id}`} className={cn("block font-semibold text-lg truncate cursor-pointer", bill.paid && "line-through text-muted-foreground")}>
              {bill.name}
            </label>
            <p className={cn("text-sm", bill.paid ? "text-muted-foreground" : "text-foreground/80")}>
              Due: {format(formattedDueDate, 'MMM d, yyyy')}
            </p>
            {bill.recurrenceType && bill.recurrenceType !== "None" && (
              <p className={cn("text-xs mt-0.5 flex items-center", bill.paid ? "text-muted-foreground" : "text-foreground/70")}>
                <RepeatIcon className="h-3 w-3 mr-1" />
                Repeats: {bill.recurrenceType}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 text-right shrink-0 ml-auto">
           <span className={cn("font-bold text-lg", bill.paid ? "text-muted-foreground line-through" : "text-primary")}>
            ${bill.amount.toFixed(2)}
          </span>
          {bill.paid && (
            <Badge variant="outline" className="border-accent text-accent bg-accent/10 text-xs py-0.5 px-2">
              Paid
            </Badge>
          )}
        </div>
        <div className="flex items-center shrink-0">
          <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-primary shrink-0">
            <Link href={`/bill/${bill.id}`} aria-label={`View details for ${bill.name}`}>
              <Eye className="h-5 w-5" />
            </Link>
          </Button>
          <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 shrink-0" aria-label={`Delete ${bill.name}`}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the bill "{bill.name}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(bill.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
