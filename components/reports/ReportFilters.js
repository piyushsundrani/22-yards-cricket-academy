"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReportFilters({ filters, onChange, onReset }) {
  function set(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-6">
      <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Filters</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Date From</Label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => set("dateFrom", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Date To</Label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => set("dateTo", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Batch</Label>
          <Select value={filters.batch} onValueChange={(v) => set("batch", v)}>
            <SelectTrigger>
              <SelectValue placeholder="All Batches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              <SelectItem value="Morning">Morning</SelectItem>
              <SelectItem value="Evening">Evening</SelectItem>
              <SelectItem value="Weekend">Weekend</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Level</Label>
          <Select value={filters.level} onValueChange={(v) => set("level", v)}>
            <SelectTrigger>
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Payment Status</Label>
          <Select value={filters.paymentStatus} onValueChange={(v) => set("paymentStatus", v)}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Fee Type</Label>
          <Select value={filters.feeType} onValueChange={(v) => set("feeType", v)}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
              <SelectItem value="Quarterly">Quarterly</SelectItem>
              <SelectItem value="Annual">Annual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end col-span-1 sm:col-span-2 gap-3">
          <Button variant="outline" onClick={onReset} className="flex-1">
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
