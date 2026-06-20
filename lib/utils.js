import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a student ID in format CA-YYYY-XXX
 * @param {number} sequence - sequential number
 */
export function generateStudentId(sequence) {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(3, "0");
  return `CA-${year}-${padded}`;
}

/**
 * Generate a receipt number in format RCP-YYYY-XXX
 * @param {number} sequence - sequential number
 */
export function generateReceiptNumber(sequence) {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(3, "0");
  return `RCP-${year}-${padded}`;
}

/**
 * Compute billing status based on dates
 * @param {Date|null} paymentDate
 * @param {Date} dueDate
 */
export function computeBillingStatus(paymentDate, dueDate) {
  if (paymentDate) return "Paid";
  if (new Date() > new Date(dueDate)) return "Overdue";
  return "Pending";
}

/**
 * Format a date to display string
 * @param {Date|string} date
 */
/** @param {string | Date | null | undefined} date */
export function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format currency in INR
 * @param {number|string} amount
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));
}
