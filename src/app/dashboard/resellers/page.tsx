"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/shared/components/ui/card";
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
import { updateResellerStatusAction } from "@/features/reseller/actions/reseller-actions";
import { toast } from "sonner";
import { Plus, Search, Store, Eye, Ban, CheckCircle } from "lucide-react";

type ResellerListItem = {
  id: string;
  code: string;
  businessName: string;
  ownerName: string;
  contactPerson: string;
  email: string;
  phone: string;
  businessType: string;
  address: { district: string };
  status: "pending" | "active" | "suspended" | "blocked" | "archived";
  productCount: number;
};

const MOCK_RESELLERS: ResellerListItem[] = [
  {
    id: "1",
    code: "RSL-0001",
    businessName: "Nova Retail Hub",
    ownerName: "Farhana Akter",
    contactPerson: "Farhana Akter",
    email: "farhana@novaretail.com",
    phone: "+8801711002200",
    businessType: "Sole Proprietorship",
    address: { district: "Dhaka" },
    status: "active",
    productCount: 48,
  },
  {
    id: "2",
    code: "RSL-0002",
    businessName: "City Drop Shop",
    ownerName: "Rafiul Islam",
    contactPerson: "Nusrat Jahan",
    email: "ops@citydrop.shop",
    phone: "+8801811334455",
    businessType: "Partnership",
    address: { district: "Chittagong" },
    status: "pending",
    productCount: 12,
  },
  {
    id: "3",
    code: "RSL-0003",
    businessName: "Express Merchants",
    ownerName: "Karim Ullah",
    contactPerson: "Karim Ullah",
    email: "karim@expressm.com",
    phone: "+8801911667788",
    businessType: "LTD",
    address: { district: "Sylhet" },
    status: "suspended",
    productCount: 31,
  },
];

export default function ResellersListPage() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [resellers, setResellers] = React.useState(MOCK_RESELLERS);
  const [mutatingId, setMutatingId] = React.useState<string | null>(null);

  const filtered = resellers.filter((item) => {
    const matchesSearch =
      item.businessName.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success" as const;
      case "pending":
        return "warning" as const;
      case "suspended":
      case "blocked":
        return "destructive" as const;
      default:
        return "default" as const;
    }
  };

  const handleStatus = async (id: string, status: "active" | "suspended" | "archived") => {
    setMutatingId(id);
    try {
      const res = await updateResellerStatusAction(id, status);
      if (res.success) {
        setResellers((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        toast.success(`Reseller ${status}`);
      } else {
        toast.error(res.error || "Status update failed");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Status update failed");
    } finally {
      setMutatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Resellers</h1>
          <p className="text-sm text-slate-400">
            Onboard resellers and manage their private product catalogs
          </p>
        </div>
        <Link
          href="/dashboard/resellers/new"
          className="flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 transition-colors gap-2"
        >
          <Plus className="h-4 w-4" /> Onboard Reseller
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Store className="h-3 w-3" /> Total
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{resellers.length}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400">Active</span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-emerald-400">
              {resellers.filter((r) => r.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400">Pending</span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-400">
              {resellers.filter((r) => r.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400">Suspended</span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-rose-400">
              {resellers.filter((r) => r.status === "suspended").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search name, code, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-950 border-slate-800 text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white w-full md:w-40"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="blocked">Blocked</option>
            <option value="archived">Archived</option>
          </select>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/30 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            title="No resellers"
            description="Onboard your first reseller to start building private catalogs."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Reseller</TableHead>
                  <TableHead className="text-slate-400 hidden md:table-cell">Contact</TableHead>
                  <TableHead className="text-slate-400 hidden lg:table-cell">District</TableHead>
                  <TableHead className="text-slate-400 hidden sm:table-cell">Products</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id} className="border-slate-800">
                    <TableCell>
                      <div className="font-medium text-white">{item.businessName}</div>
                      <div className="text-xs text-slate-500 font-mono">{item.code}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm text-slate-300">{item.contactPerson}</div>
                      <div className="text-xs text-slate-500">{item.email}</div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-slate-400">
                      {item.address.district}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-indigo-300">
                      {item.productCount}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/dashboard/resellers/${item.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {item.status !== "active" && (
                          <button
                            type="button"
                            disabled={mutatingId === item.id}
                            onClick={() => handleStatus(item.id, "active")}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-emerald-400 hover:bg-slate-800"
                            title="Activate"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {item.status === "active" && (
                          <button
                            type="button"
                            disabled={mutatingId === item.id}
                            onClick={() => handleStatus(item.id, "suspended")}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-rose-400 hover:bg-slate-800"
                            title="Suspend"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                      </div>
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
