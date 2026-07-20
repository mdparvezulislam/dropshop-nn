"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Phone, Mail, MapPin, Clock, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { PageHeader } from "@/shared/components/workspace/page-header";
import { Spinner } from "@/shared/components/ui/spinner";

export default function ResellerCustomerDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const { listCustomersAction } = await import("@/features/customer/actions/customer-actions");
        const res = await listCustomersAction();
        if (res.success && res.data) {
          const found = (Array.isArray(res.data) ? res.data : []).find(
            (c: any) => c.id === params.id || c._id === params.id,
          );
          if (found) {
            setCustomer(found);
          } else {
            toast.error("Customer not found");
          }
        }
      } catch {
        toast.error("Failed to load customer");
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

  if (!customer) {
    return (
      <div className="space-y-6">
        <PageHeader title="Customer Not Found" />
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Customer not found.</CardContent></Card>
      </div>
    );
  }

  const addresses = customer.addresses ?? [];
  const notes = customer.notes ?? [];

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/reseller/customers")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title={customer.name} description={`Customer since ${customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "—"}`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Contact Info */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-sm">
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

        {/* Addresses */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Addresses ({addresses.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-sm">
            {addresses.length === 0 ? (
              <p className="text-muted-foreground">No addresses saved.</p>
            ) : (
              addresses.map((addr: any, i: number) => (
                <div key={i} className="rounded-lg border border-border p-3">
                  <p>{addr.fullAddress ?? addr.address ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{addr.district ?? ""} {addr.type ? `(${addr.type})` : ""}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Notes ({notes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-sm">
            {notes.length === 0 ? (
              <p className="text-muted-foreground">No notes recorded.</p>
            ) : (
              notes.map((note: any, i: number) => (
                <div key={i} className="rounded-lg border border-border p-3">
                  <p>{note.content ?? note.text ?? "—"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {note.createdAt ? new Date(note.createdAt).toLocaleString() : ""}
                    {note.addedBy ? ` · by ${note.addedBy}` : ""}
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
