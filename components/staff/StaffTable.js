"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Search, Pencil, UserX, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import StaffForm from "./StaffForm";

const ROLE_COLORS = {
  "Head Coach": "bg-purple-100 text-purple-700",
  Coach: "bg-blue-100 text-blue-700",
  "Assistant Coach": "bg-indigo-100 text-indigo-700",
  Admin: "bg-gray-100 text-gray-700",
  Support: "bg-teal-100 text-teal-700",
};

/**
 * @param {{ data: any[]; loading: boolean; onRefresh?: () => void }} props
 */
export default function StaffTable({ data, loading, onRefresh }) {
  const [search, setSearch] = useState("");
  const [editStaff, setEditStaff] = useState(/** @type {any | null} */ (null));

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();
    return (data ?? []).filter(
      (s) =>
        !q ||
        s.full_name.toLowerCase().includes(q) ||
        s.staff_id.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.phone.includes(q)
    );
  }, [data, search]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "staff_id",
        header: "Staff ID",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-gray-500">
            {/** @type {string} */ (getValue())}
          </span>
        ),
      },
      { accessorKey: "full_name", header: "Name" },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ getValue }) => {
          const role = /** @type {string} */ (getValue());
          return (
            <Badge
              className={`${ROLE_COLORS[role] ?? "bg-gray-100 text-gray-700"} hover:opacity-90 text-xs`}
            >
              {role}
            </Badge>
          );
        },
      },
      { accessorKey: "phone", header: "Phone" },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => /** @type {string | null} */ (getValue()) ?? "-",
      },
      {
        accessorKey: "joining_date",
        header: "Joined",
        cell: ({ getValue }) => formatDate(/** @type {string} */ (getValue())),
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ getValue }) => (
          <Badge
            className={
              /** @type {boolean} */ (getValue())
                ? "bg-green-100 text-green-700 hover:bg-green-100"
                : "bg-gray-100 text-gray-500 hover:bg-gray-100"
            }
          >
            {/** @type {boolean} */ (getValue()) ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditStaff(row.original)}
              className="p-1.5 hover:bg-blue-50 rounded-md transition-colors text-gray-500 hover:text-blue-600"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeactivate(row.original)}
              disabled={!row.original.is_active}
              className="p-1.5 hover:bg-red-50 rounded-md transition-colors text-gray-500 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <UserX className="w-4 h-4" />
            </button>
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
    initialState: { pagination: { pageSize: 10 } },
  });

  /** @param {any} staff */
  async function handleDeactivate(staff) {
    if (!staff.is_active) return;
    if (!confirm(`Deactivate ${staff.full_name}?`)) return;
    const { error } = await supabase.from("staff").update({ is_active: false }).eq("id", staff.id);
    if (error) {
      toast.error("Failed to deactivate staff");
    } else {
      toast.success("Staff member deactivated");
      onRefresh?.();
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by name, ID, role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
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
                  No staff members found
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
          Showing {table.getRowModel().rows.length} of {filteredData.length} staff
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
      <Sheet open={!!editStaff} onOpenChange={() => setEditStaff(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Staff Member</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {editStaff && (
              <StaffForm
                staff={editStaff}
                onSuccess={() => {
                  setEditStaff(null);
                  onRefresh?.();
                }}
                onCancel={() => setEditStaff(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
