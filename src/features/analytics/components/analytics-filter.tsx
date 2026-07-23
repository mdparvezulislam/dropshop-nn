"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { AnalyticsFilter } from "../domain/analytics-entity";

interface AnalyticsFilterProps {
  filters: AnalyticsFilter;
  onChange: (filters: AnalyticsFilter) => void;
}

export function AnalyticsFilterSheet({ filters, onChange }: AnalyticsFilterProps): React.ReactElement {
  const [local, setLocal] = useState<AnalyticsFilter>(filters);
  const [open, setOpen] = useState(false);

  const update = (key: keyof AnalyticsFilter, value: any) => {
    setLocal((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const apply = () => {
    onChange(local);
    setOpen(false);
  };

  const clear = () => {
    const cleared: AnalyticsFilter = {};
    setLocal(cleared);
    onChange(cleared);
    setOpen(false);
  };

  const hasFilters = Object.values(filters).some((v) => v !== undefined && v !== null && v !== "");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="h-3.5 w-3.5" />
          Filters
          {hasFilters && <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">!</span>}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle>Analytics Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Store</Label>
            <Input placeholder="Filter by store" value={local.store ?? ""} onChange={(e) => update("store", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Courier</Label>
            <Select value={local.courier ?? ""} onValueChange={(v) => update("courier", v)}>
              <SelectTrigger><SelectValue placeholder="All couriers" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">All couriers</SelectItem>
                <SelectItem value="steadfast">Steadfast</SelectItem>
                <SelectItem value="pathao">Pathao</SelectItem>
                <SelectItem value="redx">RedX</SelectItem>
                <SelectItem value="ecourier">eCourier</SelectItem>
                <SelectItem value="paperfly">Paperfly</SelectItem>
                <SelectItem value="sundarban">Sundarban</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Customer</Label>
            <Input placeholder="Customer ID" value={local.customerId ?? ""} onChange={(e) => update("customerId", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Reseller</Label>
            <Input placeholder="Reseller ID" value={local.resellerId ?? ""} onChange={(e) => update("resellerId", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Wholesale Buyer</Label>
            <Input placeholder="Wholesale ID" value={local.wholesaleId ?? ""} onChange={(e) => update("wholesaleId", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Product</Label>
            <Input placeholder="Product ID" value={local.productId ?? ""} onChange={(e) => update("productId", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Input placeholder="Category ID" value={local.categoryId ?? ""} onChange={(e) => update("categoryId", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Brand</Label>
            <Input placeholder="Brand ID" value={local.brandId ?? ""} onChange={(e) => update("brandId", e.target.value)} />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button onClick={apply} className="flex-1">Apply</Button>
            <Button variant="outline" onClick={clear} className="gap-1">
              <X className="h-3.5 w-3.5" /> Clear
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default AnalyticsFilterSheet;
