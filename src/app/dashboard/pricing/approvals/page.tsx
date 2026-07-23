"use client";

import * as React from "react";
import { CheckCircle, Check, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { listPendingApprovalsAction, listAllApprovalsAction, approvePriceAction, rejectPriceAction } from "@/features/pricing/actions/pricing-engine-actions";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/workspace/section-header";

type Approval = { id: string; entityType: string; entityId: string; requestedByName?: string; status: string; reason: string; changes: Array<{field:string;oldValue:any;newValue:any}>; createdAt: string; };

export default function ApprovalsPage(): React.ReactElement {
  const [approvals, setApprovals] = React.useState<Approval[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAll, setShowAll] = React.useState(false);
  const [reviewDialog, setReviewDialog] = React.useState<{id:string;action:"approve"|"reject"} | null>(null);
  const [note, setNote] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = showAll ? await listAllApprovalsAction() : await listPendingApprovalsAction();
    if (res.success) setApprovals(((res.data ?? []) as any[]).map((a: any) => ({ ...a, createdAt: a.createdAt?.toString() ?? new Date().toISOString() })));
    setLoading(false);
  }, [showAll]);

  React.useEffect(() => { load(); }, [load]);

  const handleReview = async () => {
    if (!reviewDialog) return;
    try {
      if (reviewDialog.action === "approve") {
        await approvePriceAction(reviewDialog.id, note || undefined);
        toast.success("Approved");
      } else {
        await rejectPriceAction(reviewDialog.id, note || undefined);
        toast.success("Rejected");
      }
      setReviewDialog(null); setNote(""); load();
    } catch (err: any) { toast.error(err.message); }
  };

  const columns: DataTableColumn<Approval>[] = [
    { id: "entity", header: "Entity", cell: (r) => (
      <div><div className="font-medium capitalize">{r.entityType.replace(/_/g, " ")}</div><div className="text-[10px] font-mono text-muted-foreground">{r.entityId.slice(0, 16)}...</div></div>
    )},
    { id: "requested", header: "Requested By", cell: (r) => <span>{r.requestedByName ?? "System"}</span> },
    { id: "reason", header: "Reason", hideOnMobile: true, cell: (r) => <span className="text-xs text-muted-foreground max-w-[200px] truncate block">{r.reason}</span> },
    { id: "date", header: "Date", hideOnMobile: true, cell: (r) => <span className="text-xs">{new Date(r.createdAt).toLocaleDateString()}</span> },
    { id: "status", header: "স্ট্যাটাস", cell: (r) => (
      <Badge variant={r.status === "pending" ? "warning" : r.status === "approved" ? "success" : "destructive"} size="sm">
        {r.status === "pending" ? "Pending" : r.status === "approved" ? "Approved" : "Rejected"}
      </Badge>
    )},
    { id: "actions", header: "", cell: (r) => r.status === "pending" ? (
      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setReviewDialog({ id: r.id, action: "approve" })} className="h-8 w-8 flex items-center justify-center rounded-md text-success hover:bg-success/10"><Check className="h-4 w-4" /></button>
        <button onClick={() => setReviewDialog({ id: r.id, action: "reject" })} className="h-8 w-8 flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10"><X className="h-4 w-4" /></button>
      </div>
    ) : null},
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Price Approvals" description="মূল্য অনুমোদন ওয়ার্কফ্লো — পেন্ডিং অনুমোদন পর্যালোচনা করুন" icon={CheckCircle}
        action={
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="rounded border-border" />
            Show all
          </label>
        }
      />
      <DataTable columns={columns} data={approvals} loading={loading}
        emptyTitle="No pending approvals"
        emptyDescription="Price changes requiring approval will appear here." />

      <Dialog open={!!reviewDialog} onOpenChange={(o) => !o && setReviewDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{reviewDialog?.action === "approve" ? "Approve" : "Reject"} Price Change</DialogTitle></DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-3">Add a review note (optional):</p>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Review note..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(null)}>Cancel</Button>
            <Button variant={reviewDialog?.action === "approve" ? "default" : "destructive"} onClick={handleReview}>
              {reviewDialog?.action === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
