
"use client";

import { BillForm } from "@/components/BillForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from 'next/navigation'; // Added import

export default function AddBillPage() {
  const router = useRouter(); // Initialize router

  const handleCancel = () => {
    router.push('/'); // Redirect to dashboard
  };

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">Add a New Bill</CardTitle>
          <CardDescription className="text-center">
            Keep track of your expenses by adding bill details below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BillForm showCancelButton onCancelClick={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
}
