"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { upsertNavigationAction } from "@/features/cms/actions/navigation-actions";
import type {
  NavigationItem,
  NavigationLocation,
  NavigationMenu,
} from "@/features/cms/domain/navigation-entity";

interface NavigationManagerClientProps {
  initialMenus: NavigationMenu[];
}

const LOCATIONS: NavigationLocation[] = ["header", "footer", "sidebar", "mega_menu"];

function createItem(): NavigationItem {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `nav-${Date.now()}`,
    label: "New link",
    href: "/",
    sortOrder: 0,
    isVisible: true,
  };
}

export function NavigationManagerClient({
  initialMenus,
}: NavigationManagerClientProps): React.ReactElement {
  const [location, setLocation] = useState<NavigationLocation>("header");
  const existing = initialMenus.find((m) => m.location === location);
  const [name, setName] = useState(existing?.name ?? "Header menu");
  const [items, setItems] = useState<NavigationItem[]>(existing?.items ?? []);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const switchLocation = (next: NavigationLocation): void => {
    const menu = initialMenus.find((m) => m.location === next);
    setLocation(next);
    setName(menu?.name ?? `${next.replace("_", " ")} menu`);
    setItems(menu?.items ?? []);
    setMessage(null);
  };

  const save = async (): Promise<void> => {
    setLoading(true);
    setMessage(null);
    const res = await upsertNavigationAction({
      id: existing?.id,
      name,
      location,
      items,
      isActive: true,
    });
    setLoading(false);
    setMessage(res.success ? "Navigation saved." : (res.error ?? "Save failed"));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Navigation</h1>
          <p className="text-sm text-muted-foreground">
            Manage header, footer, sidebar, and mega menu links.
          </p>
        </div>
        <Button size="sm" onClick={save} disabled={loading} className="gap-1.5">
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Save menu
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {LOCATIONS.map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => switchLocation(loc)}
            className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
              location === loc
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {loc.replace("_", " ")}
          </button>
        ))}
      </div>

      {message && <p className="text-sm text-emerald-600">{message}</p>}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm capitalize">{location.replace("_", " ")} menu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nav-name">Menu name</Label>
            <Input id="nav-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-1 gap-2 rounded-lg border border-border/40 p-3 sm:grid-cols-[1fr_1fr_auto]"
              >
                <Input
                  value={item.label}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((row, i) => (i === index ? { ...row, label: e.target.value } : row)),
                    )
                  }
                  placeholder="Label"
                />
                <Input
                  value={item.href}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((row, i) => (i === index ? { ...row, href: e.target.value } : row)),
                    )
                  }
                  placeholder="/path"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Remove item"
                  onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setItems((prev) => [...prev, createItem()])}
          >
            <Plus className="h-3.5 w-3.5" />
            Add link
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
