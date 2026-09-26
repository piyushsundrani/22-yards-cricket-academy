"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { staffSchema } from "@/lib/validations";
import { supabase } from "@/lib/supabase";
import { generateStaffId } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLES = ["Head Coach", "Coach", "Assistant Coach", "Admin", "Support"];

/**
 * @param {{
 *   staff?: any;
 *   onSuccess: () => void;
 *   onCancel: () => void;
 * }} props
 */
export default function StaffForm({ staff, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(staffSchema),
    defaultValues: staff
      ? {
          full_name: staff.full_name,
          phone: staff.phone,
          email: staff.email ?? "",
          role: staff.role,
          joining_date: staff.joining_date?.split("T")[0] ?? "",
        }
      : {
          joining_date: new Date().toISOString().split("T")[0],
        },
  });

  const role = watch("role");

  async function onSubmit(data) {
    setLoading(true);
    try {
      const payload = {
        full_name: data.full_name,
        phone: data.phone,
        email: data.email || null,
        role: data.role,
        joining_date: data.joining_date,
      };

      if (staff) {
        const { error } = await supabase.from("staff").update(payload).eq("id", staff.id);
        if (error) throw error;
        toast.success("Staff member updated");
      } else {
        const { count } = await supabase.from("staff").select("*", { count: "exact", head: true });
        const staffId = generateStaffId((count ?? 0) + 1);

        const { error } = await supabase.from("staff").insert({ ...payload, staff_id: staffId });
        if (error) throw error;
        toast.success("Staff member registered");
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
      {/* Full Name */}
      <div className="space-y-1.5">
        <Label htmlFor="full_name">Full Name *</Label>
        <Input id="full_name" {...register("full_name")} placeholder="e.g. Rahul Sharma" />
        {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input id="phone" {...register("phone")} placeholder="10-digit mobile number" />
        {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" {...register("email")} placeholder="staff@example.com" />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      {/* Role */}
      <div className="space-y-1.5">
        <Label>Role *</Label>
        <Select value={role} onValueChange={(v) => setValue("role", v, { shouldValidate: true })}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
      </div>

      {/* Joining Date */}
      <div className="space-y-1.5">
        <Label htmlFor="joining_date">Joining Date *</Label>
        <Input id="joining_date" type="date" {...register("joining_date")} />
        {errors.joining_date && (
          <p className="text-xs text-red-500">{errors.joining_date.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#0d1b2a] hover:bg-[#1a2f4a] text-white"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {staff ? "Update Staff" : "Register Staff"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
