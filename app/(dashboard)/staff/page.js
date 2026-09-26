"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo } from "react";
import { Plus, Users, UserCheck, CalendarCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/shared/Navbar";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import StaffTable from "@/components/staff/StaffTable";
import StaffForm from "@/components/staff/StaffForm";
import AttendanceMarker from "@/components/staff/AttendanceMarker";
import AttendanceTable from "@/components/staff/AttendanceTable";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const TABS = [
  { id: "staff", label: "Staff Members" },
  { id: "mark", label: "Mark Attendance" },
  { id: "records", label: "Attendance Records" },
];

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("staff");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [staffRes, attendanceRes] = await Promise.all([
      supabase.from("staff").select("*").order("created_at", { ascending: false }),
      supabase.from("staff_attendance").select("*").order("date", { ascending: false }),
    ]);
    setStaff(staffRes.data ?? []);
    setAttendance(attendanceRes.data ?? []);
    setLoading(false);
  }

  const activeStaff = useMemo(() => staff.filter((s) => s.is_active), [staff]);

  const staffMap = useMemo(() => {
    const m = {};
    staff.forEach((s) => {
      m[s.id] = s;
    });
    return m;
  }, [staff]);

  // Today's attendance summary
  const todayStr = new Date().toISOString().split("T")[0];
  const todayAttendance = useMemo(
    () => attendance.filter((r) => r.date === todayStr),
    [attendance, todayStr]
  );
  const presentToday = todayAttendance.filter((r) => r.status === "Present").length;

  return (
    <div className="min-h-screen bg-[#f9f9f7] dark:bg-gray-950">
      <Navbar title="Staff" />
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
        <PageHeader
          title="Staff Management"
          description=""
          action={
            activeTab === "staff" ? (
              <Button
                onClick={() => setAddOpen(true)}
                className="bg-[#0d1b2a] hover:bg-[#1a2f4a] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            ) : null
          }
        />

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <StatCard
            title="Total Staff"
            value={staff.length}
            icon={Users}
            color="green"
            loading={loading}
          />
          <StatCard
            title="Active Staff"
            value={activeStaff.length}
            icon={UserCheck}
            color="blue"
            loading={loading}
          />
          <StatCard
            title="Present Today"
            value={presentToday}
            icon={CalendarCheck}
            color="gold"
            loading={loading}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-3 sm:p-6">
          {activeTab === "staff" && (
            <StaffTable data={staff} loading={loading} onRefresh={loadData} />
          )}
          {activeTab === "mark" && <AttendanceMarker activeStaff={activeStaff} />}
          {activeTab === "records" && (
            <AttendanceTable records={attendance} staffMap={staffMap} loading={loading} />
          )}
        </div>
      </div>

      {/* Add Staff Sheet */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Register New Staff</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <StaffForm
              onSuccess={() => {
                setAddOpen(false);
                loadData();
              }}
              onCancel={() => setAddOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
