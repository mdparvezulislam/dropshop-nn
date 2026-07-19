"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/shared/components/ui/card";
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
import { EmptyState } from "@/shared/components/ui/empty-state";
import { ArrowLeft, History, Search } from "lucide-react";
import { format } from "date-fns";

const MOCK_HISTORY = [
  {
    id: "h1",
    inventoryId: "1",
    productName: "iPhone 16 Pro Max",
    variantSku: "APL-IPH16PM-256-BLK",
    operation: "stock_in" as const,
    quantity: 20,
    previousAvailable: 22,
    newAvailable: 42,
    previousReserved: 8,
    newReserved: 8,
    reason: "Supplier restock PO-1042",
    performedBy: "admin@dropshop.nn",
    createdAt: new Date("2026-07-18T10:30:00"),
  },
  {
    id: "h2",
    inventoryId: "2",
    productName: "Galaxy S24 Ultra",
    variantSku: "SAM-S24U-512-TIT",
    operation: "reservation" as const,
    quantity: 2,
    previousAvailable: 9,
    newAvailable: 7,
    previousReserved: 0,
    newReserved: 2,
    reason: "Order hold ORD-8891",
    performedBy: "system",
    createdAt: new Date("2026-07-18T14:12:00"),
  },
  {
    id: "h3",
    inventoryId: "3",
    productName: "MacBook Pro 14 M3",
    variantSku: "APL-MBP14M3-16-SLV",
    operation: "stock_out" as const,
    quantity: 3,
    previousAvailable: 3,
    newAvailable: 0,
    previousReserved: 0,
    newReserved: 0,
    reason: "Fulfilled ORD-8870",
    performedBy: "staff@dropshop.nn",
    createdAt: new Date("2026-07-17T09:05:00"),
  },
  {
    id: "h4",
    inventoryId: "1",
    productName: "iPhone 16 Pro Max",
    variantSku: "APL-IPH16PM-256-BLK",
    operation: "adjustment" as const,
    quantity: 2,
    previousAvailable: 24,
    newAvailable: 22,
    previousReserved: 8,
    newReserved: 8,
    reason: "Cycle count correction",
    performedBy: "admin@dropshop.nn",
    createdAt: new Date("2026-07-16T16:40:00"),
  },
];

export default function InventoryHistoryPage() {
  const [search, setSearch] = React.useState("");
  const [operationFilter, setOperationFilter] = React.useState("all");
  const [history] = React.useState(MOCK_HISTORY);

  const filtered = history.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.variantSku.toLowerCase().includes(search.toLowerCase()) ||
      (item.reason || "").toLowerCase().includes(search.toLowerCase());
    const matchesOp = operationFilter === "all" || item.operation === operationFilter;
    return matchesSearch && matchesOp;
  });

  const getOpVariant = (op: string) => {
    switch (op) {
      case "stock_in":
      case "release":
        return "success" as const;
      case "stock_out":
      case "reservation":
        return "warning" as const;
      case "adjustment":
        return "default" as const;
      case "transfer":
        return "destructive" as const;
      default:
        return "default" as const;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/inventory"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <History className="h-6 w-6 text-indigo-400" /> Stock History
          </h1>
          <p className="text-sm text-slate-400">
            Timeline of stock movements, adjustments, and reservations
          </p>
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search product, SKU, reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-950 border-slate-800 text-white"
            />
          </div>
          <select
            value={operationFilter}
            onChange={(e) => setOperationFilter(e.target.value)}
            className="h-10 rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white w-full md:w-48"
          >
            <option value="all">All Operations</option>
            <option value="stock_in">Stock In</option>
            <option value="stock_out">Stock Out</option>
            <option value="adjustment">Adjustment</option>
            <option value="reservation">Reservation</option>
            <option value="release">Release</option>
            <option value="transfer">Transfer</option>
          </select>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/30 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            title="No history entries"
            description="Stock movements will appear here after adjustments."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">When</TableHead>
                  <TableHead className="text-slate-400">Product</TableHead>
                  <TableHead className="text-slate-400">Operation</TableHead>
                  <TableHead className="text-slate-400">Qty</TableHead>
                  <TableHead className="text-slate-400 hidden md:table-cell">Available</TableHead>
                  <TableHead className="text-slate-400 hidden lg:table-cell">Reason</TableHead>
                  <TableHead className="text-slate-400 hidden sm:table-cell">By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id} className="border-slate-800">
                    <TableCell className="text-slate-400 text-xs whitespace-nowrap">
                      {format(item.createdAt, "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-white text-sm">{item.productName}</div>
                      <div className="text-xs text-slate-500 font-mono">{item.variantSku}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getOpVariant(item.operation)}>
                        {item.operation.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-white">{item.quantity}</TableCell>
                    <TableCell className="hidden md:table-cell text-slate-300 text-sm">
                      {item.previousAvailable} → {item.newAvailable}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-slate-400 text-sm max-w-[200px] truncate">
                      {item.reason}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-slate-500 text-xs">
                      {item.performedBy}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
