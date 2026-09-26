"use client";

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
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const BATCH_COLORS = { Morning: "#0d1b2a", Evening: "#c9a84c", Weekend: "#3b82f6" };

export default function ReportCharts({ students, billing, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Monthly revenue trend (last 6 months)
  const monthRevenue = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    monthRevenue[key] = 0;
  }
  (billing ?? [])
    .filter((b) => b.status === "Paid" || b.status === "Expired")
    .forEach((b) => {
      const d = new Date(b.payment_date || b.created_at);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      if (key in monthRevenue) monthRevenue[key] += Number(b.amount);
    });
  const revenueData = Object.entries(monthRevenue).map(([month, revenue]) => ({ month, revenue }));

  // Batch distribution
  const batches = {};
  (students ?? []).forEach((s) => {
    batches[s.batch] = (batches[s.batch] ?? 0) + 1;
  });
  const batchData = Object.entries(batches).map(([name, value]) => ({ name, value }));

  // Enrollment growth (cumulative by month)
  const enrollmentByMonth = {};
  (students ?? []).forEach((s) => {
    const d = new Date(s.enrollment_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    enrollmentByMonth[key] = (enrollmentByMonth[key] ?? 0) + 1;
  });
  const sortedMonths = Object.keys(enrollmentByMonth).sort();
  let cumulative = 0;
  const enrollmentGrowth = sortedMonths.map((month) => {
    cumulative += enrollmentByMonth[month];
    return { month, total: cumulative };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <Card className="lg:col-span-2 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Monthly Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]} />
              <Bar dataKey="revenue" fill="#c9a84c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Batch Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={batchData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {batchData.map((entry) => (
                  <Cell key={entry.name} fill={BATCH_COLORS[entry.name] ?? "#8884d8"} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Enrollment Growth Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={enrollmentGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#0d1b2a"
                strokeWidth={2}
                dot={{ fill: "#0d1b2a", r: 4 }}
                name="Total Students"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
