"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Search, ChevronLeft, ChevronRight, Pencil, Eye, UserX } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import StudentForm from "./StudentForm";

/**
 * @typedef {{
 *   id: string;
 *   student_id: string;
 *   full_name: string;
 *   date_of_birth?: string;
 *   gender: "Male" | "Female" | "Other";
 *   school?: string;
 *   aadhar_number?: string;
 *   email?: string;
 *   blood_group?: string;
 *   father_name?: string;
 *   mother_name?: string;
 *   guardian_name: string;
 *   contact_number: string;
 *   occupation?: string;
 *   emergency_contact_name?: string;
 *   emergency_contact_number?: string;
 *   address?: string;
 *   batch: "Morning" | "Evening" | "Weekend";
 *   level: "Beginner" | "Intermediate" | "Advanced";
 *   batting_style?: string;
 *   bowling_style?: string;
 *   referral_source?: string;
 *   enrollment_date?: string;
 *   is_active: boolean;
 *   photo_url?: string | null;
 * }} Student
 */

/**
 * @param {{
 *   data: Student[] | null;
 *   loading: boolean;
 *   onRefresh?: () => void;
 * }} props
 */
export default function StudentTable({ data, loading, onRefresh }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editStudent, setEditStudent] = useState(/** @type {Student | null} */ (null));
  const [viewStudent, setViewStudent] = useState(/** @type {Student | null} */ (null));

  const filteredData = useMemo(() => {
    return (data ?? []).filter((s) => {
      const matchesSearch =
        !globalFilter ||
        s.full_name.toLowerCase().includes(globalFilter.toLowerCase()) ||
        s.student_id.toLowerCase().includes(globalFilter.toLowerCase());
      const matchesBatch = batchFilter === "all" || s.batch === batchFilter;
      const matchesLevel = levelFilter === "all" || s.level === levelFilter;
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "active" ? s.is_active : !s.is_active);
      return matchesSearch && matchesBatch && matchesLevel && matchesStatus;
    });
  }, [data, globalFilter, batchFilter, levelFilter, statusFilter]);

  const columns = useMemo(
    () =>
      /** @type {import("@tanstack/react-table").ColumnDef<Student>[]} */ ([
        {
          accessorKey: "student_id",
          header: "Student ID",
          cell: ({ getValue }) => (
            <span className="font-mono text-xs text-gray-500">
              {/** @type {string} */ (getValue())}
            </span>
          ),
        },
        { accessorKey: "full_name", header: "Name" },
        {
          accessorKey: "batch",
          header: "Batch",
          cell: ({ getValue }) => (
            <Badge variant="outline" className="text-xs">
              {/** @type {string} */ (getValue())}
            </Badge>
          ),
        },
        { accessorKey: "level", header: "Level" },
        {
          accessorKey: "enrollment_date",
          header: "Enrolled",
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
              <IconActionButton
                label="View student details"
                onClick={() => setViewStudent(row.original)}
                className="hover:bg-gray-100 hover:text-gray-700"
              >
                <Eye className="w-4 h-4" />
              </IconActionButton>
              <IconActionButton
                label="Edit student"
                onClick={() => setEditStudent(row.original)}
                className="hover:bg-blue-50 hover:text-blue-600"
              >
                <Pencil className="w-4 h-4" />
              </IconActionButton>
              <IconActionButton
                label={row.original.is_active ? "Deactivate student" : "Already inactive"}
                onClick={() => handleDeactivate(row.original)}
                disabled={!row.original.is_active}
                className="hover:bg-red-50 hover:text-red-500"
              >
                <UserX className="w-4 h-4" />
              </IconActionButton>
            </div>
          ),
        },
      ]),
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  /** @param {Student} student */
  async function handleDeactivate(student) {
    if (!student.is_active) return;
    const confirmed = confirm(`Deactivate ${student.full_name}?`);
    if (!confirmed) return;
    const { error } = await supabase
      .from("students")
      .update({ is_active: false })
      .eq("id", student.id);
    if (error) {
      toast.error("Failed to deactivate student");
    } else {
      toast.success("Student deactivated");
      onRefresh?.();
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
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 mb-4">
        <div className="relative sm:flex-1 sm:min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or ID..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <Select value={batchFilter} onValueChange={setBatchFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Batch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            <SelectItem value="Morning">Morning</SelectItem>
            <SelectItem value="Evening">Evening</SelectItem>
            <SelectItem value="Weekend">Weekend</SelectItem>
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
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
                  No students found
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
          Showing {table.getRowModel().rows.length} of {filteredData.length} students
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
      <Sheet open={!!editStudent} onOpenChange={() => setEditStudent(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Student</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {editStudent && (
              <StudentForm
                student={editStudent}
                onSuccess={() => {
                  setEditStudent(null);
                  onRefresh?.();
                }}
                onCancel={() => setEditStudent(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* View Sheet */}
      <Sheet open={!!viewStudent} onOpenChange={() => setViewStudent(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Student Details</SheetTitle>
          </SheetHeader>
          {viewStudent && (
            <div className="mt-6 space-y-4">
              {viewStudent.photo_url && (
                <div className="flex justify-center">
                  <img
                    src={viewStudent.photo_url}
                    alt={viewStudent.full_name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#0d1b2a]/20"
                  />
                </div>
              )}
              {[
                ["Student ID", viewStudent.student_id],
                ["Full Name", viewStudent.full_name],
                ["Date of Birth", formatDate(viewStudent.date_of_birth)],
                ["Gender", viewStudent.gender],
                ["Contact", viewStudent.contact_number],
                ["Guardian", viewStudent.guardian_name],
                ["Address", viewStudent.address || "-"],
                ["Batch", viewStudent.batch],
                ["Level", viewStudent.level],
                ["Enrolled", formatDate(viewStudent.enrollment_date)],
                ["Status", viewStudent.is_active ? "Active" : "Inactive"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b pb-2">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
