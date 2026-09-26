"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Users, UserCheck, IndianRupee, AlertCircle, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/shared/Navbar";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const BATCH_COLORS = { Morning: "#0d1b2a", Evening: "#c9a84c", Weekend: "#3b82f6" };

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [monthlyEnrollments, setMonthlyEnrollments] = useState([]);
  const [batchDistribution, setBatchDistribution] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const [studentsRes, billingRes] = await Promise.all([
        supabase.from("students").select("*"),
        supabase.from("billing").select("*"),
      ]);

      const students = studentsRes.data ?? [];
      const billing = billingRes.data ?? [];

      // Stats
      const totalStudents = students.length;
      const activeStudents = students.filter((s) => s.is_active).length;
      const totalRevenue = billing
        .filter((b) => b.status === "Paid" || b.status === "Expired")
        .reduce((sum, b) => sum + Number(b.amount), 0);
      const pendingDues = billing
        .filter((b) => b.status === "Pending")
        .reduce((sum, b) => sum + Number(b.amount), 0);
      const overdueCount = billing.filter((b) => b.status === "Overdue").length;

      setStats({ totalStudents, activeStudents, totalRevenue, pendingDues, overdueCount });

      // Monthly enrollments (last 6 months)
      const monthMap = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
        monthMap[key] = 0;
      }
      students.forEach((s) => {
        const d = new Date(s.enrollment_date);
        const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
        if (key in monthMap) monthMap[key]++;
      });
      setMonthlyEnrollments(Object.entries(monthMap).map(([month, count]) => ({ month, count })));

      // Batch distribution
      const batches = {};
      students.forEach((s) => {
        batches[s.batch] = (batches[s.batch] ?? 0) + 1;
      });
      setBatchDistribution(Object.entries(batches).map(([name, value]) => ({ name, value })));

      // Recent students (last 5)
      setRecentStudents(
        [...students].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9f7] dark:bg-gray-950">
      <Navbar title="Dashboard" />
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
        <PageHeader title="Dashboard" description="" />

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Total Students"
            value={stats?.totalStudents ?? 0}
            icon={Users}
            color="green"
            loading={loading}
          />
          <StatCard
            title="Active Students"
            value={stats?.activeStudents ?? 0}
            icon={UserCheck}
            color="blue"
            loading={loading}
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats?.totalRevenue ?? 0)}
            icon={IndianRupee}
            color="gold"
            loading={loading}
          />
          <StatCard
            title="Pending Dues"
            value={formatCurrency(stats?.pendingDues ?? 0)}
            icon={Clock}
            color="orange"
            loading={loading}
          />
          <StatCard
            title="Overdue"
            value={stats?.overdueCount ?? 0}
            icon={AlertCircle}
            color="red"
            loading={loading}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Monthly New Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyEnrollments}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0d1b2a" radius={[4, 4, 0, 0]} name="Enrollments" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Batch Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={batchDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {batchDistribution.map((entry) => (
                        <Cell key={entry.name} fill={BATCH_COLORS[entry.name] ?? "#8884d8"} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Registrations */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentStudents.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No students registered yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="text-left py-2 font-medium">Student ID</th>
                      <th className="text-left py-2 font-medium">Name</th>
                      <th className="text-left py-2 font-medium">Batch</th>
                      <th className="text-left py-2 font-medium">Level</th>
                      <th className="text-left py-2 font-medium">Enrolled</th>
                      <th className="text-left py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-3 font-mono text-xs text-gray-500">
                          {student.student_id}
                        </td>
                        <td className="py-3 font-medium">{student.full_name}</td>
                        <td className="py-3">
                          <Badge variant="outline" className="text-xs">
                            {student.batch}
                          </Badge>
                        </td>
                        <td className="py-3 text-gray-500">{student.level}</td>
                        <td className="py-3 text-gray-500">
                          {formatDate(student.enrollment_date)}
                        </td>
                        <td className="py-3">
                          <Badge
                            className={
                              student.is_active
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-100"
                            }
                          >
                            {student.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
