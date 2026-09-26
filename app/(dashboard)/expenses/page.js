"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo } from "react";
import { Plus, IndianRupee, TrendingDown, CalendarDays, Tag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/shared/Navbar";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import ExpenseTable from "@/components/expenses/ExpenseTable";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    setExpenses(data ?? []);
    setLoading(false);
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().toISOString().slice(0, 7);

  const stats = useMemo(() => {
    const todayTotal = expenses
      .filter((e) => e.date === todayStr)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const monthTotal = expenses
      .filter((e) => e.date?.slice(0, 7) === currentMonth)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    // Top category this month
    const monthExpenses = expenses.filter((e) => e.date?.slice(0, 7) === currentMonth);
    const catMap = {};
    monthExpenses.forEach((e) => {
      catMap[e.category] = (catMap[e.category] ?? 0) + Number(e.amount);
    });
    const topCategory = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

    return { todayTotal, monthTotal, topCategory, totalRecords: expenses.length };
  }, [expenses, todayStr, currentMonth]);

  return (
    <div className="min-h-screen bg-[#f9f9f7] dark:bg-gray-950">
      <Navbar title="Expenses" />
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
        <PageHeader
          title="Daily Expenses"
          description=""
          action={
            <Button
              onClick={() => setAddOpen(true)}
              className="bg-[#0d1b2a] hover:bg-[#1a2f4a] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          }
        />

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Today's Expenses"
            value={formatCurrency(stats.todayTotal)}
            icon={CalendarDays}
            color="orange"
            loading={loading}
          />
          <StatCard
            title="This Month"
            value={formatCurrency(stats.monthTotal)}
            icon={IndianRupee}
            color="red"
            loading={loading}
          />
          <StatCard
            title="Top Category"
            value={stats.topCategory}
            icon={Tag}
            color="blue"
            loading={loading}
          />
          <StatCard
            title="Total Records"
            value={stats.totalRecords}
            icon={TrendingDown}
            color="green"
            loading={loading}
          />
        </div>

        {/* Expense Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-3 sm:p-6">
          <ExpenseTable data={expenses} loading={loading} onRefresh={loadData} />
        </div>
      </div>

      {/* Add Expense Sheet */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Record Expense</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ExpenseForm
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
