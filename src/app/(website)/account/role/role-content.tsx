"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UserCog, BadgeCheck, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { submitRoleApplicationAction } from "@/features/identity/actions/account-actions";

interface Application {
  id: string;
  role: string;
  businessName: string;
  status: string;
  createdAt: Date;
}

interface RolePageContentProps {
  currentRole: string;
  applications: Application[];
}

const ROLE_INFO: Record<string, { label: string; description: string; features: string[] }> = {
  customer: {
    label: "Customer",
    description: "Standard account for browsing and purchasing products.",
    features: ["Browse products", "Place orders", "Track shipments", "Leave reviews"],
  },
  reseller: {
    label: "Approved Reseller",
    description: "Sell products to your own customers with exclusive pricing.",
    features: ["Reseller pricing", "Marketing kit access", "Profit features", "Bulk ordering"],
  },
  wholesaler: {
    label: "Wholesale Buyer",
    description: "Buy in bulk at wholesale prices for your business.",
    features: ["Wholesale pricing", "MOQ features", "Tier pricing", "Company account"],
  },
  supplier: {
    label: "Supplier",
    description: "List and sell your products on DropshopNN.",
    features: [
      "Product management",
      "Inventory control",
      "Order fulfillment",
      "Supplier dashboard",
    ],
  },
};

const APPLICABLE_ROLES = ["reseller", "wholesaler", "supplier"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-200",
  approved: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  rejected: "bg-rose-500/10 text-rose-600 border-rose-200",
};

function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function RoleApplicationForm({ role, onClose }: { role: string; onClose: () => void }) {
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [businessType, setBusinessType] = useState("sole_proprietorship");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const res = await submitRoleApplicationAction({
      role: role as any,
      businessName,
      ownerName,
      primaryPhone,
      businessType,
      address: { division, district, upazila, fullAddress },
      description: description || undefined,
    });

    setResult(res);
    setLoading(false);
    if (res.success) {
      setTimeout(onClose, 1500);
    }
  };

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Business Name</label>
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Owner Name</label>
          <input
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Phone</label>
          <input
            value={primaryPhone}
            onChange={(e) => setPrimaryPhone(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Business Type</label>
          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm"
          >
            <option value="sole_proprietorship">Sole Proprietorship</option>
            <option value="partnership">Partnership</option>
            <option value="limited_company">Limited Company</option>
            <option value="individual">Individual</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Division</label>
          <input
            value={division}
            onChange={(e) => setDivision(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">District</label>
          <input
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Upazila</label>
          <input
            value={upazila}
            onChange={(e) => setUpazila(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm"
            required
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Full Address</label>
          <textarea
            value={fullAddress}
            onChange={(e) => setFullAddress(e.target.value)}
            className="w-full h-16 rounded-md border border-input bg-card px-3 py-2 text-sm resize-none"
            required
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-16 rounded-md border border-input bg-card px-3 py-2 text-sm resize-none"
          />
        </div>
      </div>

      {result && !result.success && (
        <p className="text-sm text-rose-600 flex items-center gap-1.5">
          <AlertCircle className="h-4 w-4" />
          {result.error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" type="submit" disabled={loading}>
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Submit Application
        </Button>
      </div>
    </form>
  );
}

export function RolePageContent({ currentRole, applications }: RolePageContentProps) {
  const [applyRole, setApplyRole] = useState<string | null>(null);
  const currentInfo = ROLE_INFO[currentRole] || ROLE_INFO.customer;

  const hasPendingApp = (role: string) =>
    applications.some((a) => a.role === role && a.status === "pending");

  const hasApprovedRole = (role: string) =>
    applications.some((a) => a.role === role && a.status === "approved") || currentRole === role;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Role & Permissions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View your current role and apply for upgraded access.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Current Role</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Badge className="capitalize">{currentInfo.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{currentInfo.description}</p>
          <ul className="space-y-1">
            {currentInfo.features.map((f) => (
              <li key={f} className="text-sm text-foreground/80 flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary/60" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Apply for Upgraded Access</CardTitle>
          <CardDescription className="text-xs">
            Choose a role to apply for. Each role provides different features and pricing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {APPLICABLE_ROLES.map((role) => {
            const info = ROLE_INFO[role];
            const pending = hasPendingApp(role);
            const approved = hasApprovedRole(role);

            return (
              <div
                key={role}
                className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold capitalize">{info.label}</span>
                    {approved && (
                      <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-200">
                        Active
                      </Badge>
                    )}
                    {pending && (
                      <Badge className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-200">
                        Pending Review
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{info.description}</p>
                </div>

                {!approved && !pending && (
                  <Button variant="outline" size="sm" onClick={() => setApplyRole(role)}>
                    Apply
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {applications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Application History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {applications.map((app) => (
              <div key={app.id} className="flex items-center justify-between text-sm py-2">
                <div>
                  <p className="font-medium capitalize">{app.role}</p>
                  <p className="text-xs text-muted-foreground">{app.businessName}</p>
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className={`text-xs capitalize ${
                      STATUS_COLORS[app.status] || "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {app.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(app.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={!!applyRole} onOpenChange={() => setApplyRole(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold capitalize">
              Apply as {applyRole}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Fill out the form to apply for {applyRole} access. We&apos;ll review your application.
            </DialogDescription>
          </DialogHeader>
          {applyRole && <RoleApplicationForm role={applyRole} onClose={() => setApplyRole(null)} />}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
