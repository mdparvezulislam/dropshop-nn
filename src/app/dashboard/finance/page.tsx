"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import {
  listLedgerEntriesAction,
  listWithdrawalsAction,
  listInvoicesAction,
  transitionWithdrawalAction,
} from "@/features/finance/actions/finance-actions";
import { toast } from "sonner";
import { DollarSign, Landmark, Receipt, ClipboardList, CheckCircle, XCircle } from "lucide-react";

export default function AdminFinancePage() {
  const { data: session } = useSession() as any;
  
  const [activeTab, setActiveTab] = React.useState<"wallets" | "ledger" | "withdrawals" | "invoices">("withdrawals");
  const [ledger, setLedger] = React.useState<any[]>([]);
  const [withdrawals, setWithdrawals] = React.useState<any[]>([]);
  const [invoices, setInvoices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [refTxId, setRefTxId] = React.useState<Record<string, string>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const ledRes = await listLedgerEntriesAction();
      if (ledRes.success && ledRes.data) setLedger(ledRes.data);

      const witRes = await listWithdrawalsAction();
      if (witRes.success && witRes.data) setWithdrawals(witRes.data);

      const invRes = await listInvoicesAction();
      if (invRes.success && invRes.data) setInvoices(invRes.data);
    } catch (err) {
      toast.error("Failed to load platform financial registry data");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleWithdrawalAction = async (withdrawalId: string, toStatus: string) => {
    try {
      const payload: any = {
        withdrawalId,
        toStatus,
      };

      if (toStatus === "completed") {
        const referenceNumber = refTxId[withdrawalId];
        if (!referenceNumber?.trim()) {
          toast.error("Please enter a transaction payment receipt reference ID");
          return;
        }
        payload.referenceNumber = referenceNumber;
        payload.fee = 1000; // default BDT 10 transaction fee
      }

      const res = await transitionWithdrawalAction(payload);
      if (res.success) {
        toast.success(`Withdrawal status updated to ${toStatus}`);
        loadData();
      } else {
        toast.error(res.error || "Failed to update withdrawal status");
      }
    } catch (err: any) {
      toast.error(err.message || "Action execution error");
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
      case "approved":
      case "cleared":
        return "success" as const;
      case "pending":
      case "under_review":
        return "warning" as const;
      case "rejected":
      case "cancelled":
      case "failed":
        return "destructive" as const;
      default:
        return "default" as const;
    }
  };

  const wallets: any[] = [];

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Finance Administration Console</h1>
        <p className="text-sm text-slate-400">Manage platform ledger balances, payout requests, and invoices</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" /> Total Platform Cash
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-indigo-400">
              {formatCurrency(ledger.reduce((acc, curr) => acc + (curr.amount || 0), 0))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Landmark className="h-3.5 w-3.5" /> Pending Withdrawals
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-400">
              {withdrawals.filter((w) => w.status === "pending" || w.status === "approved").length} requests
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Receipt className="h-3.5 w-3.5" /> Platform Invoices
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-emerald-400">{invoices.length} invoices</div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ClipboardList className="h-3.5 w-3.5" /> Ledger entries
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{ledger.length} entries</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-md">
        <CardContent className="p-2 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("withdrawals")}
            className={`flex items-center gap-2 px-4 h-9 rounded-md text-xs font-medium transition-colors shrink-0 ${
              activeTab === "withdrawals" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Withdrawals Queue ({withdrawals.filter((w) => w.status !== "completed" && w.status !== "rejected").length})
          </button>
          <button
            onClick={() => setActiveTab("wallets")}
            className={`flex items-center gap-2 px-4 h-9 rounded-md text-xs font-medium transition-colors shrink-0 ${
              activeTab === "wallets" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            User Wallets
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`flex items-center gap-2 px-4 h-9 rounded-md text-xs font-medium transition-colors shrink-0 ${
              activeTab === "ledger" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Ledger Audit Log
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex items-center gap-2 px-4 h-9 rounded-md text-xs font-medium transition-colors shrink-0 ${
              activeTab === "invoices" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Invoices Registry
          </button>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/30 overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === "withdrawals" && (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Withdrawal Ref</TableHead>
                  <TableHead className="text-slate-400">Wallet Account ID</TableHead>
                  <TableHead className="text-slate-400">Method</TableHead>
                  <TableHead className="text-slate-400">Details</TableHead>
                  <TableHead className="text-slate-400">Amount</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-slate-500 text-xs">
                      No withdrawal requests logged
                    </TableCell>
                  </TableRow>
                ) : (
                  withdrawals.map((w) => (
                    <TableRow key={w.id} className="border-slate-800">
                      <TableCell className="font-mono text-slate-300 text-xs">{w.id.slice(-8)}</TableCell>
                      <TableCell className="font-mono text-slate-400 text-xs">{w.walletId.slice(-8)}</TableCell>
                      <TableCell className="capitalize text-slate-200">{w.method}</TableCell>
                      <TableCell className="text-xs text-slate-300">
                        {w.payoutDetails?.accountNumber}
                        {w.payoutDetails?.bankName && ` - ${w.payoutDetails.bankName}`}
                      </TableCell>
                      <TableCell className="font-semibold text-white">{formatCurrency(w.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(w.status)}>{w.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {w.status === "pending" && (
                          <div className="inline-flex gap-1.5">
                            <Button
                              onClick={() => handleWithdrawalAction(w.id, "approved")}
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-500 text-xs h-7"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleWithdrawalAction(w.id, "rejected")}
                              variant="destructive"
                              size="sm"
                              className="text-xs h-7"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {w.status === "approved" && (
                          <div className="inline-flex items-center gap-1.5">
                            <Input
                              placeholder="Trx ID reference"
                              value={refTxId[w.id] || ""}
                              onChange={(e) => setRefTxId({ ...refTxId, [w.id]: e.target.value })}
                              className="h-7 w-32 bg-slate-950 border-slate-800 text-[10px] text-white pl-2"
                            />
                            <Button
                              onClick={() => handleWithdrawalAction(w.id, "completed")}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-500 text-xs h-7"
                            >
                              Pay / Complete
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          )}

          {activeTab === "wallets" && (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Wallet ID</TableHead>
                  <TableHead className="text-slate-400">Workspace / Owner ID</TableHead>
                  <TableHead className="text-slate-400">Role</TableHead>
                  <TableHead className="text-slate-400">Currency</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                      No active wallets found
                    </TableCell>
                  </TableRow>
                ) : (
                  wallets.map((w) => (
                    <TableRow key={w.id} className="border-slate-800">
                      <TableCell className="font-mono text-xs text-indigo-400">{w.id}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-300">{w.workspaceId}</TableCell>
                      <TableCell className="capitalize text-slate-200">{w.role}</TableCell>
                      <TableCell className="font-semibold text-white">BDT</TableCell>
                      <TableCell>
                        <Badge variant="success">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {activeTab === "ledger" && (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Date</TableHead>
                  <TableHead className="text-slate-400">Ledger ID</TableHead>
                  <TableHead className="text-slate-400">Entry Type</TableHead>
                  <TableHead className="text-slate-400">Amount</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Holding Clears At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-slate-500 text-xs">
                      No ledger transactions logged
                    </TableCell>
                  </TableRow>
                ) : (
                  ledger.map((l) => (
                    <TableRow key={l.id} className="border-slate-800">
                      <TableCell className="text-xs text-slate-400">{new Date(l.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-[10px] text-slate-500">{l.id}</TableCell>
                      <TableCell className="font-mono text-xs text-indigo-400 capitalize">{l.type.replace("_", " ")}</TableCell>
                      <TableCell
                        className={`font-semibold ${l.amount >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {l.amount >= 0 ? "+" : ""}{formatCurrency(l.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(l.status)}>{l.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {l.clearsAt ? new Date(l.clearsAt).toLocaleDateString() : "Immediate"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {activeTab === "invoices" && (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Invoice Number</TableHead>
                  <TableHead className="text-slate-400">Order Number</TableHead>
                  <TableHead className="text-slate-400">Receiver</TableHead>
                  <TableHead className="text-slate-400">Grand Total</TableHead>
                  <TableHead className="text-slate-400">Billing Status</TableHead>
                  <TableHead className="text-slate-400">Generated Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-slate-500 text-xs">
                      No invoices generated
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((i) => (
                    <TableRow key={i.id} className="border-slate-800">
                      <TableCell className="font-semibold text-indigo-300 text-xs">{i.invoiceNumber}</TableCell>
                      <TableCell className="text-xs text-slate-300">{i.orderNumber}</TableCell>
                      <TableCell className="text-xs text-slate-400">{i.customerSnapshot?.name}</TableCell>
                      <TableCell className="font-semibold text-white">{formatCurrency(i.grandTotal)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(i.status)}>{i.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">{new Date(i.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}
