import { z } from "zod";

export const studentSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"], { required_error: "Gender is required" }),
  school: z.string().optional(),
  aadhar_number: z
    .string()
    .regex(/^\d{12}$/, "Aadhar must be 12 digits")
    .or(z.literal(""))
    .optional(),
  email: z.string().email("Enter a valid email").or(z.literal("")).optional(),
  blood_group: z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]).optional(),
  father_name: z.string().optional(),
  mother_name: z.string().optional(),
  guardian_name: z.string().min(2, "Guardian name must be at least 2 characters"),
  contact_number: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  occupation: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_number: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .or(z.literal(""))
    .optional(),
  address: z.string().optional(),
  batch: z.enum(["Morning", "Evening", "Weekend"], { required_error: "Batch is required" }),
  level: z.enum(["Beginner", "Intermediate", "Advanced"], { required_error: "Level is required" }),
  batting_style: z.enum(["Right-hand", "Left-hand"]).optional(),
  bowling_style: z.enum(["Fast", "Medium", "Spin", "N/A"]).optional(),
  referral_source: z.string().optional(),
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
  payment_month: z.string().regex(/^\d{4}-\d{2}$/, "Select the month this payment is for"),
  payment_date: z.string().optional(),
  valid_till: z.string().min(1, "Valid till date is required"),
  payment_mode: z.enum(["Cash", "UPI", "Bank Transfer"]).optional(),
  notes: z.string().optional(),
});

export const staffSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Enter a valid email").or(z.literal("")).optional(),
  role: z.enum(["Head Coach", "Coach", "Assistant Coach", "Admin", "Support"], {
    required_error: "Role is required",
  }),
  joining_date: z.string().min(1, "Joining date is required"),
});

export const expenseSchema = z.object({
  date: z.string().min(1, "Date is required"),
  category: z.enum(
    [
      "Ground Maintenance",
      "Equipment",
      "Salary",
      "Utilities",
      "Travel",
      "Food & Refreshment",
      "Miscellaneous",
    ],
    { required_error: "Category is required" }
  ),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Amount must be a positive number"),
  description: z.string().min(2, "Description must be at least 2 characters"),
  paid_by: z.string().optional(),
  payment_mode: z.enum(["Cash", "UPI", "Bank Transfer"]).optional(),
  notes: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
