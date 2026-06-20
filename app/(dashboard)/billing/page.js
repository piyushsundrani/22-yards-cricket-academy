"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/shared/Navbar";
import PageHeader from "@/components/shared/PageHeader";
import BillingTable from "@/components/billing/BillingTable";
import BillingForm from "@/components/billing/BillingForm";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function BillingPage() {
  const [billing, setBilling] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

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

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-3 sm:p-6">
          <BillingTable data={billing} students={students} loading={loading} onRefresh={loadData} />
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
