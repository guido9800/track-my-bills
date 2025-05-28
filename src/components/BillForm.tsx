
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
import type { Bill, BillCategory, RecurrenceType } from "@/lib/types"; // Added RecurrenceType
import { RecurrenceOptions } from "@/lib/types"; // Added RecurrenceOptions
import { CalendarIcon, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

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
  // If a recurrence start date is provided, a recurrence type (other than "None") should also be selected.
  if (data.recurrenceStartDate && (!data.recurrenceType || data.recurrenceType === "None")) {
    ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a recurrence type if providing a start date.",
        path: ["recurrenceType"],
    });
  }
});

type BillFormValues = z.infer<typeof billFormSchema>;

export function BillForm() {
  const { addBill } = useBills();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      name: "",
      amount: "" as unknown as number, 
      category: undefined,
      dueDate: undefined,
      recurrenceType: "None",
      recurrenceStartDate: undefined,
    },
  });

  const watchedRecurrenceType = form.watch("recurrenceType");

  function onSubmit(data: BillFormValues) {
    const billPayload: Omit<Bill, 'id' | 'paid' | 'createdAt'> = {
        name: data.name,
        amount: data.amount,
        dueDate: format(data.dueDate, "yyyy-MM-dd"),
        category: data.category as BillCategory,
      };
  
      if (data.recurrenceType && data.recurrenceType !== "None") {
        billPayload.recurrenceType = data.recurrenceType;
        // recurrenceStartDate is guaranteed by superRefine if recurrenceType is not "None"
        if (data.recurrenceStartDate) { 
            billPayload.recurrenceStartDate = format(data.recurrenceStartDate, "yyyy-MM-dd");
        }
      } else {
        billPayload.recurrenceType = undefined;
        billPayload.recurrenceStartDate = undefined;
      }

    addBill(billPayload);

    toast({
      title: "Bill Added",
      description: `${data.name} has been successfully added.`,
      action: <CheckCircle className="text-green-500" />,
    });
    form.reset(); // Resets to defaultValues including recurrenceType: "None"
    router.push('/');
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
                        // If recurrence is set and no start date yet, default start date to due date
                        if (watchedRecurrenceType && watchedRecurrenceType !== "None" && !form.getValues("recurrenceStartDate") && date) {
                            form.setValue("recurrenceStartDate", date, { shouldValidate: true });
                        }
                    }}
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) } 
                    initialFocus
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        // Set default start date to due date if not already set
                        form.setValue("recurrenceStartDate", form.getValues("dueDate"), {shouldValidate: true});
                    }
                }} 
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
                      disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          Add Bill
        </Button>
      </form>
    </Form>
  );
}
