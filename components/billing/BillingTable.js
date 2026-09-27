"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { formatDate, formatCurrency, formatMonthYear } from "@/lib/utils";
import { Pencil, Printer, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { IconActionButton } from "@/components/ui/tooltip";
import BillingForm from "./BillingForm";
import ReceiptCard from "./ReceiptCard";

const STATUS_COLORS = {
  Paid: "bg-green-100 text-green-700 hover:bg-green-100",
  Pending: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  Overdue: "bg-red-100 text-red-700 hover:bg-red-100",
  Expired: "bg-gray-200 text-gray-700 hover:bg-gray-200",
};

export default function BillingTable({ data, students, loading, onRefresh }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [feeTypeFilter, setFeeTypeFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [editBilling, setEditBilling] = useState(null);
  const [receiptBilling, setReceiptBilling] = useState(null);

  const studentMap = useMemo(() => {
    const m = {};
    (students ?? []).forEach((s) => {
      m[s.id] = s;
    });
    return m;
  }, [students]);

  const filteredData = useMemo(() => {
    return (data ?? []).filter((b) => {
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      const matchesFeeType = feeTypeFilter === "all" || b.fee_type === feeTypeFilter;
      const matchesMonth = !monthFilter || b.payment_month?.slice(0, 7) === monthFilter;
      const matchesFrom = !dateFrom || new Date(b.due_date) >= new Date(dateFrom);
      const matchesTo = !dateTo || new Date(b.due_date) <= new Date(dateTo);
      return matchesStatus && matchesFeeType && matchesMonth && matchesFrom && matchesTo;
    });
  }, [data, statusFilter, feeTypeFilter, monthFilter, dateFrom, dateTo]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "receipt_number",
        header: "Receipt No.",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-gray-500">{getValue()}</span>
        ),
      },
      {
        accessorKey: "student_id",
        header: "Student",
        cell: ({ getValue }) => studentMap[getValue()]?.full_name ?? "-",
      },
      {
        accessorKey: "fee_type",
        header: "Fee Type",
        cell: ({ getValue }) => (
          <Badge variant="outline" className="text-xs">
            {getValue()}
          </Badge>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue())}</span>,
      },
      {
        accessorKey: "payment_month",
        header: "For Month",
        cell: ({ getValue }) => formatMonthYear(getValue()),
      },
      {
        accessorKey: "due_date",
        header: "Due Date",
        cell: ({ getValue }) => formatDate(getValue()),
      },
      {
        accessorKey: "payment_date",
        header: "Paid On",
        cell: ({ getValue }) => (getValue() ? formatDate(getValue()) : "-"),
      },
      {
        accessorKey: "payment_mode",
        header: "Mode",
        cell: ({ getValue }) => getValue() ?? "-",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <Badge className={STATUS_COLORS[getValue()] ?? ""}>{getValue()}</Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <IconActionButton
              label="Edit payment"
              onClick={() => setEditBilling(row.original)}
              className="hover:bg-blue-50 hover:text-blue-600"
            >
              <Pencil className="w-4 h-4" />
            </IconActionButton>
            <IconActionButton
              label="View / print receipt"
              onClick={() => setReceiptBilling(row.original)}
              className="hover:bg-gray-100 hover:text-gray-700"
            >
              <Printer className="w-4 h-4" />
            </IconActionButton>
          </div>
        ),
      },
    ],
    [studentMap]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={feeTypeFilter} onValueChange={setFeeTypeFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Fee Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Monthly">Monthly</SelectItem>
            <SelectItem value="Quarterly">Quarterly</SelectItem>
            <SelectItem value="Annual">Annual</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="w-full sm:w-40"
          placeholder="For Month"
        />
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-full sm:w-40"
          placeholder="From date"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-full sm:w-40"
          placeholder="To date"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
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
                <td colSpan={columns.length} className="text-center py-12 text-gray-400">
                  No billing records found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
        <p className="text-sm text-gray-500">
          Showing {table.getRowModel().rows.length} of {filteredData.length} records
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
          <span className="text-sm text-gray-600">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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

      {/* Edit Sheet */}
      <Sheet open={!!editBilling} onOpenChange={() => setEditBilling(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Payment Record</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {editBilling && (
              <BillingForm
                billing={editBilling}
                students={students}
                onSuccess={() => {
                  setEditBilling(null);
                  onRefresh?.();
                }}
                onCancel={() => setEditBilling(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Receipt Sheet */}
      <Sheet open={!!receiptBilling} onOpenChange={() => setReceiptBilling(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Payment Receipt</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {receiptBilling && (
              <ReceiptCard
                billing={receiptBilling}
                student={studentMap[receiptBilling.student_id]}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
