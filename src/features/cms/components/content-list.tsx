"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, FileText, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  publishContentAction,
  archiveContentAction,
  deleteContentAction,
} from "../actions/content-actions";
import type { CmsContent, ContentType } from "../domain/content-entity";
import { useState } from "react";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  review: "bg-amber-500/10 text-amber-600 border-amber-200",
  published: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  scheduled: "bg-blue-500/10 text-blue-600 border-blue-200",
  archived: "bg-rose-500/10 text-rose-600 border-rose-200",
};

interface ContentListProps {
  type: ContentType | ContentType[];
  title: string;
  description: string;
  items: CmsContent[];
  totalCount: number;
  createHref: string;
  editBaseHref: string;
}

export function ContentList({
  type,
  title,
  description,
  items: initialItems,
  totalCount,
  createHref,
  editBaseHref,
}: ContentListProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");

  const filtered = search
    ? items.filter(
        (i) =>
          i.title.toLowerCase().includes(search.toLowerCase()) ||
          i.slug.toLowerCase().includes(search.toLowerCase()),
      )
    : items;

  const runAction = async (id: string, action: "publish" | "archive" | "delete") => {
    if (action === "publish") await publishContentAction({ id });
    if (action === "archive") await archiveContentAction(id);
    if (action === "delete") {
      await deleteContentAction(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
    router.refresh();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {description} · {totalCount} total
          </p>
        </div>
        <Link href={createHref}>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Create
          </Button>
        </Link>
      </div>

      <Input
        placeholder="Search title or slug..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <FileText className="mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No content yet.</p>
            <Link href={createHref} className="mt-3">
              <Button variant="outline" size="sm">
                Create first item
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="divide-y divide-border/40 p-0">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`${editBaseHref}/${item.id}/edit`}
                    className="text-sm font-medium hover:text-primary"
                  >
                    {item.title}
                  </Link>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>/{item.slug}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize ${STATUS_STYLES[item.status] ?? ""}`}
                    >
                      {item.status}
                    </Badge>
                    {item.category && <span>{item.category}</span>}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => router.push(`${editBaseHref}/${item.id}/edit`)}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => runAction(item.id, "publish")}>
                      Publish
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => runAction(item.id, "archive")}>
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => runAction(item.id, "delete")}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
