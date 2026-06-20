"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/shared/Navbar";
import PageHeader from "@/components/shared/PageHeader";
import StudentTable from "@/components/students/StudentTable";
import StudentForm from "@/components/students/StudentForm";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function RegistrationPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    setLoading(true);
    const { data } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });
    setStudents(data ?? []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#f9f9f7] dark:bg-gray-950">
      <Navbar title="Student Registration" />
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
        <PageHeader
          title="Student Registration"
          description=""
          action={
            <Button
              onClick={() => setAddOpen(true)}
              className="bg-[#0d1b2a] hover:bg-[#1a2f4a] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Student
            </Button>
          }
        />

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-3 sm:p-6">
          <StudentTable data={students} loading={loading} onRefresh={loadStudents} />
        </div>
      </div>

      {/* Add Student Sheet */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Register New Student</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <StudentForm
              onSuccess={() => {
                setAddOpen(false);
                loadStudents();
              }}
              onCancel={() => setAddOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
