
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useBills } from "@/hooks/useBills";
import type { Bill } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/icons";
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Edit3, CalendarDays, Tag, DollarSign, Repeat as RepeatIcon, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BillDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { getBillById, isLoading: billsLoading } = useBills();
  const [bill, setBill] = useState<Bill | undefined>(undefined);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  const billId = typeof params.id === 'string' ? params.id : undefined;

  useEffect(() => {
    if (billId && !billsLoading) {
      const fetchedBill = getBillById(billId);
      setBill(fetchedBill);
      setIsLoadingPage(false);
    } else if (!billsLoading) {
        setIsLoadingPage(false); // Bills loaded but no billId, or billId invalid
    }
  }, [billId, getBillById, billsLoading]);

  if (isLoadingPage || billsLoading) {
    return (
      <div className="container mx-auto max-w-2xl py-8 px-4 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="container mx-auto max-w-2xl py-8 px-4 text-center">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Bill Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The bill details you are looking for could not be found.</p>
            <Button asChild className="mt-4">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <Button variant="outline" asChild className="mb-4">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
      </Button>
      <Card className="shadow-xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-primary flex items-center">
              <CategoryIcon category={bill.category} className="mr-3 h-7 w-7 text-primary/80" />
              {bill.name}
            </CardTitle>
            <CardDescription className="mt-1">
              Created on: {format(parseISO(bill.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </CardDescription>
          </div>
          {bill.paid ? (
            <Badge variant="outline" className="text-xs py-1 px-3 bg-green-500/10 text-green-700 border-green-500">
              <CheckCircle className="mr-1 h-4 w-4" /> Paid
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs py-1 px-3 bg-destructive/10 text-destructive border-destructive">
              <XCircle className="mr-1 h-4 w-4" /> Unpaid
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 mr-3 text-muted-foreground" />
            <span className="text-2xl font-semibold text-foreground">${bill.amount.toFixed(2)}</span>
          </div>
          <div className="flex items-center">
            <CalendarDays className="h-5 w-5 mr-3 text-muted-foreground" />
            <span className="text-md text-foreground">
              Due on: {format(parseISO(bill.dueDate), "MMMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center">
            <Tag className="h-5 w-5 mr-3 text-muted-foreground" />
            <span className="text-md text-foreground">Category: {bill.category}</span>
          </div>
          
          {bill.recurrenceType && bill.recurrenceType !== "None" && (
            <div className="flex items-start pt-2 border-t mt-4">
              <RepeatIcon className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-md text-foreground">
                  Repeats: {bill.recurrenceType}
                </p>
                {bill.recurrenceStartDate && (
                  <p className="text-sm text-muted-foreground">
                    Starting from: {format(parseISO(bill.recurrenceStartDate), "MMMM d, yyyy")}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button asChild className="w-full">
            <Link href={`/edit-bill/${bill.id}`}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit Bill
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
