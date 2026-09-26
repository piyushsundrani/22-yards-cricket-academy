"use client";

import { useMemo } from "react";
import { AlertTriangle, Clock, IndianRupee } from "lucide-react";
import { formatDate, formatCurrency, formatMonthYear } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  Overdue: "bg-red-100 text-red-700 hover:bg-red-100",
};

/**
 * @param {{ data: any[]; students: any[]; loading: boolean }} props
 */
export default function PendingPaymentsTable({ data, students, loading }) {
  const studentMap = useMemo(() => {
    const m = {};
    (students ?? []).forEach((s) => {
      m[s.id] = s;
    });
    return m;
  }, [students]);

  const pendingRecords = useMemo(() => {
    return (data ?? [])
      .filter((b) => b.status === "Pending" || b.status === "Overdue")
      .map((b) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(b.due_date);
        const diffMs = today - due;
        const daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return { ...b, daysOverdue };
      })
      .sort((a, b) => {
        // Overdue first, then Pending; within each group sort by due_date ascending
        if (a.status !== b.status) return a.status === "Overdue" ? -1 : 1;
        return new Date(a.due_date) - new Date(b.due_date);
      });
  }, [data]);

  const summary = useMemo(() => {
    const total = pendingRecords.reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
    const overdueCount = pendingRecords.filter((r) => r.status === "Overdue").length;
    const pendingCount = pendingRecords.filter((r) => r.status === "Pending").length;
    const studentsAffected = new Set(pendingRecords.map((r) => r.student_id)).size;
    return { total, overdueCount, pendingCount, studentsAffected };
  }, [pendingRecords]);

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
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <IndianRupee className="w-4 h-4 text-red-500" />
            <span className="text-xs text-red-600 dark:text-red-400 font-medium">
              Total Outstanding
            </span>
          </div>
          <p className="text-lg font-bold text-red-700 dark:text-red-300">
            {formatCurrency(summary.total)}
          </p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
              Overdue
            </span>
          </div>
          <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
            {summary.overdueCount} record{summary.overdueCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">
              Pending
            </span>
          </div>
          <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
            {summary.pendingCount} record{summary.pendingCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Students Affected
            </span>
          </div>
          <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
            {summary.studentsAffected}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {[
                "Student ID",
                "Name",
                "Batch",
                "Fee Type",
                "Amount",
                "For Month",
                "Due Date",
                "Status",
                "Days",
              ].map((h) => (
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
            {pendingRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-gray-400">
                  No pending or overdue payments
                </td>
              </tr>
            ) : (
              pendingRecords.map((record) => {
                const student = studentMap[record.student_id];
                return (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {student?.student_id ?? "-"}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">
                      {student?.full_name ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {student?.batch ?? "-"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {record.fee_type}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">
                      {formatCurrency(record.amount)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatMonthYear(record.payment_month)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(record.due_date)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={STATUS_COLORS[record.status] ?? ""}>{record.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {record.status === "Overdue" ? (
                        <span className="text-red-600 font-medium">
                          {record.daysOverdue}d overdue
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          {record.daysOverdue < 0
                            ? `${Math.abs(record.daysOverdue)}d left`
                            : "Due today"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pendingRecords.length > 0 && (
        <p className="text-sm text-gray-500 mt-3">
          {pendingRecords.length} record{pendingRecords.length !== 1 ? "s" : ""} &middot;{" "}
          {summary.studentsAffected} student{summary.studentsAffected !== 1 ? "s" : ""}
        </p>
      )}
    </>
  );
}
