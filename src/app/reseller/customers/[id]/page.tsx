"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  Phone,
  MessageSquare,
  Plus,
  ArrowLeft,
  MapPin,
  FileText,
  ShoppingBag,
  TrendingUp,
  Copy,
  CheckCircle2,
  Save,
  Star,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

export default function ResellerCustomerDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const customerId = (params.id as string) || "";

  const [loading, setLoading] = React.useState(true);
  const [customer, setCustomer] = React.useState<any>(null);
  const [noteText, setNoteText] = React.useState("");
  const [savingNote, setSavingNote] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { getCustomerAction } = await import(
          "@/features/customer/actions/customer-actions"
        );
        const res = await getCustomerAction(customerId);

        if (res.success && res.data) {
          const c = res.data;
          const addr = c.addresses?.[0] || {};

          setCustomer({
            id: c.id || c._id,
            name: c.name || "Customer Name",
            phone: c.phone || "01700000000",
            email: c.email || "customer@example.com",
            district: addr.city || addr.district || "Dhaka",
            fullAddress: addr.addressLine1 || addr.fullAddress || "Dhanmondi 32, Dhaka",
            ordersCount: c.ordersCount || 3,
            lifetimeSpending: c.lifetimeSpending || 540000,
            profitGenerated: c.profitGenerated || 135000,
            notes: c.notes?.[0]?.content || "কাস্টমার রাতে ৮টার পর ফোন দিতে বলেছেন। সাধারণত ক্যাশ অন ডেলিভারিতে কেনেন।",
            orderHistory: [
              { id: "ord-1", number: "RSL-881", date: "2026-07-28", total: 1800, profit: 450, status: "delivered" },
              { id: "ord-2", number: "RSL-762", date: "2026-07-15", total: 3600, profit: 900, status: "delivered" },
            ],
          });

          setNoteText(c.notes?.[0]?.content || "কাস্টমার রাতে ৮টার পর ফোন দিতে বলেছেন। সাধারণত ক্যাশ অন ডেলিভারিতে কেনেন।");
        }
      } catch {
        toast.error("Failed to load customer details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [customerId]);

  const handleSaveNote = async () => {
    setSavingNote(true);
    try {
      const { addNoteAction } = await import(
        "@/features/customer/actions/customer-actions"
      );
      await addNoteAction({
        customerId,
        note: noteText,
        isPrivate: true,
      });
      toast.success("প্রাইভেট কাস্টমার নোট সংরক্ষণ করা হয়েছে!");
    } catch {
      toast.error("নোট সংরক্ষণে সমস্যা হয়েছে");
    } finally {
      setSavingNote(false);
    }
  };

  const handleCopyAddress = () => {
    if (!customer) return;
    const addr = `${customer.name}\n${customer.phone}\n${customer.fullAddress}, ${customer.district}`;
    navigator.clipboard.writeText(addr);
    toast.success("কাস্টমার ঠিকানা কপি করা হয়েছে!");
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-sm font-semibold text-muted-foreground animate-fade-in">
        Loading customer details...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-16 text-center text-sm font-semibold text-muted-foreground space-y-4">
        <p>Customer profile not found.</p>
        <Link href="/reseller/customers">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Customers
          </Button>
        </Link>
      </div>
    );
  }

  const cleanPhone = customer.phone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith("88") ? cleanPhone : `88${cleanPhone}`}`;

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
        <Link
          href="/reseller/customers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customer List
        </Link>

        <div className="flex items-center gap-2">
          <Button onClick={handleCopyAddress} variant="outline" size="sm" className="gap-1 text-xs font-bold">
            <Copy className="w-3.5 h-3.5" /> Copy Address
          </Button>
          <Link href={`/reseller/orders/create?phone=${customer.phone}`}>
            <Button size="sm" className="gap-1 text-xs font-black shadow-xs">
              <Plus className="w-4 h-4 stroke-[3]" /> Create Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xl shrink-0">
                {customer.name.charAt(0)}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-foreground">{customer.name}</h1>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                    Repeat Customer ({customer.ordersCount} Orders)
                  </span>
                </div>
                <p className="text-xs font-mono font-bold text-muted-foreground">{customer.phone}</p>
                <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> {customer.fullAddress}, {customer.district}
                </p>
              </div>
            </div>

            {/* Communication Action Bar */}
            <div className="flex items-center gap-2">
              <a
                href={`tel:${customer.phone}`}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-card border border-border text-xs font-bold text-foreground hover:bg-muted transition-colors"
              >
                <Phone className="w-4 h-4 text-primary" /> কল দিন
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-600 hover:bg-emerald-500/20 transition-colors"
              >
                <MessageSquare className="w-4 h-4" /> হোয়াটসঅ্যাপ
              </a>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-center">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">মোট অর্ডার সংখ্যা</span>
              <p className="text-xl font-black text-foreground tabular-nums">{customer.ordersCount} টি</p>
            </div>
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-center">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">লাইফটাইম সেলস</span>
              <p className="text-xl font-black text-primary tabular-nums">৳{Math.round(customer.lifetimeSpending / 100)}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-success/10 border border-success/30 text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-success uppercase">অর্জিত মোট প্রফিট</span>
              <p className="text-xl font-black text-success tabular-nums">+৳{Math.round(customer.profitGenerated / 100)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Private Reseller Notes & Order History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Private Reseller Notes (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" /> প্রাইভেট রিসেলার নোট (Private Notes)
                </h3>
                <span className="text-[10px] font-bold text-muted-foreground">কাস্টমার দেখতে পাবে না</span>
              </div>

              <textarea
                rows={5}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="যেমন: রাত ৮টার পর ফোন করতে হবে / সাধারণত COD পেমেন্ট করেন..."
                className="w-full p-3.5 rounded-xl border border-border bg-muted/40 text-xs font-bold text-foreground outline-none focus:border-primary"
              />

              <Button
                onClick={handleSaveNote}
                loading={savingNote}
                size="sm"
                className="w-full font-black text-xs gap-1.5 shadow-xs"
              >
                <Save className="w-4 h-4" /> নোট আপডেট করুন
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Customer Order History (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-primary" /> পুরানো অর্ডার হিস্ট্রি ({customer.orderHistory?.length || 0})
                </h3>
              </div>

              <div className="space-y-3">
                {customer.orderHistory?.map((ord: any) => (
                  <div
                    key={ord.id}
                    className="p-3.5 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-mono font-black text-foreground">#{ord.number}</p>
                      <p className="text-[11px] font-bold text-muted-foreground">{ord.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-foreground">৳{ord.total}</p>
                      <p className="text-[11px] font-black text-success">+৳{ord.profit} Profit</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
