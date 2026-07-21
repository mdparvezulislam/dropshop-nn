import type { Metadata } from "next";
import Link from "next/link";
import { ContentService } from "@/features/cms/services/content-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { FileText, Image, BookOpen, Megaphone, PanelTop, Navigation } from "lucide-react";

export const metadata: Metadata = {
  title: "CMS Overview - DropshopNN",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

const QUICK_LINKS = [
  { href: "/dashboard/content/pages", label: "Pages", icon: FileText },
  { href: "/dashboard/content/blog", label: "Blog", icon: BookOpen },
  { href: "/dashboard/content/banners", label: "Banners", icon: Megaphone },
  { href: "/dashboard/content/homepage", label: "Homepage", icon: PanelTop },
  { href: "/dashboard/content/media", label: "Media", icon: Image },
  { href: "/dashboard/content/navigation", label: "Navigation", icon: Navigation },
];

export default async function CmsOverviewPage() {
  const service = new ContentService();
  let byStatus: Record<string, number> = {
    draft: 0,
    review: 0,
    published: 0,
    scheduled: 0,
    archived: 0,
  };
  let recent: Awaited<ReturnType<ContentService["getOverview"]>>["recent"] = [];

  try {
    const overview = await service.getOverview();
    byStatus = overview.byStatus;
    recent = overview.recent;
  } catch {
    // DB may be unavailable during build
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Content Platform</h1>
        <p className="text-sm text-muted-foreground">
          One CMS for pages, blog, banners, homepage sections, media, and navigation.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Object.entries(byStatus).map(([status, count]) => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium capitalize text-muted-foreground">
                {status}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center gap-2 rounded-xl border border-border/40 bg-card p-4 text-center transition-colors hover:bg-muted/40"
          >
            <link.icon className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">{link.label}</span>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No content yet. Create a page or blog post.</p>
          ) : (
            recent.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-muted/30"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {item.type} · /{item.slug}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
                  {item.status}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
