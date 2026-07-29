"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Package, ShoppingCart, Users, ArrowRight, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";

export interface ResellerGlobalSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResultItem {
  id: string;
  type: "product" | "order" | "customer";
  title: string;
  subtitle: string;
  href: string;
  status?: string;
}

export function ResellerGlobalSearchModal({
  open,
  onOpenChange,
}: ResellerGlobalSearchModalProps): React.ReactElement {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<SearchResultItem[]>([]);

  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [prodMod, orderMod, custMod] = await Promise.all([
          import("@/features/reseller/actions/reseller-actions"),
          import("@/features/order/actions/order-actions"),
          import("@/features/customer/actions/customer-actions"),
        ]);

        const [prodRes, orderRes, custRes] = await Promise.allSettled([
          prodMod.searchResellerProductsAction({ search: query, limit: 5 }),
          orderMod.listOrdersAction({ type: "reseller", search: query, page: 1, limit: 5 }),
          custMod.listCustomersAction(query),
        ]);

        const items: SearchResultItem[] = [];

        if (prodRes.status === "fulfilled" && prodRes.value.success && prodRes.value.data) {
          const prods = (prodRes.value.data as any).items || [];
          prods.forEach((p: any) => {
            items.push({
              id: p.id || p._id,
              type: "product",
              title: p.title || p.name || "Product",
              subtitle: `৳${p.price || p.suggestedPrice || 0} • Wholesale: ৳${p.wholesalePrice || 0}`,
              href: `/reseller/products`,
            });
          });
        }

        if (orderRes.status === "fulfilled" && orderRes.value.success && orderRes.value.data) {
          const od = (orderRes.value.data as any).items || [];
          od.forEach((o: any) => {
            items.push({
              id: o.id || o._id,
              type: "order",
              title: `Order #${o.orderNumber || o.id?.slice(0, 8)}`,
              subtitle: `${o.customer?.name || o.customerName || "Customer"} • ৳${o.pricing?.grandTotal || o.total || 0}`,
              href: `/reseller/orders/${o.id || o._id}`,
              status: o.status,
            });
          });
        }

        if (custRes.status === "fulfilled" && custRes.value.success && custRes.value.data) {
          const cd = Array.isArray(custRes.value.data) ? custRes.value.data : (custRes.value.data as any)?.items || [];
          cd.forEach((c: any) => {
            items.push({
              id: c.id || c._id,
              type: "customer",
              title: c.name || "Customer",
              subtitle: `${c.phone || c.email || "No phone"}`,
              href: `/reseller/customers/${c.id || c._id}`,
            });
          });
        }

        setResults(items);
      } catch {
        // silent search fallback
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (href: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden bg-card border-border shadow-2xl">
        <DialogTitle className="sr-only">Search Reseller Workspace</DialogTitle>
        <div className="flex items-center px-4 border-b border-border/80 bg-card">
          <Search className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, orders, customers..."
            className="flex-1 h-14 bg-transparent text-sm font-semibold text-foreground placeholder:text-muted-foreground outline-none"
            autoFocus
          />
          {loading && <Loader2 className="w-4 h-4 text-primary animate-spin mr-2" />}
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!query.trim() ? (
            <div className="p-8 text-center text-xs font-semibold text-muted-foreground space-y-1">
              <p>Type to search across reseller catalog, orders & customers</p>
              <p className="text-[11px] opacity-70">Shortcuts: Press ESC to close</p>
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="p-8 text-center text-xs font-semibold text-muted-foreground">
              No matching products, orders, or customers found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item) => {
                const Icon =
                  item.type === "product"
                    ? Package
                    : item.type === "order"
                      ? ShoppingCart
                      : Users;

                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item.href)}
                    className="w-full flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-muted/60 text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.status && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">
                          {item.status}
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
