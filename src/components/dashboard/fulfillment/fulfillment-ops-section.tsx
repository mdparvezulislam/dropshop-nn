"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ClipboardCheck,
  Clock,
  PackageCheck,
  RotateCcw,
  Truck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/workspace/stat-card";
import {
  getFulfillmentDashboardAction,
  type FulfillmentDashboardData,
} from "@/features/courier/actions/fulfillment-actions";

const QUEUE_TILES = [
  {
    key: "awaitingConfirmation" as const,
    label: "Awaiting confirmation",
    hint: "Call and confirm",
    icon: Clock,
    accent: "warning" as const,
    href: "/dashboard/orders?status=pending",
  },
  {
    key: "readyToPack" as const,
    label: "Ready to pack",
    hint: "Confirmed orders",
    icon: PackageCheck,
    accent: "info" as const,
    href: "/dashboard/orders?status=confirmed",
  },
  {
    key: "readyToShip" as const,
    label: "Ready to ship",
    hint: "Packed, awaiting courier",
    icon: ClipboardCheck,
    accent: "info" as const,
    href: "/dashboard/orders?status=packed",
  },
  {
    key: "inTransit" as const,
    label: "In transit",
    hint: "With the courier",
    icon: Truck,
    accent: "primary" as const,
    href: "/dashboard/shipments?status=in_transit",
  },
  {
    key: "delayed" as const,
    label: "Delayed",
    hint: "No movement in 72h",
    icon: AlertTriangle,
    accent: "danger" as const,
    href: "/dashboard/shipments",
  },
  {
    key: "returned" as const,
    label: "Returned",
    hint: "Back from courier",
    icon: RotateCcw,
    accent: "warning" as const,
    href: "/dashboard/shipments?status=returned",
  },
];

/**
 * Fulfillment operations on the workspace home.
 *
 * Every figure is a live database count from `FulfillmentService`. When the
 * load fails the section says so rather than rendering zeros, because a zero
 * that means "we could not check" reads exactly like a zero that means
 * "nothing to do".
 */
export function FulfillmentOpsSection(): React.ReactElement {
  const [data, setData] = React.useState<FulfillmentDashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    getFulfillmentDashboardAction()
      .then((result) => {
        if (!active) return;
        if (result.success) setData(result.data);
        else setError(result.error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section aria-labelledby="fulfillment-ops-heading" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2
            id="fulfillment-ops-heading"
            className="text-base font-bold tracking-tight text-foreground flex items-center gap-2"
          >
            <Truck className="h-4 w-4 text-primary" aria-hidden />
            Fulfillment operations
          </h2>
          <p className="text-xs text-muted-foreground">
            Live order and shipment queues across the warehouse
          </p>
        </div>
        <Link
          href="/dashboard/shipments"
          className="text-xs font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary rounded shrink-0"
        >
          Open console →
        </Link>
      </div>

      {error ? (
        <p role="alert" className="text-xs font-bold text-destructive">
          Fulfillment queues could not be loaded. {error}
        </p>
      ) : (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {QUEUE_TILES.map((tile) => (
            <Link
              key={tile.key}
              href={tile.href}
              className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <StatCard
                label={tile.label}
                value={data?.queues[tile.key] ?? 0}
                hint={tile.hint}
                icon={tile.icon}
                accent={
                  (data?.queues[tile.key] ?? 0) > 0 ? tile.accent : "default"
                }
                loading={loading}
              />
            </Link>
          ))}
        </div>
      )}

      {data && data.delayed.length > 0 && (
        <Card className="border-border bg-card shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" aria-hidden />
              Stalled shipments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {data.delayed.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/shipments/${item.id}`}
                      className="text-xs font-bold text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-primary rounded"
                    >
                      {item.orderNumber}
                    </Link>
                    <span className="block text-[11px] font-semibold text-muted-foreground truncate">
                      {item.providerName} • {item.statusLabel}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-destructive whitespace-nowrap">
                    {item.stalledHours}h without movement
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {data && data.statistics.total > 0 && (
        <p className="text-[11px] font-semibold text-muted-foreground">
          {data.statistics.total} shipments recorded • {data.statistics.delivered} delivered •{" "}
          {data.statistics.inCustody} with couriers
          {data.statistics.deliverySuccessRate !== null &&
            ` • ${data.statistics.deliverySuccessRate}% delivery success`}
        </p>
      )}
    </section>
  );
}

export default FulfillmentOpsSection;
