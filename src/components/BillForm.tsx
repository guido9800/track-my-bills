
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useBills } from "@/hooks/useBills";
import { BillCategories, CategoryIcon } from "@/components/icons";
import type { Bill, BillCategory, RecurrenceType } from "@/lib/types";
import { RecurrenceOptions } from "@/lib/types";
import { CalendarIcon, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const billFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name must be less than 50 characters."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  dueDate: z.date({ required_error: "Due date is required." }),
  category: z.enum(BillCategories, { required_error: "Category is required." }),
  recurrenceType: z.enum(RecurrenceOptions).default("None").optional(),
  recurrenceStartDate: z.date().optional(),
}).superRefine((data, ctx) => {
  if (data.recurrenceType && data.recurrenceType !== "None" && !data.recurrenceStartDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Start date for repeating bill is required if recurrence is selected.",
      path: ["recurrenceStartDate"],
    });
  }
  if (data.recurrenceStartDate && (!data.recurrenceType || data.recurrenceType === "None")) {
    ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a recurrence type if providing a start date.",
        path: ["recurrenceType"],
    });
  }
});

type BillFormValues = z.infer<typeof billFormSchema>;

interface BillFormProps {
  billToEdit?: Bill;
}

export function BillForm({ billToEdit }: BillFormProps) {
  const { addBill, updateBill } = useBills();
  const { toast } = useToast();
  const router = useRouter();
  const isEditing = !!billToEdit;

  const defaultFormValues: BillFormValues = billToEdit
    ? {
        name: billToEdit.name,
        amount: billToEdit.amount,
        // Ensure dueDate is parsed correctly, providing a fallback if it's somehow invalid
        dueDate: billToEdit.dueDate ? parseISO(billToEdit.dueDate) : new Date(), 
        category: billToEdit.category,
        recurrenceType: billToEdit.recurrenceType || "None",
        recurrenceStartDate: billToEdit.recurrenceStartDate ? parseISO(billToEdit.recurrenceStartDate) : undefined,
      }
    : {
        name: "",
        amount: "" as unknown as number,
        category: undefined,
        dueDate: undefined,
        recurrenceType: "None",
        recurrenceStartDate: undefined,
      };

  const form = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: defaultFormValues,
  });
  
  // Reset form if billToEdit changes (e.g. navigating between edit pages or prop updates)
  useEffect(() => {
    if (billToEdit) {
      form.reset({
        name: billToEdit.name,
        amount: billToEdit.amount,
        dueDate: billToEdit.dueDate ? parseISO(billToEdit.dueDate) : new Date(),
        category: billToEdit.category,
        recurrenceType: billToEdit.recurrenceType || "None",
        recurrenceStartDate: billToEdit.recurrenceStartDate ? parseISO(billToEdit.recurrenceStartDate) : undefined,
      });
    } else {
      form.reset({ // Reset to blank form if billToEdit becomes undefined
        name: "",
        amount: "" as unknown as number,
        category: undefined,
        dueDate: undefined,
        recurrenceType: "None",
        recurrenceStartDate: undefined,
      });
    }
  }, [billToEdit, form]);


  const watchedRecurrenceType = form.watch("recurrenceType");

  function onSubmit(data: BillFormValues) {
    const billDataForStorage: Omit<Bill, 'id' | 'paid' | 'createdAt'> = {
      name: data.name,
      amount: data.amount,
      dueDate: format(data.dueDate, "yyyy-MM-dd"),
      category: data.category as BillCategory,
      // Ensure recurrenceType is undefined if "None", otherwise use the value
      recurrenceType: data.recurrenceType === "None" ? undefined : data.recurrenceType,
      recurrenceStartDate: data.recurrenceStartDate ? format(data.recurrenceStartDate, "yyyy-MM-dd") : undefined,
    };

    if (isEditing && billToEdit) {
      const updatedBill: Bill = {
        ...billToEdit, // Preserve id, paid, createdAt from original bill
        ...billDataForStorage, // Apply new form data
      };
      updateBill(updatedBill);
      toast({
        title: "Bill Updated",
        description: `${updatedBill.name} has been successfully updated.`,
        action: <CheckCircle className="text-green-500" />,
      });
      router.push(billToEdit.id ? `/bill/${billToEdit.id}` : '/');
    } else {
      addBill(billDataForStorage);
      toast({
        title: "Bill Added",
        description: `${data.name} has been successfully added.`,
        action: <CheckCircle className="text-green-500" />,
      });
      form.reset(); // Reset form to defaultValues for new bill
      router.push('/');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bill Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Netflix Subscription" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount ($)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="e.g., 15.99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                        field.onChange(date);
                        if (watchedRecurrenceType && watchedRecurrenceType !== "None" && !form.getValues("recurrenceStartDate") && date) {
                            form.setValue("recurrenceStartDate", date, { shouldValidate: true });
                        }
                    }}
                    // Allow past dates when editing, but not for new bills if not editing
                    disabled={(date) => !isEditing && date < new Date(new Date().setDate(new Date().getDate() -1)) } 
                    initialFocus={!isEditing} // Only initialFocus on new bill form
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BillCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center gap-2">
                        <CategoryIcon category={category as BillCategory} className="h-4 w-4" />
                        {category}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="recurrenceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repeats</FormLabel>
              <Select 
                onValueChange={(value) => {
                    field.onChange(value);
                    if (value === "None") {
                        form.setValue("recurrenceStartDate", undefined, {shouldValidate: true});
                    } else if (form.getValues("dueDate") && !form.getValues("recurrenceStartDate")) {
                        form.setValue("recurrenceStartDate", form.getValues("dueDate"), {shouldValidate: true});
                    }
                }} 
                value={field.value || "None"}
                defaultValue={field.value || "None"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recurrence" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {RecurrenceOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === "None" ? "Does not repeat" : option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchedRecurrenceType && watchedRecurrenceType !== "None" && (
          <FormField
            control={form.control}
            name="recurrenceStartDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Repeating On</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a start date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                       // Allow past dates when editing
                      disabled={(date) => !isEditing && date < new Date(new Date().setDate(new Date().getDate() -1)) }
                      initialFocus={!isEditing}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          {isEditing ? "Update Bill" : "Add Bill"}
        </Button>
      </form>
    </Form>
  );
}
