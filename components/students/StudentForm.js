"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentSchema } from "@/lib/validations";
import { supabase, uploadStudentPhoto } from "@/lib/supabase";
import { generateStudentId } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
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
import Image from "next/image";

/**
 * @param {{
 *   student?: {
 *     id: string;
 *     student_id: string;
 *     full_name: string;
 *     date_of_birth?: string;
 *     gender: "Male" | "Female" | "Other";
 *     contact_number: string;
 *     guardian_name: string;
 *     address?: string;
 *     batch: "Morning" | "Evening" | "Weekend";
 *     level: "Beginner" | "Intermediate" | "Advanced";
 *     enrollment_date?: string;
 *     photo_url?: string | null;
 *   } | null;
 *   onSuccess?: () => void;
 *   onCancel?: () => void;
 * }} props
 */
export default function StudentForm({ student, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(/** @type {File | null} */ (null));
  const [photoPreview, setPhotoPreview] = useState(student?.photo_url ?? null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: student
      ? {
          full_name: student.full_name,
          date_of_birth: student.date_of_birth?.split("T")[0] ?? "",
          gender: /** @type {"Male" | "Female" | "Other"} */ (student.gender),
          contact_number: student.contact_number,
          guardian_name: student.guardian_name,
          address: student.address ?? "",
          batch: /** @type {"Morning" | "Evening" | "Weekend"} */ (student.batch),
          level: /** @type {"Beginner" | "Intermediate" | "Advanced"} */ (student.level),
          enrollment_date: student.enrollment_date?.split("T")[0] ?? "",
        }
      : {
          enrollment_date: new Date().toISOString().split("T")[0],
        },
  });

  /** @param {import("react").ChangeEvent<HTMLInputElement>} e */
  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  /** @param {Record<string, any>} data */
  async function onSubmit(data) {
    setLoading(true);
    try {
      let photoUrl = student?.photo_url ?? null;

      if (photoFile) {
        const tempId = student?.student_id ?? `temp-${Date.now()}`;
        photoUrl = await uploadStudentPhoto(photoFile, tempId);
      }

      if (student) {
        const { error } = await supabase
          .from("students")
          .update({ ...data, photo_url: photoUrl })
          .eq("id", student.id);
        if (error) throw error;
        toast.success("Student updated successfully");
      } else {
        // Get count to generate sequential ID
        const { count } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true });
        const studentId = generateStudentId((count ?? 0) + 1);

        const { error } = await supabase.from("students").insert({
          ...data,
          student_id: studentId,
          photo_url: photoUrl,
        });
        if (error) throw error;
        toast.success(`Student registered! ID: ${studentId}`);
      }

      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save student";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Photo Upload */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
          {photoPreview ? (
            <>
              <Image src={photoPreview} alt="Preview" fill className="object-cover" />
              <button
                type="button"
                onClick={() => {
                  setPhotoPreview(null);
                  setPhotoFile(null);
                }}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <Upload className="w-6 h-6 text-gray-400" />
          )}
        </div>
        <div>
          <Label htmlFor="photo" className="cursor-pointer">
            <span className="text-sm text-[#0d1b2a] font-medium hover:underline">
              {photoPreview ? "Change photo" : "Upload photo"}
            </span>
          </Label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <p className="text-xs text-gray-400 mt-0.5">JPG, PNG up to 2MB</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Full Name *</Label>
          <Input placeholder="e.g. Arjun Sharma" {...register("full_name")} />
          {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Date of Birth *</Label>
          <Input type="date" {...register("date_of_birth")} />
          {errors.date_of_birth && (
            <p className="text-xs text-red-500">{errors.date_of_birth.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Gender *</Label>
          <Select
            onValueChange={(v) =>
              setValue("gender", /** @type {"Male" | "Female" | "Other"} */ (v))
            }
            defaultValue={student?.gender}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && <p className="text-xs text-red-500">{errors.gender.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Contact Number *</Label>
          <Input placeholder="9876543210" {...register("contact_number")} />
          {errors.contact_number && (
            <p className="text-xs text-red-500">{errors.contact_number.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Guardian Name *</Label>
          <Input placeholder="Parent / Guardian name" {...register("guardian_name")} />
          {errors.guardian_name && (
            <p className="text-xs text-red-500">{errors.guardian_name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Enrollment Date *</Label>
          <Input type="date" {...register("enrollment_date")} />
          {errors.enrollment_date && (
            <p className="text-xs text-red-500">{errors.enrollment_date.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Batch *</Label>
          <Select
            onValueChange={(v) =>
              setValue("batch", /** @type {"Morning" | "Evening" | "Weekend"} */ (v))
            }
            defaultValue={student?.batch}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Morning">Morning</SelectItem>
              <SelectItem value="Evening">Evening</SelectItem>
              <SelectItem value="Weekend">Weekend</SelectItem>
            </SelectContent>
          </Select>
          {errors.batch && <p className="text-xs text-red-500">{errors.batch.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Level *</Label>
          <Select
            onValueChange={(v) =>
              setValue("level", /** @type {"Beginner" | "Intermediate" | "Advanced"} */ (v))
            }
            defaultValue={student?.level}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          {errors.level && <p className="text-xs text-red-500">{errors.level.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Address</Label>
        <Textarea placeholder="Full address" rows={3} {...register("address")} />
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
          ) : student ? (
            "Update Student"
          ) : (
            "Register Student"
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
