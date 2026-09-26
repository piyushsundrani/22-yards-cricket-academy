"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/shared/Navbar";
import PageHeader from "@/components/shared/PageHeader";
import BillingTable from "@/components/billing/BillingTable";
import BillingForm from "@/components/billing/BillingForm";
import PendingPaymentsTable from "@/components/billing/PendingPaymentsTable";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const TABS = [
  { id: "all", label: "All Payments" },
  { id: "pending", label: "Pending & Overdue" },
];

export default function BillingPage() {
  const [billing, setBilling] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [billingRes, studentsRes] = await Promise.all([
      supabase.from("billing").select("*").order("created_at", { ascending: false }),
      supabase.from("students").select("id,student_id,full_name,batch").eq("is_active", true),
    ]);
    setBilling(billingRes.data ?? []);
    setStudents(studentsRes.data ?? []);
    setLoading(false);
  }

  const pendingCount = billing.filter(
    (b) => b.status === "Pending" || b.status === "Overdue"
  ).length;

  return (
    <div className="min-h-screen bg-[#f9f9f7] dark:bg-gray-950">
      <Navbar title="Billing" />
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
        <PageHeader
          title="Billing & Payments"
          description=""
          action={
            <Button
              onClick={() => setAddOpen(true)}
              className="bg-[#0d1b2a] hover:bg-[#1a2f4a] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Payment
            </Button>
          }
        />

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
              {tab.id === "pending" && pendingCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-red-500 text-white">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-3 sm:p-6">
          {activeTab === "all" ? (
            <BillingTable
              data={billing}
              students={students}
              loading={loading}
              onRefresh={loadData}
            />
          ) : (
            <PendingPaymentsTable data={billing} students={students} loading={loading} />
          )}
        </div>
      </div>

      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Record New Payment</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <BillingForm
              students={students}
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
