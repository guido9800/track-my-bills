
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BillForm } from "@/components/BillForm";
import { useBills } from "@/hooks/useBills";
import type { Bill } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditBillPage() {
  const params = useParams();
  const router = useRouter();
  const { getBillById, isLoading: billsLoading } = useBills();
  const [bill, setBill] = useState<Bill | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const billId = typeof params.id === 'string' ? params.id : undefined;

  useEffect(() => {
    if (billId && !billsLoading) {
      const fetchedBill = getBillById(billId);
      if (fetchedBill) {
        setBill(fetchedBill);
      } else {
        // Bill not found, maybe redirect or show error
        router.replace('/'); // Or a 404 page
      }
      setIsLoading(false);
    } else if (!billsLoading) {
        // No billId or bills still loading but then finished
        setIsLoading(false);
    }
  }, [billId, getBillById, billsLoading, router]);

  if (isLoading || billsLoading) {
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
            <p>The bill you are trying to edit could not be found.</p>
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
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
         <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">Edit Bill</CardTitle>
          <CardDescription className="text-center">
            Update the details for "{bill.name}".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BillForm billToEdit={bill} />
        </CardContent>
      </Card>
    </div>
  );
}
