"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { supabase } from "@/lib/supabase";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Pencil, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { IconActionButton } from "@/components/ui/tooltip";
import ExpenseForm from "./ExpenseForm";

const CATEGORIES = [
  "Ground Maintenance",
  "Equipment",
  "Salary",
  "Utilities",
  "Travel",
  "Food & Refreshment",
  "Miscellaneous",
];

const CATEGORY_COLORS = {
  "Ground Maintenance": "bg-green-100 text-green-700",
  Equipment: "bg-blue-100 text-blue-700",
  Salary: "bg-purple-100 text-purple-700",
  Utilities: "bg-orange-100 text-orange-700",
  Travel: "bg-cyan-100 text-cyan-700",
  "Food & Refreshment": "bg-yellow-100 text-yellow-700",
  Miscellaneous: "bg-gray-100 text-gray-700",
};

/**
 * @param {{ data: any[]; loading: boolean; onRefresh: () => void }} props
 */
export default function ExpenseTable({ data, loading, onRefresh }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [editExpense, setEditExpense] = useState(/** @type {any | null} */ (null));

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();
    return (data ?? []).filter((e) => {
      const matchesSearch =
        !q ||
        e.description.toLowerCase().includes(q) ||
        e.expense_id.toLowerCase().includes(q) ||
        (e.paid_by ?? "").toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "all" || e.category === categoryFilter;
      const matchesFrom = !dateFrom || new Date(e.date) >= new Date(dateFrom);
      const matchesTo = !dateTo || new Date(e.date) <= new Date(dateTo);
      return matchesSearch && matchesCategory && matchesFrom && matchesTo;
    });
  }, [data, search, categoryFilter, dateFrom, dateTo]);

  // Category breakdown for filtered data
  const categoryBreakdown = useMemo(() => {
    const map = {};
    filteredData.forEach((e) => {
      map[e.category] = (map[e.category] ?? 0) + Number(e.amount);
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [filteredData]);

  const totalAmount = useMemo(
    () => filteredData.reduce((sum, e) => sum + Number(e.amount), 0),
    [filteredData]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "expense_id",
        header: "Expense ID",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-gray-500">
            {/** @type {string} */ (getValue())}
          </span>
        ),
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ getValue }) => formatDate(/** @type {string} */ (getValue())),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ getValue }) => {
          const cat = /** @type {string} */ (getValue());
          return (
            <Badge
              className={`${CATEGORY_COLORS[cat] ?? "bg-gray-100 text-gray-700"} hover:opacity-90 text-xs whitespace-nowrap`}
            >
              {cat}
            </Badge>
          );
        },
      },
      { accessorKey: "description", header: "Description" },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }) => (
          <span className="font-semibold text-gray-800 dark:text-gray-100">
            {formatCurrency(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "paid_by",
        header: "Paid By",
        cell: ({ getValue }) => /** @type {string | null} */ (getValue()) ?? "-",
      },
      {
        accessorKey: "payment_mode",
        header: "Mode",
        cell: ({ getValue }) => /** @type {string | null} */ (getValue()) ?? "-",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <IconActionButton
              label="Edit expense"
              onClick={() => setEditExpense(row.original)}
              className="hover:bg-blue-50 hover:text-blue-600"
            >
              <Pencil className="w-4 h-4" />
            </IconActionButton>
            <IconActionButton
              label="Delete expense"
              onClick={() => handleDelete(row.original)}
              className="hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </IconActionButton>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  /** @param {any} expense */
  async function handleDelete(expense) {
    if (!confirm(`Delete expense "${expense.description}" (${formatCurrency(expense.amount)})?`))
      return;
    const { error } = await supabase.from("expenses").delete().eq("id", expense.id);
    if (error) {
      toast.error("Failed to delete expense");
    } else {
      toast.success("Expense deleted");
      onRefresh();
    }
  }

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
      {/* Category breakdown chips */}
      {categoryBreakdown.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {categoryBreakdown.map(([cat, amt]) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat === categoryFilter ? "all" : cat)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                CATEGORY_COLORS[cat] ?? "bg-gray-100 text-gray-700"
              } ${categoryFilter === cat ? "ring-2 ring-offset-1 ring-current" : "hover:opacity-80"}`}
            >
              {cat}
              <span className="font-bold">{formatCurrency(amt)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 mb-4">
        <div className="relative sm:flex-1 sm:min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search description, ID, paid by..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <div className="space-y-0.5 flex-1">
            <Label className="text-xs text-gray-500 pl-0.5">From</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full sm:w-40"
            />
          </div>
          <div className="space-y-0.5 flex-1">
            <Label className="text-xs text-gray-500 pl-0.5">To</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full sm:w-40"
            />
          </div>
        </div>
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
                    className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
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
                  No expense records found
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
          {filteredData.length > 0 && (
            <tfoot className="bg-gray-50 dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-600">
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Total ({filteredData.length} records)
                </td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(totalAmount)}
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          )}
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
      <Sheet open={!!editExpense} onOpenChange={() => setEditExpense(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Expense</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {editExpense && (
              <ExpenseForm
                expense={editExpense}
                onSuccess={() => {
                  setEditExpense(null);
                  onRefresh();
                }}
                onCancel={() => setEditExpense(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
