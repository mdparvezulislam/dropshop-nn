"use client";

import * as React from "react";
import { Download, Image, FileText, Video, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/shared/components/workspace/page-header";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { cn } from "@/shared/utils/cn";

const MEDIA_ITEMS = [
  { type: "HD Image", icon: Image, count: 6, description: "High-res product photos (3000x3000)" },
  { type: "Facebook Poster", icon: Image, count: 3, description: "Optimized for Facebook feed & stories" },
  { type: "Short Video", icon: Video, count: 2, description: "15-30s product showcase clips" },
  { type: "Long Video", icon: Video, count: 1, description: "Full product review & demo" },
  { type: "Description", icon: FileText, count: 1, description: "Ready-to-use product descriptions" },
];

export default function MarketingKitPage(): React.ReactElement {
  const [downloading, setDownloading] = React.useState<string | null>(null);

  const handleDownloadAll = async () => {
    setDownloading("all");
    // Simulate download - real implementation would zip and serve
    await new Promise((r) => setTimeout(r, 1500));
    setDownloading(null);
    toast.success("Marketing kit downloaded");
  };

  const downloadItem = async (type: string) => {
    setDownloading(type);
    await new Promise((r) => setTimeout(r, 800));
    setDownloading(null);
    toast.success(`${type} downloaded`);
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <PageHeader
        title="Marketing Kit"
        description="Download ready-to-use marketing assets for your products"
        actions={
          <Button
            onClick={handleDownloadAll}
            disabled={downloading === "all"}
            className="gap-1.5"
          >
            <Download className="h-4 w-4" />
            {downloading === "all" ? "Downloading…" : "Download All"}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MEDIA_ITEMS.map((item) => {
          const Icon = item.icon;
          const isDownloading = downloading === item.type;
          return (
            <Card key={item.type} className="group hover:border-primary/30 transition-colors">
              <CardHeader className="p-4 pb-2 flex-row items-start gap-3 space-y-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm">{item.type}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.count} assets</p>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <p className="text-xs text-muted-foreground mb-3">{item.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5"
                  disabled={isDownloading}
                  onClick={() => downloadItem(item.type)}
                >
                  <Download className="h-3.5 w-3.5" />
                  {isDownloading ? "Downloading…" : "Download"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground">
            Contact the admin team to request custom marketing materials or brand-specific assets for your store.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
