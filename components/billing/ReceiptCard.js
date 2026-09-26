"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { formatDate, formatCurrency, formatMonthYear } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

export default function ReceiptCard({ billing, student }) {
  const receiptRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${billing?.receipt_number}`,
  });

  async function handleDownloadPdf() {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });

    // Fetch logo and embed in PDF header
    let logoBase64 = null;
    try {
      const res = await fetch("/22-yards.jpeg");
      const blob = await res.blob();
      logoBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (_) {}

    doc.setFillColor(13, 27, 42);
    doc.rect(0, 0, 148, 32, "F");

    if (logoBase64) {
      doc.addImage(logoBase64, "JPEG", 8, 4, 24, 24);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("22 Yards Cricket Academy", 100, 14, { align: "center" });
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text("By Chauhan's", 100, 21, { align: "center" });
    doc.setFontSize(7);
    doc.setTextColor(201, 168, 76);
    doc.text("Student Records Management System", 100, 28, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("PAYMENT RECEIPT", 74, 42, { align: "center" });

    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    const rows = [
      ["Receipt No.", billing.receipt_number],
      ["Date", formatDate(billing.payment_date || billing.created_at)],
      ["Student ID", student?.student_id ?? "-"],
      ["Student Name", student?.full_name ?? "-"],
      ["Batch", student?.batch ?? "-"],
      ["Fee Type", billing.fee_type],
      ["For Month", formatMonthYear(billing.payment_month)],
      ["Amount", formatCurrency(billing.amount)],
      ["Due Date", formatDate(billing.due_date)],
      ["Payment Mode", billing.payment_mode ?? "-"],
      ["Status", billing.status],
    ];

    let y = 52;
    rows.forEach(([label, value]) => {
      doc.setFont(undefined, "bold");
      doc.text(`${label}:`, 15, y);
      doc.setFont(undefined, "normal");
      doc.text(String(value), 60, y);
      y += 8;
    });

    if (billing.notes) {
      doc.text(`Notes: ${billing.notes}`, 15, y + 4);
    }

    doc.save(`Receipt-${billing.receipt_number}.pdf`);
  }

  if (!billing || !student) return null;

  const statusColor = {
    Paid: "text-green-700 bg-green-50",
    Pending: "text-yellow-700 bg-yellow-50",
    Overdue: "text-red-700 bg-red-50",
    Expired: "text-gray-700 bg-gray-100",
  };

  return (
    <div>
      {/* Printable Receipt */}
      <div
        ref={receiptRef}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-md mx-auto print:shadow-none print:border-0"
      >
        {/* Header */}
        <div className="bg-[#0d1b2a] text-white px-6 py-5 text-center">
          <img
            src="/22-yards.jpeg"
            alt="22 Yards Cricket Academy"
            style={{
              width: 64,
              height: 64,
              borderRadius: 10,
              display: "block",
              margin: "0 auto 10px",
            }}
          />
          <h3 className="font-bold text-lg leading-tight">22 Yards Cricket Academy</h3>
          <p className="text-sm text-[#c9a84c] font-medium">By Chauhan&apos;s</p>
          <p className="text-xs text-white/50 mt-0.5">Student Records Management System</p>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider">
              Payment Receipt
            </h4>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[billing.status]}`}
            >
              {billing.status}
            </span>
          </div>

          <div className="space-y-2.5 text-sm">
            {[
              ["Receipt No.", billing.receipt_number],
              ["Date", formatDate(billing.payment_date || billing.created_at)],
              ["Student ID", student.student_id],
              ["Student Name", student.full_name],
              ["Batch", student.batch],
              ["Fee Type", billing.fee_type],
              ["For Month", formatMonthYear(billing.payment_month)],
              ["Due Date", formatDate(billing.due_date)],
              ["Payment Mode", billing.payment_mode ?? "-"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-800">{value}</span>
              </div>
            ))}

            <div className="flex justify-between pt-2">
              <span className="font-bold text-gray-800">Total Amount</span>
              <span className="font-bold text-xl text-[#0d1b2a]">
                {formatCurrency(billing.amount)}
              </span>
            </div>
          </div>

          {billing.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">
                <span className="font-medium">Notes:</span> {billing.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <Button variant="outline" onClick={handlePrint} className="flex-1">
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button
          onClick={handleDownloadPdf}
          className="flex-1 bg-[#0d1b2a] hover:bg-[#1a2f4a] text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
