import * as React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
  AlertTriangle,
  ClipboardCheck,
  PackageCheck,
  RotateCcw,
  Truck,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/workspace/stat-card";
import { ShipmentFilterBar } from "@/components/dashboard/fulfillment/shipment-filter-bar";
import { ShipmentTable } from "@/components/dashboard/fulfillment/shipment-table";
import {
  getFulfillmentDashboardAction,
  listShipmentsAction,
} from "@/features/courier/actions/fulfillment-actions";
import { DELAYED_SHIPMENT_HOURS } from "@/features/courier/services/fulfillment-service";

export const metadata: Metadata = {
  title: "Fulfillment & Shipments",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

/**
 * The fulfillment console.
 *
 * Server-rendered and URL-driven: filters live in the querystring, the table
 * is a plain server render, and only the filter bar and the bulk-action island
 * ship JavaScript. The stats panel streams behind Suspense so an aggregation
 * never blocks the shipment list.
 */
export default async function ShipmentsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Fulfillment &amp; Shipments
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pack, assign a courier and track every parcel from one place.
          </p>
        </div>
        <Link
          href="/dashboard/orders?status=confirmed"
          className="h-10 px-4 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card text-xs font-bold text-foreground hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ClipboardCheck className="h-3.5 w-3.5" aria-hidden />
          Orders to pack
        </Link>
      </div>

      <Suspense fallback={<QueuesSkeleton />}>
        <FulfillmentQueues />
      </Suspense>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">Shipments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ShipmentFilterBar />
          <Suspense fallback={<TableSkeleton />}>
            <ShipmentResults params={params} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Queues ───────────────────────────────────────────────────────────────

async function FulfillmentQueues() {
  const result = await getFulfillmentDashboardAction();

  if (!result.success) {
    return (
      <p role="alert" className="text-xs font-bold text-destructive">
        Fulfillment statistics could not be loaded. {result.error}
      </p>
    );
  }

  const { queues, statistics, delayed } = result.data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard
          label="Awaiting confirmation"
          value={queues.awaitingConfirmation}
          icon={Clock}
          accent="warning"
          hint="Pending orders"
        />
        <StatCard
          label="Ready to pack"
          value={queues.readyToPack}
          icon={PackageCheck}
          accent="info"
          hint="Confirmed / picking"
        />
        <StatCard
          label="Ready to ship"
          value={queues.readyToShip}
          icon={ClipboardCheck}
          accent="info"
          hint="Packed & dispatch-ready"
        />
        <StatCard
          label="In transit"
          value={queues.inTransit}
          icon={Truck}
          accent="primary"
          hint="With the courier"
        />
        <StatCard
          label="Delayed"
          value={queues.delayed}
          icon={AlertTriangle}
          accent={queues.delayed > 0 ? "danger" : "default"}
          hint={`No movement in ${DELAYED_SHIPMENT_HOURS}h`}
        />
        <StatCard
          label="Returned"
          value={queues.returned}
          icon={RotateCcw}
          accent={queues.returned > 0 ? "warning" : "default"}
          hint="Back from courier"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Courier performance</CardTitle>
          </CardHeader>
          <CardContent>
            {statistics.byProvider.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4">
                No shipments recorded yet. Courier performance appears once parcels start moving.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <caption className="sr-only">Shipments by courier</caption>
                  <thead>
                    <tr className="border-b border-border">
                      <th scope="col" className="py-2 font-bold uppercase tracking-wider text-muted-foreground text-[11px]">
                        Courier
                      </th>
                      <th scope="col" className="py-2 font-bold uppercase tracking-wider text-muted-foreground text-[11px]">
                        Shipments
                      </th>
                      <th scope="col" className="py-2 font-bold uppercase tracking-wider text-muted-foreground text-[11px]">
                        Delivered
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {statistics.byProvider.map((row) => (
                      <tr key={row.provider}>
                        <td className="py-2 font-bold text-foreground">{row.providerName}</td>
                        <td className="py-2 tabular-nums text-muted-foreground">{row.count}</td>
                        <td className="py-2 tabular-nums text-muted-foreground">{row.delivered}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[11px] font-semibold text-muted-foreground mt-3">
                  {statistics.deliverySuccessRate === null
                    ? "Delivery success rate appears once shipments reach a final state."
                    : `Delivery success rate: ${statistics.deliverySuccessRate}% of ${statistics.delivered + statistics.returned} resolved shipments.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" aria-hidden />
              Needs attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {delayed.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">
                Nothing is stalled. Every in-flight parcel moved within the last{" "}
                {DELAYED_SHIPMENT_HOURS} hours.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {delayed.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/shipments/${item.id}`}
                        className="text-xs font-bold text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-primary rounded truncate block"
                      >
                        {item.orderNumber}
                      </Link>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {item.providerName} • {item.statusLabel}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-destructive whitespace-nowrap">
                      {item.stalledHours}h
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Results ──────────────────────────────────────────────────────────────

async function ShipmentResults({
  params,
}: {
  params: Record<string, string | string[] | undefined>;
}) {
  const page = Number(first(params.page) ?? "1");
  const result = await listShipmentsAction({
    search: first(params.search),
    status: first(params.status),
    provider: first(params.provider),
    startDate: first(params.from),
    endDate: first(params.to),
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: 25,
  });

  if (!result.success) {
    return (
      <p role="alert" className="text-xs font-bold text-destructive py-6">
        Shipments could not be loaded. {result.error}
      </p>
    );
  }

  const { items, total, totalPages } = result.data;
  const currentPage = result.data.page;

  return (
    <div className="space-y-4">
      <ShipmentTable shipments={items} />

      {totalPages > 1 && (
        <nav
          className="flex items-center justify-between gap-3 pt-1"
          aria-label="Shipment pagination"
        >
          <p className="text-[11px] font-semibold text-muted-foreground">
            Page {currentPage} of {totalPages} — {total} shipments
          </p>
          <div className="flex gap-1.5">
            <PageLink params={params} page={currentPage - 1} disabled={currentPage <= 1}>
              Previous
            </PageLink>
            <PageLink params={params} page={currentPage + 1} disabled={currentPage >= totalPages}>
              Next
            </PageLink>
          </div>
        </nav>
      )}
    </div>
  );
}

function PageLink({
  params,
  page,
  disabled,
  children,
}: {
  params: Record<string, string | string[] | undefined>;
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="h-9 px-3 inline-flex items-center rounded-lg border border-border text-xs font-bold text-muted-foreground opacity-50"
      >
        {children}
      </span>
    );
  }

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const v = first(value);
    if (v && key !== "page") query.set(key, v);
  }
  query.set("page", String(page));

  return (
    <Link
      href={`/dashboard/shipments?${query.toString()}`}
      className="h-9 px-3 inline-flex items-center rounded-lg border border-border bg-card text-xs font-bold text-foreground hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {children}
    </Link>
  );
}

// ── Skeletons ────────────────────────────────────────────────────────────

function QueuesSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <StatCard key={i} label="" value="" loading />
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2 py-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}
