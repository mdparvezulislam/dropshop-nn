"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Phone, Mail, MapPin, FileText, Plus, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/workspace/page-header";
import { Spinner } from "@/components/ui/spinner";

export default function ResellerCustomerDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [note, setNote] = React.useState("");
  const [savingNote, setSavingNote] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { listCustomersAction } = await import("@/features/customer/actions/customer-actions");
      const res = await listCustomersAction();
      if (res.success && res.data) {
        const found = (Array.isArray(res.data) ? res.data : []).find(
          (c: any) => c.id === params.id || c._id === params.id,
        );
        if (found) setCustomer(found);
        else toast.error("Customer not found");
      }
    } catch {
      toast.error("Failed to load customer");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  React.useEffect(() => {
    load();
  }, [load]);

  const addNote = async () => {
    if (!note.trim() || !customer?.id) return;
    setSavingNote(true);
    try {
      const { addNoteAction } = await import("@/features/customer/actions/customer-actions");
      const res = await addNoteAction({
        customerId: customer.id,
        note: note.trim(),
        isPrivate: false,
      });
      if (res.success) {
        toast.success("Note added");
        setNote("");
        load();
      } else toast.error((res as any).error ?? "Failed to add note");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <PageHeader title="Customer Not Found" />
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Customer not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const addresses = customer.addresses ?? [];
  const notes = customer.notes ?? [];
  const createOrderHref = `/reseller/orders/create?customerName=${encodeURIComponent(customer.name ?? "")}&customerPhone=${encodeURIComponent(customer.phone ?? "")}`;

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push("/reseller/customers")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader
            title={customer.name}
            description={`Customer since ${customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "—"}`}
          />
        </div>
        <Link href={createOrderHref}>
          <Button size="sm" className="gap-1.5">
            <ShoppingCart className="h-3.5 w-3.5" />
            Create order
          </Button>
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-primary" /> Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono">{customer.phone ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{customer.email ?? "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" /> Addresses ({addresses.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 text-sm">
            {addresses.length === 0 ? (
              <p className="text-muted-foreground">No addresses saved.</p>
            ) : (
              addresses.map((addr: any, i: number) => (
                <div key={i} className="rounded-lg border border-border p-3">
                  <p>{addr.fullAddress ?? addr.address ?? addr.area ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {[addr.upazila, addr.district, addr.division].filter(Boolean).join(", ")}
                    {addr.type ? ` (${addr.type})` : ""}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-primary" /> Notes ({notes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this customer…"
              />
              <Button
                size="sm"
                className="gap-1.5"
                disabled={savingNote || !note.trim()}
                onClick={addNote}
              >
                {savingNote ? <Spinner size="sm" /> : <Plus className="h-3.5 w-3.5" />}
                Add note
              </Button>
            </div>
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes recorded.</p>
            ) : (
              notes.map((n: any, i: number) => (
                <div key={i} className="rounded-lg border border-border p-3 text-sm">
                  <p>{n.content ?? n.text ?? n.note ?? "—"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                    {n.addedBy || n.authorName ? ` · by ${n.addedBy ?? n.authorName}` : ""}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
