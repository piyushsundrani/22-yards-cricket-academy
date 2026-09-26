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
 * Generate a staff ID in format ST-YYYY-XXX
 * @param {number} sequence - sequential number
 */
export function generateStaffId(sequence) {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(3, "0");
  return `ST-${year}-${padded}`;
}

/**
 * Generate an expense ID in format EXP-YYYY-XXX
 * @param {number} sequence - sequential number
 */
export function generateExpenseId(sequence) {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(3, "0");
  return `EXP-${year}-${padded}`;
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
 * @param {Date} validTill - date through which a paid record remains valid
 */
export function computeBillingStatus(paymentDate, dueDate, validTill) {
  if (paymentDate) {
    if (validTill && new Date() > new Date(validTill)) return "Expired";
    return "Paid";
  }
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
 * Format a date as "Mon YYYY" (e.g. the billing period)
 * @param {Date|string} date
 */
export function formatMonthYear(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
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
