"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserPlus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResellerStatusGuard } from "@/features/reseller-workspace/components/reseller-status-guard";
import { CustomerFormModal, type CustomerModalData } from "@/features/customer/components/customer-form-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

export interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  district: string;
  upazila: string;
  address: string;
  createdAt: string;
}

export default function ResellerCustomersPage(): React.ReactElement {
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [customers, setCustomers] = React.useState<CustomerRow[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const pageSize = 15;

  // Modal State
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerModalData | null>(null);

  const loadCustomers = React.useCallback(async () => {
    setLoading(true);
    try {
      const { listCustomersAction } = await import(
        "@/features/customer/actions/customer-actions"
      );
      const res = await listCustomersAction(search.trim() || undefined, page, pageSize);

      if (res.success && res.data) {
        const rawItems = res.data;
        const mapped: CustomerRow[] = rawItems.map((c: any) => {
          const addr = c.addresses?.[0] || {};
          return {
            id: c.id ?? c._id,
            name: c.name ?? "Customer",
            phone: c.phone ?? "",
            email: c.email ?? "",
            district: addr.district || addr.division || "Dhaka",
            upazila: addr.upazila || addr.area || "",
            address: addr.landmark || addr.postalCode || addr.address || "",
            createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
          };
        });

        setCustomers(mapped);
        setTotalCount(res.totalCount ?? mapped.length);
      } else {
        setCustomers([]);
        setTotalCount(0);
      }
    } catch {
      toast.error("কাস্টমার তথ্য লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  React.useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleAddClick = () => {
    setSelectedCustomer(null);
    setModalOpen(true);
  };

  const handleEditClick = (c: CustomerRow) => {
    setSelectedCustomer({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      district: c.district,
      upazila: c.upazila,
      address: c.address,
    });
    setModalOpen(true);
  };

  const handleDeleteClick = async (c: CustomerRow) => {
    if (!confirm(`আপনি কি নিশ্চিত যে কাস্টমার ${c.name} এর প্রোফাইল মুছে ফেলতে চান?`)) {
      return;
    }

    try {
      const { deleteCustomerAction } = await import(
        "@/features/customer/actions/customer-actions"
      );
      const res = await deleteCustomerAction(c.id);
      if (res.success) {
        toast.success("কাস্টমার প্রোফাইল সফলভাবে মুছে ফেলা হয়েছে!");
        loadCustomers();
      } else {
        toast.error(res.error || "মুছে ফেলতে ব্যর্থ হয়েছে।");
      }
    } catch {
      toast.error("একটি ত্রুটি ঘটেছে।");
    }
  };

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q) ||
      c.upazila.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <ResellerStatusGuard status="active">
      <div className="space-y-6 animate-fade-in pb-16">
        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              কাস্টমার তালিকা
            </h1>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600">
              ({totalCount} জন)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="কাস্টমারের নাম বা ফোন নম্বর দিয়ে খুঁজুন..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-card text-xs font-semibold text-foreground outline-none focus:border-rose-500"
              />
            </div>

            <Button
              onClick={handleAddClick}
              className="h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs gap-1.5 shadow-md shrink-0"
            >
              <UserPlus className="w-4 h-4" /> + নতুন কাস্টমার অ্যাড করুন
            </Button>
          </div>
        </div>

        {/* Customer Table List (Matching Screenshot 1 UI) */}
        {loading ? (
          <div className="p-16 text-center text-sm font-semibold text-muted-foreground">
            কাস্টমার তালিকা লোড হচ্ছে...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-sm font-semibold text-muted-foreground space-y-3 bg-card rounded-2xl border border-border/80">
            <Users className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <p>কোনো কাস্টমার পাওয়া যায়নি।</p>
            <Button
              onClick={handleAddClick}
              size="sm"
              className="font-bold gap-1 bg-rose-600 hover:bg-rose-700 text-white"
            >
              <UserPlus className="w-4 h-4" /> নতুন কাস্টমার যোগ করুন
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-foreground font-black border-b border-border">
                <tr>
                  <th className="py-3.5 px-3.5 text-center">ক্রমিক</th>
                  <th className="py-3.5 px-3.5">নাম</th>
                  <th className="py-3.5 px-3.5">ফোন নম্বর</th>
                  <th className="py-3.5 px-3.5">ইমেইল</th>
                  <th className="py-3.5 px-3.5">ডেলিভারি এরিয়া</th>
                  <th className="py-3.5 px-3.5">ঠিকানা</th>
                  <th className="py-3.5 px-3.5">যোগ করার তারিখ</th>
                  <th className="py-3.5 px-3.5 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-semibold">
                {filtered.map((c, idx) => {
                  const serialNo = (page - 1) * pageSize + idx + 1;
                  return (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-3.5 text-center text-muted-foreground font-mono font-bold">
                        {serialNo}
                      </td>
                      <td className="py-3.5 px-3.5 font-bold text-foreground">
                        {c.name}
                      </td>
                      <td className="py-3.5 px-3.5 font-mono text-foreground font-bold">
                        {c.phone}
                      </td>
                      <td className="py-3.5 px-3.5 font-bold text-muted-foreground">
                        {c.email || "—"}
                      </td>
                      <td className="py-3.5 px-3.5 text-foreground font-medium">
                        {c.upazila || c.district}
                      </td>
                      <td className="py-3.5 px-3.5 text-muted-foreground font-medium max-w-xs truncate">
                        {c.address || `${c.district}`}
                      </td>
                      <td className="py-3.5 px-3.5 text-muted-foreground text-[11px] whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString("bn-BD")}
                      </td>
                      <td className="py-3.5 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/reseller/customers/${c.id}`}>
                            <button
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="কাস্টমার বিবরণ"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>

                          <button
                            onClick={() => handleEditClick(c)}
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                            title="কাস্টমার তথ্য এডিট"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteClick(c)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-600 transition-colors"
                            title="কাস্টমার ডিলিট"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="text-xs font-bold text-muted-foreground">
              Page {page} of {totalPages} ({totalCount} total customers)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="gap-1 text-xs font-bold"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="gap-1 text-xs font-bold"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Form Modal (Edit / Add) */}
      <CustomerFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        customer={selectedCustomer}
        onSuccess={loadCustomers}
      />
    </ResellerStatusGuard>
  );
}
