"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertTriangle, ArrowLeft } from "lucide-react";

const MOCK_LOW_STOCK = [
  {
    id: "2",
    productName: "Galaxy S24 Ultra",
    variantSku: "SAM-S24U-512-TIT",
    availableStock: 7,
    reservedStock: 2,
    incomingStock: 50,
    safetyStock: 10,
    reorderLevel: 12,
    lowStockThreshold: 10,
    availability: "low_stock" as const,
  },
  {
    id: "4",
    productName: "AirPods Pro 2",
    variantSku: "APL-APP2-USB-C",
    availableStock: 0,
    reservedStock: 0,
    incomingStock: 0,
    safetyStock: 20,
    reorderLevel: 25,
    lowStockThreshold: 15,
    availability: "out_of_stock" as const,
  },
  {
    id: "3",
    productName: "MacBook Pro 14 M3",
    variantSku: "APL-MBP14M3-16-SLV",
    availableStock: 0,
    reservedStock: 0,
    incomingStock: 12,
    safetyStock: 5,
    reorderLevel: 8,
    lowStockThreshold: 5,
    availability: "backorder" as const,
  },
];

export default function LowStockListPage() {
  const [items] = React.useState(MOCK_LOW_STOCK);

  const critical = items.filter((i) => i.availableStock === 0).length;
  const warning = items.filter((i) => i.availableStock > 0).length;

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
            <AlertTriangle className="h-6 w-6 text-amber-400" /> Low Stock Alerts
          </h1>
          <p className="text-sm text-slate-400">SKUs at or below reorder / low-stock thresholds</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400">Total Alerts</span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-400">{items.length}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400">Critical (0 stock)</span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-rose-400">{critical}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50 col-span-2 sm:col-span-1">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400">Warning (low)</span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-300">{warning}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-800 bg-slate-900/30 overflow-hidden">
        {items.length === 0 ? (
          <EmptyState
            title="All stocked up"
            description="No products are currently below their low-stock thresholds."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Product / SKU</TableHead>
                  <TableHead className="text-slate-400">Available</TableHead>
                  <TableHead className="text-slate-400 hidden sm:table-cell">Threshold</TableHead>
                  <TableHead className="text-slate-400 hidden md:table-cell">Reorder At</TableHead>
                  <TableHead className="text-slate-400 hidden lg:table-cell">Incoming</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="border-slate-800">
                    <TableCell>
                      <div className="font-medium text-white">{item.productName}</div>
                      <div className="text-xs text-slate-500 font-mono">{item.variantSku}</div>
                    </TableCell>
                    <TableCell
                      className={`font-bold ${
                        item.availableStock === 0 ? "text-rose-400" : "text-amber-400"
                      }`}
                    >
                      {item.availableStock}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-slate-400">
                      {item.lowStockThreshold}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-slate-400">
                      {item.reorderLevel}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sky-400">
                      {item.incomingStock}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.availableStock === 0 ? "destructive" : "warning"}>
                        {item.availability.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/dashboard/inventory/adjust?id=${item.id}`}
                        className="text-sm text-indigo-400 hover:text-indigo-300"
                      >
                        Restock
                      </Link>
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
