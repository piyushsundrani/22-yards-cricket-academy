"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { billingSchema } from "@/lib/validations";
import { supabase } from "@/lib/supabase";
import { generateReceiptNumber, computeBillingStatus } from "@/lib/utils";
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

export default function BillingForm({ billing, students, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(billingSchema),
    defaultValues: billing
      ? {
          student_id: billing.student_id,
          fee_type: billing.fee_type,
          amount: String(billing.amount),
          payment_month: billing.payment_month?.slice(0, 7) ?? "",
          payment_date: billing.payment_date?.split("T")[0] ?? "",
          valid_till: billing.valid_till?.split("T")[0] ?? billing.due_date?.split("T")[0] ?? "",
          payment_mode: billing.payment_mode ?? undefined,
          notes: billing.notes ?? "",
        }
      : {
          payment_month: new Date().toISOString().slice(0, 7),
          valid_till: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        },
  });

  const filteredStudents = (students ?? []).filter(
    (s) =>
      s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.student_id.toLowerCase().includes(studentSearch.toLowerCase())
  );

  async function onSubmit(data) {
    setLoading(true);
    try {
      const due_date = data.valid_till;
      const status = computeBillingStatus(data.payment_date || null, due_date, data.valid_till);
      const payment_month = `${data.payment_month}-01`;

      if (billing) {
        const { error } = await supabase
          .from("billing")
          .update({ ...data, payment_month, due_date, status, amount: Number(data.amount) })
          .eq("id", billing.id);
        if (error) throw error;
        toast.success("Payment record updated");
      } else {
        const { count } = await supabase
          .from("billing")
          .select("*", { count: "exact", head: true });
        const receiptNumber = generateReceiptNumber((count ?? 0) + 1);

        const { error } = await supabase.from("billing").insert({
          ...data,
          payment_month,
          due_date,
          receipt_number: receiptNumber,
          amount: Number(data.amount),
          status,
          payment_date: data.payment_date || null,
          payment_mode: data.payment_mode || null,
        });
        if (error) throw error;
        toast.success(`Payment recorded! Receipt: ${receiptNumber}`);
      }
      onSuccess?.();
    } catch (err) {
      toast.error(err.message ?? "Failed to save payment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Student Selector */}
      <div className="space-y-1.5">
        <Label>Student *</Label>
        <Input
          placeholder="Search student by name or ID..."
          value={studentSearch}
          onChange={(e) => setStudentSearch(e.target.value)}
          className="mb-1"
        />
        <div className="border rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-gray-900">
          {filteredStudents.slice(0, 20).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setValue("student_id", s.id);
                setStudentSearch(s.full_name);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                watch("student_id") === s.id ? "bg-[#0d1b2a]/5 font-medium" : ""
              }`}
            >
              <span className="font-medium">{s.full_name}</span>
              <span className="ml-2 text-xs text-gray-400 font-mono">{s.student_id}</span>
            </button>
          ))}
          {filteredStudents.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-4">No students found</p>
          )}
        </div>
        {errors.student_id && <p className="text-xs text-red-500">{errors.student_id.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Fee Type *</Label>
          <Select onValueChange={(v) => setValue("fee_type", v)} defaultValue={billing?.fee_type}>
            <SelectTrigger>
              <SelectValue placeholder="Select fee type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Monthly">Monthly</SelectItem>
              <SelectItem value="Quarterly">Quarterly</SelectItem>
              <SelectItem value="Annual">Annual</SelectItem>
            </SelectContent>
          </Select>
          {errors.fee_type && <p className="text-xs text-red-500">{errors.fee_type.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Amount (₹) *</Label>
          <Input type="number" placeholder="2500" min="0" step="0.01" {...register("amount")} />
          {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Payment For (Month) *</Label>
          <Input type="month" {...register("payment_month")} />
          {errors.payment_month && (
            <p className="text-xs text-red-500">{errors.payment_month.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Valid Till *</Label>
          <Input type="date" {...register("valid_till")} />
          {errors.valid_till && <p className="text-xs text-red-500">{errors.valid_till.message}</p>}
          <p className="text-xs text-gray-400">Payment covers the student until this date</p>
        </div>

        <div className="space-y-1.5">
          <Label>Payment Date</Label>
          <Input type="date" {...register("payment_date")} />
          <p className="text-xs text-gray-400">Leave blank if payment pending</p>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>Payment Mode</Label>
          <Select
            onValueChange={(v) => setValue("payment_mode", v)}
            defaultValue={billing?.payment_mode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea placeholder="Any additional notes..." rows={2} {...register("notes")} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#0d1b2a] hover:bg-[#1a2f4a] text-white flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : billing ? (
            "Update Payment"
          ) : (
            "Record Payment"
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
