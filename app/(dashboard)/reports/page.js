"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo } from "react";
import { Users, IndianRupee, AlertCircle, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/shared/Navbar";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import ReportFilters from "@/components/reports/ReportFilters";
import ReportCharts from "@/components/reports/Charts";
import ReportTable from "@/components/reports/ReportTable";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const DEFAULT_FILTERS = {
  dateFrom: "",
  dateTo: "",
  batch: "all",
  level: "all",
  paymentStatus: "all",
  feeType: "all",
};

export default function ReportsPage() {
  const [students, setStudents] = useState([]);
  const [billing, setBilling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [studentsRes, billingRes] = await Promise.all([
      supabase.from("students").select("*"),
      supabase.from("billing").select("*"),
    ]);
    setStudents(studentsRes.data ?? []);
    setBilling(billingRes.data ?? []);
    setLoading(false);
  }

  // Apply filters and join data
  const reportData = useMemo(() => {
    const billingMap = {};
    billing.forEach((b) => {
      if (!billingMap[b.student_id]) billingMap[b.student_id] = [];
      billingMap[b.student_id].push(b);
    });

    const filtered = students.filter((s) => {
      const matchesBatch = filters.batch === "all" || s.batch === filters.batch;
      const matchesLevel = filters.level === "all" || s.level === filters.level;
      const enrollDate = new Date(s.enrollment_date);
      const matchesFrom = !filters.dateFrom || enrollDate >= new Date(filters.dateFrom);
      const matchesTo = !filters.dateTo || enrollDate <= new Date(filters.dateTo);
      return matchesBatch && matchesLevel && matchesFrom && matchesTo;
    });

    const rows = [];
    filtered.forEach((s) => {
      const studentBillings = billingMap[s.id] ?? [];
      const filteredBillings = studentBillings.filter((b) => {
        const matchesStatus = filters.paymentStatus === "all" || b.status === filters.paymentStatus;
        const matchesFeeType = filters.feeType === "all" || b.fee_type === filters.feeType;
        return matchesStatus && matchesFeeType;
      });

      if (filteredBillings.length === 0) {
        rows.push({
          student_id: s.student_id,
          full_name: s.full_name,
          batch: s.batch,
          level: s.level,
          enrollment_date: s.enrollment_date,
          receipt_number: null,
          fee_type: null,
          amount: null,
          due_date: null,
          payment_date: null,
          status: null,
        });
      } else {
        filteredBillings.forEach((b) => {
          rows.push({
            student_id: s.student_id,
            full_name: s.full_name,
            batch: s.batch,
            level: s.level,
            enrollment_date: s.enrollment_date,
            receipt_number: b.receipt_number,
            fee_type: b.fee_type,
            amount: b.amount,
            due_date: b.due_date,
            payment_date: b.payment_date,
            status: b.status,
          });
        });
      }
    });

    return rows;
  }, [students, billing, filters]);

  // Summary stats from filtered data
  const summary = useMemo(() => {
    const totalStudents = new Set(reportData.map((r) => r.student_id)).size;
    const revenueCollected = reportData
      .filter((r) => r.status === "Paid" || r.status === "Expired")
      .reduce((s, r) => s + Number(r.amount ?? 0), 0);
    const pendingAmount = reportData
      .filter((r) => r.status === "Pending")
      .reduce((s, r) => s + Number(r.amount ?? 0), 0);
    const overdueCount = reportData.filter((r) => r.status === "Overdue").length;
    return { totalStudents, revenueCollected, pendingAmount, overdueCount };
  }, [reportData]);

  // Charts use filtered students + billing
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesBatch = filters.batch === "all" || s.batch === filters.batch;
      const matchesLevel = filters.level === "all" || s.level === filters.level;
      return matchesBatch && matchesLevel;
    });
  }, [students, filters]);

  const filteredBilling = useMemo(() => {
    return billing.filter((b) => {
      const matchesStatus = filters.paymentStatus === "all" || b.status === filters.paymentStatus;
      const matchesFeeType = filters.feeType === "all" || b.fee_type === filters.feeType;
      return matchesStatus && matchesFeeType;
    });
  }, [billing, filters]);

  return (
    <div className="min-h-screen bg-[#f9f9f7] dark:bg-gray-950">
      <Navbar title="Reports" />
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
        <PageHeader title="Reports & Analytics" description="" />

        <ReportFilters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Filtered Students"
            value={summary.totalStudents}
            icon={Users}
            color="green"
            loading={loading}
          />
          <StatCard
            title="Revenue Collected"
            value={formatCurrency(summary.revenueCollected)}
            icon={IndianRupee}
            color="gold"
            loading={loading}
          />
          <StatCard
            title="Pending Amount"
            value={formatCurrency(summary.pendingAmount)}
            icon={Clock}
            color="orange"
            loading={loading}
          />
          <StatCard
            title="Overdue Count"
            value={summary.overdueCount}
            icon={AlertCircle}
            color="red"
            loading={loading}
          />
        </div>

        {/* Charts */}
        <ReportCharts students={filteredStudents} billing={filteredBilling} loading={loading} />

        {/* Report Table */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Detailed Report ({reportData.length} records)
            </h3>
            <ReportTable data={reportData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
