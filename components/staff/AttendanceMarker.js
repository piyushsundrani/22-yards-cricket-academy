"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const STATUSES = ["Present", "Absent", "Leave", "Half Day"];

const STATUS_STYLES = {
  Present: {
    active: "bg-green-600 text-white border-green-600",
    idle: "border-green-300 text-green-700 hover:bg-green-50",
  },
  Absent: {
    active: "bg-red-500 text-white border-red-500",
    idle: "border-red-300 text-red-600 hover:bg-red-50",
  },
  Leave: {
    active: "bg-yellow-500 text-white border-yellow-500",
    idle: "border-yellow-300 text-yellow-700 hover:bg-yellow-50",
  },
  "Half Day": {
    active: "bg-blue-500 text-white border-blue-500",
    idle: "border-blue-300 text-blue-600 hover:bg-blue-50",
  },
};

const ROLE_COLORS = {
  "Head Coach": "bg-purple-100 text-purple-700",
  Coach: "bg-blue-100 text-blue-700",
  "Assistant Coach": "bg-indigo-100 text-indigo-700",
  Admin: "bg-gray-100 text-gray-700",
  Support: "bg-teal-100 text-teal-700",
};

/**
 * @param {{ activeStaff: any[] }} props
 */
export default function AttendanceMarker({ activeStaff }) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(todayStr);
  const [attendance, setAttendance] = useState(/** @type {Record<string, string>} */ ({}));
  const [saving, setSaving] = useState(false);
  const [loadingDate, setLoadingDate] = useState(false);

  const loadAttendance = useCallback(
    async (selectedDate) => {
      if (!activeStaff.length) return;
      setLoadingDate(true);
      const { data } = await supabase
        .from("staff_attendance")
        .select("staff_id, status")
        .eq("date", selectedDate);

      const map = {};
      // default all active staff to Present
      activeStaff.forEach((s) => {
        map[s.id] = "Present";
      });
      // override with existing records
      (data ?? []).forEach((r) => {
        map[r.staff_id] = r.status;
      });
      setAttendance(map);
      setLoadingDate(false);
    },
    [activeStaff]
  );

  useEffect(() => {
    loadAttendance(date);
  }, [date, loadAttendance]);

  async function handleSave() {
    setSaving(true);
    try {
      const records = activeStaff.map((s) => ({
        staff_id: s.id,
        date,
        status: attendance[s.id] ?? "Present",
      }));

      const { error } = await supabase
        .from("staff_attendance")
        .upsert(records, { onConflict: "staff_id,date" });

      if (error) throw error;
      toast.success(
        `Attendance saved for ${new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })}`
      );
    } catch (err) {
      toast.error(err.message ?? "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  }

  if (!activeStaff.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-sm">No active staff to mark attendance for.</p>
        <p className="text-xs mt-1">Register staff members first.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Date picker */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6">
        <div className="space-y-1.5">
          <Label htmlFor="att-date">Date</Label>
          <Input
            id="att-date"
            type="date"
            value={date}
            max={todayStr}
            onChange={(e) => setDate(e.target.value)}
            className="w-48"
          />
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || loadingDate}
          className="bg-[#0d1b2a] hover:bg-[#1a2f4a] text-white sm:mb-0"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Attendance
        </Button>
      </div>

      {loadingDate ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Summary row */}
          <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-500">
            {STATUSES.map((s) => {
              const count = Object.values(attendance).filter((v) => v === s).length;
              if (count === 0) return null;
              return (
                <span
                  key={s}
                  className={`px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[s].active}`}
                >
                  {s}: {count}
                </span>
              );
            })}
          </div>

          {activeStaff.map((staff) => (
            <div
              key={staff.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#0d1b2a]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-[#0d1b2a]">
                    {staff.full_name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                    {staff.full_name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-xs text-gray-400">{staff.staff_id}</span>
                    <Badge
                      className={`text-xs ${ROLE_COLORS[staff.role] ?? "bg-gray-100 text-gray-700"} hover:opacity-90`}
                    >
                      {staff.role}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Status buttons */}
              <div className="flex flex-wrap gap-1.5 flex-shrink-0">
                {STATUSES.map((status) => {
                  const isActive = attendance[staff.id] === status;
                  return (
                    <button
                      key={status}
                      onClick={() => setAttendance((prev) => ({ ...prev, [staff.id]: status }))}
                      className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                        isActive ? STATUS_STYLES[status].active : STATUS_STYLES[status].idle
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
