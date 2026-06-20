import { z } from "zod";

export const studentSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"], { required_error: "Gender is required" }),
  contact_number: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  guardian_name: z.string().min(2, "Guardian name must be at least 2 characters"),
  address: z.string().optional(),
  batch: z.enum(["Morning", "Evening", "Weekend"], { required_error: "Batch is required" }),
  level: z.enum(["Beginner", "Intermediate", "Advanced"], {
    required_error: "Level is required",
  }),
  enrollment_date: z.string().min(1, "Enrollment date is required"),
  photo_url: z.string().optional(),
});

export const billingSchema = z.object({
  student_id: z.string().uuid("Select a valid student"),
  fee_type: z.enum(["Monthly", "Quarterly", "Annual"], {
    required_error: "Fee type is required",
  }),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Amount must be a positive number"),
  payment_date: z.string().optional(),
  due_date: z.string().min(1, "Due date is required"),
  payment_mode: z.enum(["Cash", "UPI", "Bank Transfer"]).optional(),
  notes: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
