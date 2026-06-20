"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_COLORS = {
  Paid: "bg-green-100 text-green-700 hover:bg-green-100",
  Pending: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  Overdue: "bg-red-100 text-red-700 hover:bg-red-100",
};

export default function ReportTable({ data }) {
  const [columnVisibility, setColumnVisibility] = useState({});

  const columns = useMemo(
    () => [
      { accessorKey: "student_id", header: "Student ID" },
      { accessorKey: "full_name", header: "Name" },
      { accessorKey: "batch", header: "Batch" },
      { accessorKey: "level", header: "Level" },
      {
        accessorKey: "enrollment_date",
        header: "Enrolled",
        cell: ({ getValue }) => formatDate(getValue()),
      },
      { accessorKey: "receipt_number", header: "Receipt No." },
      { accessorKey: "fee_type", header: "Fee Type" },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }) => formatCurrency(getValue() ?? 0),
      },
      {
        accessorKey: "due_date",
        header: "Due Date",
        cell: ({ getValue }) => (getValue() ? formatDate(getValue()) : "-"),
      },
      {
        accessorKey: "payment_date",
        header: "Paid On",
        cell: ({ getValue }) => (getValue() ? formatDate(getValue()) : "-"),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) =>
          getValue() ? (
            <Badge className={STATUS_COLORS[getValue()] ?? ""}>{getValue()}</Badge>
          ) : (
            "-"
          ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    initialState: { pagination: { pageSize: 15 } },
  });

  function exportCsv() {
    const rows = table.getPrePaginationRowModel().rows;
    const headers = columns
      .filter((c) => columnVisibility[c.accessorKey] !== false)
      .map((c) => c.header);
    const csvRows = rows.map((row) =>
      columns
        .filter((c) => columnVisibility[c.accessorKey] !== false)
        .map((c) => JSON.stringify(row.getValue(c.accessorKey) ?? ""))
        .join(",")
    );
    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cricket-academy-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPdf() {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    doc.setFillColor(13, 27, 42);
    doc.rect(0, 0, 297, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Cricket Academy - Report Export", 148, 11, { align: "center" });
    doc.setFontSize(7);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 280, 11, { align: "right" });

    const visibleCols = columns.filter((c) => columnVisibility[c.accessorKey] !== false);
    const headers = visibleCols.map((c) => c.header);
    const rows = table
      .getPrePaginationRowModel()
      .rows.map((row) => visibleCols.map((c) => String(row.getValue(c.accessorKey) ?? "")));

    let y = 26;
    const colWidth = 270 / headers.length;

    doc.setFontSize(7);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    headers.forEach((h, i) => doc.text(h, 12 + i * colWidth, y));
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(12, y, 285, y);
    y += 4;

    doc.setFont(undefined, "normal");
    rows.forEach((row) => {
      if (y > 195) {
        doc.addPage();
        y = 15;
      }
      row.forEach((cell, i) => {
        const truncated = String(cell).slice(0, 20);
        doc.text(truncated, 12 + i * colWidth, y);
      });
      y += 6;
    });

    doc.save(`cricket-report-${new Date().toISOString().split("T")[0]}.pdf`);
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {table.getAllColumns().map((col) => (
            <label
              key={col.id}
              className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={col.getIsVisible()}
                onChange={col.getToggleVisibilityHandler()}
                className="rounded"
              />
              {col.columnDef.header}
            </label>
          ))}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="w-4 h-4 mr-1.5" />
            CSV
          </Button>
          <Button
            size="sm"
            onClick={exportPdf}
            className="bg-[#0d1b2a] hover:bg-[#1a2f4a] text-white"
          >
            <Download className="w-4 h-4 mr-1.5" />
            PDF
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 dark:bg-gray-800">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="text-left px-3 py-2.5 font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-700">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-gray-400">
                  No data matches the selected filters
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
        <p className="text-xs text-gray-500">
          {table.getPrePaginationRowModel().rows.length} total records
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-gray-600">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
