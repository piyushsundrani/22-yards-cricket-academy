"use client";

import { useMemo, useState } from "react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_STYLES = {
  Present: "bg-green-100 text-green-700 hover:bg-green-100",
  Absent: "bg-red-100 text-red-700 hover:bg-red-100",
  Leave: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  "Half Day": "bg-blue-100 text-blue-700 hover:bg-blue-100",
};

/**
 * @param {{ records: any[]; staffMap: Record<string, any>; loading: boolean }} props
 */
export default function AttendanceTable({ records, staffMap, loading }) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [monthFilter, setMonthFilter] = useState(currentMonth);
  const [staffFilter, setStaffFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const staffList = useMemo(
    () => Object.values(staffMap).sort((a, b) => a.full_name.localeCompare(b.full_name)),
    [staffMap]
  );

  const filtered = useMemo(() => {
    return (records ?? []).filter((r) => {
      const matchesMonth = !monthFilter || r.date?.slice(0, 7) === monthFilter;
      const matchesStaff = staffFilter === "all" || r.staff_id === staffFilter;
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesMonth && matchesStaff && matchesStatus;
    });
  }, [records, monthFilter, staffFilter, statusFilter]);

  // Summary counts for filtered records
  const summary = useMemo(() => {
    const counts = { Present: 0, Absent: 0, Leave: 0, "Half Day": 0 };
    filtered.forEach((r) => {
      if (r.status in counts) counts[r.status]++;
    });
    return counts;
  }, [filtered]);

  // Sort by date descending, then by staff name
  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        if (dateDiff !== 0) return dateDiff;
        const nameA = staffMap[a.staff_id]?.full_name ?? "";
        const nameB = staffMap[b.staff_id]?.full_name ?? "";
        return nameA.localeCompare(nameB);
      }),
    [filtered, staffMap]
  );

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
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-4">
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Month</Label>
          <Input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Staff</Label>
          <Select value={staffFilter} onValueChange={setStaffFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {staffList.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Present">Present</SelectItem>
              <SelectItem value="Absent">Absent</SelectItem>
              <SelectItem value="Leave">Leave</SelectItem>
              <SelectItem value="Half Day">Half Day</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary chips */}
      {filtered.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(summary).map(([status, count]) =>
            count > 0 ? (
              <span
                key={status}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}
              >
                {status}: {count}
              </span>
            ) : null
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {["Date", "Staff ID", "Name", "Role", "Status"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-700">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  No attendance records found
                </td>
              </tr>
            ) : (
              sorted.map((record) => {
                const staff = staffMap[record.staff_id];
                return (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {staff?.staff_id ?? "-"}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">
                      {staff?.full_name ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {staff?.role ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={STATUS_STYLES[record.status] ?? ""}>{record.status}</Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500 mt-3">{sorted.length} records</p>
    </>
  );
}
