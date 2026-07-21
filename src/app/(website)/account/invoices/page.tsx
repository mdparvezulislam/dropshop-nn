import Link from "next/link";
import { FileText, Download, Printer, CheckCircle2, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Invoices & Billing - DropshopNN Account",
  description: "Download official tax invoices, billing statements, and VAT receipts.",
};

const INVOICES = [
  {
    id: "INV-2026-00001",
    orderNumber: "ORD-2026-00001",
    date: "2026-07-15",
    amount: "৳ 137,500 BDT",
    status: "paid",
  },
  {
    id: "INV-2026-00002",
    orderNumber: "ORD-2026-00002",
    date: "2026-07-18",
    amount: "৳ 45,000 BDT",
    status: "paid",
  },
];

export default function AccountInvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" /> Invoices & Billing
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official sales receipts, tax documents, and wholesale VAT statements.
          </p>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
            <tr>
              <th className="p-4">Invoice #</th>
              <th className="p-4">Order #</th>
              <th className="p-4">Date</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {INVOICES.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-mono font-bold text-amber-400">{inv.id}</td>
                <td className="p-4 font-mono text-slate-300">{inv.orderNumber}</td>
                <td className="p-4 text-slate-400">{inv.date}</td>
                <td className="p-4 font-bold text-white">{inv.amount}</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Paid
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                    <Download className="w-3.5 h-3.5 text-amber-400" /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
