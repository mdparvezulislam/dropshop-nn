"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Receipt,
  Download,
  CreditCard,
  Clock,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { PageHeader } from "@/shared/components/workspace/page-header";
import { Spinner } from "@/shared/components/ui/spinner";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";
import { cn } from "@/shared/utils/cn";

export default function WholesaleInvoiceDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const { listInvoicesAction } = await import("@/features/finance/actions/finance-actions");
        const res = await listInvoicesAction();
        if (res.success && res.data) {
          const items = Array.isArray(res.data) ? res.data : [];
          const found = items.find((i: any) => (i.id ?? i._id) === params.id);
          if (found) {
            setInvoice(found);
          } else {
            toast.error("Invoice not found");
          }
        } else {
          toast.error("Invoice not found");
        }
      } catch {
        toast.error("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <PageHeader title="Invoice Not Found" />
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Invoice not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const inv = invoice;
  const formatCents = (cents: number): string =>
    `৳${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const amount = inv.amount ?? inv.grandTotal ?? 0;
  const dueDate = inv.dueDate ? new Date(inv.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && inv.status !== "paid" && inv.status !== "completed";

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/wholesale/invoices")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <PageHeader
            title={`Invoice ${inv.invoiceNumber ?? inv._id?.slice(-8) ?? ""}`}
            description={`Issued ${inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "—"}`}
          />
        </div>
        <StatusChip label={inv.status ?? "pending"} tone={statusToneFromValue(inv.status)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" /> Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Invoice Number</p>
                  <p className="text-sm font-medium font-mono">{inv.invoiceNumber ?? "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <StatusChip label={inv.status ?? "pending"} tone={statusToneFromValue(inv.status)} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Issue Date</p>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "—"}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <div className={cn("flex items-center gap-1.5 text-sm", isOverdue && "text-destructive")}>
                    <Clock className="h-3.5 w-3.5" />
                    <span>{dueDate ? dueDate.toLocaleDateString() : "—"}</span>
                    {isOverdue && <span className="text-xs font-medium">(Overdue)</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {inv.items && inv.items.length > 0 && (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Line Items</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {inv.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.productName ?? item.title ?? "Item"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Qty: {item.quantity ?? 1} · {formatCents(item.unitPrice ?? 0)} each
                        </p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums shrink-0">
                        {formatCents((item.unitPrice ?? 0) * (item.quantity ?? 1))}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatCents(amount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Total Due</span>
                <span className="tabular-nums">{formatCents(amount)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Button className="w-full gap-1.5" variant="outline">
                <Download className="h-4 w-4" /> Download PDF
              </Button>
              {(inv.status === "pending" || inv.status === "due") && (
                <Button className="w-full gap-1.5">
                  <CreditCard className="h-4 w-4" /> Pay Now
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
