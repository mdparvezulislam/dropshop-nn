"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { COURIER_PROVIDERS } from "@/features/courier/domain/courier-catalog";
import {
  SHIPMENT_STATUSES,
  getShipmentStatusLabel,
} from "@/features/courier/domain/shipment-state-machine";

const controlClass =
  "h-10 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground " +
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary";

/**
 * URL-driven filters: the querystring is the single source of truth, so a
 * filtered view is shareable, survives a refresh and re-renders on the server
 * without any client-side result cache to go stale.
 */
export function ShipmentFilterBar(): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [search, setSearch] = React.useState(params.get("search") ?? "");

  React.useEffect(() => {
    setSearch(params.get("search") ?? "");
  }, [params]);

  const apply = React.useCallback(
    (patch: Record<string, string | undefined>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (!value || value === "all") next.delete(key);
        else next.set(key, value);
      }
      // Any filter change invalidates the current page number.
      next.delete("page");
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router],
  );

  const onSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    apply({ search: search.trim() || undefined });
  };

  const hasFilters = ["search", "status", "provider", "from", "to"].some((k) => params.get(k));

  return (
    <form
      onSubmit={onSearchSubmit}
      className="flex flex-wrap items-end gap-2.5"
      role="search"
      aria-label="Filter shipments"
    >
      <div className="flex-1 min-w-52">
        <label htmlFor="shipment-search" className="block text-[11px] font-bold text-muted-foreground mb-1">
          Search
        </label>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
            aria-hidden
          />
          <input
            id="shipment-search"
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Order number, tracking number, customer, phone"
            className={`${controlClass} w-full pl-9`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="shipment-status" className="block text-[11px] font-bold text-muted-foreground mb-1">
          Status
        </label>
        <select
          id="shipment-status"
          className={controlClass}
          value={params.get("status") ?? "all"}
          onChange={(e) => apply({ status: e.target.value })}
        >
          <option value="all">All statuses</option>
          {SHIPMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {getShipmentStatusLabel(status)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="shipment-provider" className="block text-[11px] font-bold text-muted-foreground mb-1">
          Courier
        </label>
        <select
          id="shipment-provider"
          className={controlClass}
          value={params.get("provider") ?? "all"}
          onChange={(e) => apply({ provider: e.target.value })}
        >
          <option value="all">All couriers</option>
          {COURIER_PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="shipment-from" className="block text-[11px] font-bold text-muted-foreground mb-1">
          From
        </label>
        <input
          id="shipment-from"
          type="date"
          className={controlClass}
          value={params.get("from") ?? ""}
          onChange={(e) => apply({ from: e.target.value || undefined })}
        />
      </div>

      <div>
        <label htmlFor="shipment-to" className="block text-[11px] font-bold text-muted-foreground mb-1">
          To
        </label>
        <input
          id="shipment-to"
          type="date"
          className={controlClass}
          value={params.get("to") ?? ""}
          onChange={(e) => apply({ to: e.target.value || undefined })}
        />
      </div>

      <button
        type="submit"
        className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Apply
      </button>

      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="h-10 px-3 inline-flex items-center gap-1.5 rounded-lg border border-border text-xs font-bold text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
          Clear
        </button>
      )}
    </form>
  );
}

export default ShipmentFilterBar;
