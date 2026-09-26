"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema } from "@/lib/validations";
import { supabase } from "@/lib/supabase";
import { generateExpenseId } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  "Ground Maintenance",
  "Equipment",
  "Salary",
  "Utilities",
  "Travel",
  "Food & Refreshment",
  "Miscellaneous",
];

const PAYMENT_MODES = ["Cash", "UPI", "Bank Transfer"];

/**
 * @param {{
 *   expense?: any;
 *   onSuccess: () => void;
 *   onCancel: () => void;
 * }} props
 */
export default function ExpenseForm({ expense, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense
      ? {
          date: expense.date?.split("T")[0] ?? "",
          category: expense.category,
          amount: String(expense.amount),
          description: expense.description,
          paid_by: expense.paid_by ?? "",
          payment_mode: expense.payment_mode ?? undefined,
          notes: expense.notes ?? "",
        }
      : {
          date: new Date().toISOString().split("T")[0],
        },
  });

  const category = watch("category");
  const paymentMode = watch("payment_mode");

  async function onSubmit(data) {
    setLoading(true);
    try {
      const payload = {
        date: data.date,
        category: data.category,
        amount: Number(data.amount),
        description: data.description,
        paid_by: data.paid_by || null,
        payment_mode: data.payment_mode || null,
        notes: data.notes || null,
      };

      if (expense) {
        const { error } = await supabase.from("expenses").update(payload).eq("id", expense.id);
        if (error) throw error;
        toast.success("Expense updated");
      } else {
        const { count } = await supabase
          .from("expenses")
          .select("*", { count: "exact", head: true });
        const expenseId = generateExpenseId((count ?? 0) + 1);

        const { error } = await supabase
          .from("expenses")
          .insert({ ...payload, expense_id: expenseId });
        if (error) throw error;
        toast.success("Expense recorded");
      }
      onSuccess();
    } catch (err) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Date */}
      <div className="space-y-1.5">
        <Label htmlFor="date">Date *</Label>
        <Input id="date" type="date" {...register("date")} />
        {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label>Category *</Label>
        <Select
          value={category}
          onValueChange={(v) => setValue("category", v, { shouldValidate: true })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
      </div>

      {/* Amount */}
      <div className="space-y-1.5">
        <Label htmlFor="amount">Amount (₹) *</Label>
        <Input
          id="amount"
          type="number"
          min="1"
          step="0.01"
          {...register("amount")}
          placeholder="0.00"
        />
        {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description *</Label>
        <Input
          id="description"
          {...register("description")}
          placeholder="Brief description of expense"
        />
        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
      </div>

      {/* Paid By */}
      <div className="space-y-1.5">
        <Label htmlFor="paid_by">Paid By</Label>
        <Input id="paid_by" {...register("paid_by")} placeholder="Name of person who paid" />
      </div>

      {/* Payment Mode */}
      <div className="space-y-1.5">
        <Label>Payment Mode</Label>
        <Select
          value={paymentMode ?? ""}
          onValueChange={(v) => setValue("payment_mode", v, { shouldValidate: true })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select mode" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_MODES.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Additional notes (optional)"
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#0d1b2a] hover:bg-[#1a2f4a] text-white"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {expense ? "Update Expense" : "Record Expense"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
