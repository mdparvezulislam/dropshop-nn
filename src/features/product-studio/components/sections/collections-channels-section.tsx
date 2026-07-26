"use client";

import * as React from "react";
import { StudioCollapsibleSection } from "../studio-collapsible-section";
import { listCollectionsAction } from "@/features/catalog/actions/classification-actions";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/forms/form-field";
import { Search, Layers, Globe, Check, Store } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface CollectionsChannelsSectionProps {
  selectedCollectionIds?: string[];
  onCollectionsChange?: (ids: string[]) => void;
  channels?: string[];
  onChannelsChange?: (channels: string[]) => void;
  visibility?: string;
  onVisibilityChange?: (v: string) => void;
}

const ALL_CHANNELS = [
  { id: "storefront", label: "Online Storefront", icon: Globe, default: true },
  { id: "reseller", label: "Reseller Partner Network", icon: Store, default: true },
  { id: "wholesale", label: "Wholesale B2B Bulk Portal", icon: Layers, default: true },
  { id: "google_merchant", label: "Google Merchant Center Feed", icon: Search, default: false },
  { id: "facebook_shop", label: "Facebook & Instagram Shop", icon: Globe, default: false },
  { id: "marketplace", label: "Marketplace Channel", icon: Store, default: false },
];

const VISIBILITY_OPTIONS = [
  { id: "public", label: "Public (Visible to everyone)" },
  { id: "private", label: "Reseller Private Catalog Only" },
  { id: "wholesale_only", label: "Wholesale B2B Buyers Only" },
  { id: "supplier_only", label: "Supplier Internal Access Only" },
  { id: "hidden", label: "Hidden / Archived (Direct link only)" },
];

export function CollectionsChannelsSection({
  selectedCollectionIds = [],
  onCollectionsChange,
  channels = ["storefront", "reseller", "wholesale"],
  onChannelsChange,
  visibility = "public",
  onVisibilityChange,
}: CollectionsChannelsSectionProps): React.ReactElement {
  const [collections, setCollections] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    async function load() {
      try {
        const res = await listCollectionsAction();
        if (res.success && Array.isArray(res.data)) {
          setCollections(res.data);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleCollection = (id: string) => {
    if (!onCollectionsChange) return;
    if (selectedCollectionIds.includes(id)) {
      onCollectionsChange(selectedCollectionIds.filter((c) => c !== id));
    } else {
      onCollectionsChange([...selectedCollectionIds, id]);
    }
  };

  const toggleChannel = (id: string) => {
    if (!onChannelsChange) return;
    if (channels.includes(id)) {
      onChannelsChange(channels.filter((c) => c !== id));
    } else {
      onChannelsChange([...channels, id]);
    }
  };

  const filteredCollections = collections.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <StudioCollapsibleSection
      id="collections"
      title="Collections, Sales Channels & Access Control"
      description="Assign product to automated collections, enable sales channels, and enforce visibility rules"
      defaultExpanded={true}
    >
      <div className="space-y-5">
        {/* Sales Channels Picker */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
            Active Sales Channels
          </label>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_CHANNELS.map((ch) => {
              const Icon = ch.icon;
              const active = channels.includes(ch.id);
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => toggleChannel(ch.id)}
                  className={cn(
                    "flex items-center justify-between p-3.5 sm:p-3 rounded-xl border text-left transition-all",
                    active
                      ? "border-primary bg-accent text-foreground font-bold shadow-2xs"
                      : "border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-muted/40",
                  )}
                >
                  <span className="flex items-center gap-2 text-xs font-semibold">
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    {ch.label}
                  </span>
                  {active ? <Check className="h-4 w-4 text-primary shrink-0" /> : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visibility Control */}
        <FormField label="Catalog Access & Visibility Rules">
          <select
            value={visibility}
            onChange={(e) => onVisibilityChange && onVisibilityChange(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          >
            {VISIBILITY_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </FormField>

        {/* Collections Picker */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Collections ({selectedCollectionIds.length} Selected)
            </label>
          </div>

          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search collections (e.g. Flash Sale, Featured, Best Sellers)…"
              className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>

          <div className="ws-scroll max-h-40 overflow-y-auto rounded-xl border border-border bg-muted/20 p-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {loading ? (
              <p className="col-span-full text-xs text-muted-foreground text-center py-4">
                Loading collections…
              </p>
            ) : filteredCollections.length === 0 ? (
              <p className="col-span-full text-xs text-muted-foreground text-center py-4">
                No collections found
              </p>
            ) : (
              filteredCollections.map((col) => {
                const isSelected = selectedCollectionIds.includes(col.id);
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => toggleCollection(col.id)}
                    className={cn(
                      "flex items-center justify-between p-3 sm:p-2 rounded-xl sm:rounded-lg text-xs font-semibold transition-all border",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground font-bold shadow-2xs"
                        : "border-border/60 bg-card text-foreground hover:bg-muted/60",
                    )}
                  >
                    <span className="truncate flex items-center gap-1.5">
                      <Layers className="h-3 w-3 shrink-0" /> {col.name}
                    </span>
                    {isSelected ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </StudioCollapsibleSection>
  );
}
