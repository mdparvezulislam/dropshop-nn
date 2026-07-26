"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  assignStaffAction,
  completeStaffAssignmentAction,
  listStaffAssignmentsAction,
} from "@/features/order/actions/staff-actions";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, UserPlus, CheckCircle, X } from "lucide-react";
import type { StaffRole } from "@/features/order/domain/staff-assignment-entity";

const ROLE_OPTIONS: { value: StaffRole; label: string; en: string }[] = [
  { value: "picker", label: "পিকার", en: "Picker" },
  { value: "packer", label: "প্যাকার", en: "Packer" },
  { value: "courier_manager", label: "কুরিয়ার ম্যানেজার", en: "Courier Manager" },
  { value: "customer_support", label: "কাস্টমার সাপোর্ট", en: "Customer Support" },
  { value: "manager", label: "ম্যানেজার", en: "Manager" },
];

const ROLE_LABEL: Record<string, string> = {
  picker: "পিকার",
  packer: "প্যাকার",
  courier_manager: "কুরিয়ার ম্যানেজার",
  customer_support: "কাস্টমার সাপোর্ট",
  manager: "ম্যানেজার",
};

export default function StaffAssignmentPage(): React.ReactElement {
  const [assignments, setAssignments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [roleFilter, setRoleFilter] = React.useState<string>("");
  const [showAssignForm, setShowAssignForm] = React.useState(false);
  const [assigning, setAssigning] = React.useState(false);

  const load = async () => {
    setLoading(true);
    const res = await listStaffAssignmentsAction(1, 50, (roleFilter || undefined) as StaffRole);
    if (res.success) setAssignments(res.data?.items ?? []);
    setLoading(false);
  };

  React.useEffect(() => {
    load();
  }, [roleFilter]);

  const handleComplete = async (assignmentId: string) => {
    const res = await completeStaffAssignmentAction({ assignmentId });
    if (res.success) {
      toast.success("অ্যাসাইনমেন্ট সম্পন্ন হয়েছে");
      load();
    } else toast.error(res.error || "ব্যর্থ");
  };

  const handleAssign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAssigning(true);
    const form = new FormData(e.currentTarget);
    const data = {
      orderId: form.get("orderId") as string,
      orderNumber: form.get("orderNumber") as string,
      staffId: form.get("staffId") as string,
      staffName: form.get("staffName") as string,
      role: form.get("role") as StaffRole,
      notes: form.get("notes") as string,
    };
    const res = await assignStaffAction(data);
    if (res.success) {
      toast.success("স্টাফ অ্যাসাইন করা হয়েছে");
      setShowAssignForm(false);
      load();
    } else toast.error(res.error || "ব্যর্থ");
    setAssigning(false);
  };

  const getVariant = (status: string) => {
    if (status === "completed") return "success" as const;
    return "default" as const;
  };

  const isCompleted = (item: any) => !!item.completedAt;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">স্টাফ অ্যাসাইনমেন্ট</h1>
            <p className="text-sm text-muted-foreground">Staff Assignment Management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowAssignForm(true)}>
            <UserPlus className="h-4 w-4 mr-1" /> Assign
          </Button>
          <Button variant="ghost" onClick={load}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignForm && (
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-foreground">নতুন স্টাফ অ্যাসাইন</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAssignForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleAssign} className="grid gap-3 sm:grid-cols-2">
              <Input name="orderId" placeholder="Order ID" required className="h-9" />
              <Input name="orderNumber" placeholder="Order #" required className="h-9" />
              <Input name="staffId" placeholder="Staff ID" required className="h-9" />
              <Input name="staffName" placeholder="Staff Name" required className="h-9" />
              <select
                name="role"
                required
                className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
              >
                <option value="">Role নির্বাচন করুন</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label} ({r.en})
                  </option>
                ))}
              </select>
              <Input name="notes" placeholder="Notes (optional)" className="h-9" />
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAssignForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={assigning}>
                  {assigning ? "Assigning..." : "Assign"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-semibold">Role ফিল্টার:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-8 rounded-md border border-border bg-background px-2 text-sm text-foreground"
          >
            <option value="">সবগুলো</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/50 bg-card">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">
                  অর্ডার #
                </th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">
                  স্টাফের নাম
                </th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">রোল</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">
                  অ্যাসাইন করেছেন
                </th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">
                  স্ট্যাটাস
                </th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground">
                  অ্যাকশন
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    কোনো তথ্য নেই
                  </td>
                </tr>
              ) : (
                assignments.map((a: any) => (
                  <tr key={a.id} className="border-b border-border/30 hover:bg-muted/20">
                    <td className="p-3 font-medium">{a.orderNumber}</td>
                    <td className="p-3 text-sm">{a.staffName}</td>
                    <td className="p-3 text-sm">
                      <Badge variant="outline">{ROLE_LABEL[a.role] ?? a.role}</Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{a.assignedBy}</td>
                    <td className="p-3">
                      <Badge variant={getVariant(isCompleted(a) ? "completed" : "active")}>
                        {isCompleted(a) ? "সম্পন্ন" : "সক্রিয়"}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      {!isCompleted(a) && (
                        <Button size="sm" variant="outline" onClick={() => handleComplete(a.id)}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Complete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
