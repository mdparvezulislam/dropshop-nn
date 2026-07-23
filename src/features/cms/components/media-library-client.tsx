"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ImageIcon, Link2, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  deleteMediaAssetAction,
  registerMediaAssetAction,
} from "@/features/cms/actions/media-actions";
import type { MediaAsset } from "@/features/cms/domain/media-entity";

interface MediaLibraryClientProps {
  initialItems: MediaAsset[];
  initialFolders: string[];
  totalCount: number;
}

export function MediaLibraryClient({
  initialItems,
  initialFolders,
  totalCount,
}: MediaLibraryClientProps): React.ReactElement {
  const [items, setItems] = useState(initialItems);
  const [folders] = useState(initialFolders);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [folder, setFolder] = useState("general");
  const [type, setType] = useState<"image" | "video" | "pdf" | "document" | "other">("image");

  const handleRegister = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    const res = await registerMediaAssetAction({
      name: name || "Untitled asset",
      url,
      type,
      altText,
      folder,
      tags: [],
    });
    setLoading(false);
    if (!res.success) {
      setError(res.error ?? "Failed to add media");
      return;
    }
    setItems((prev) => [res.data as MediaAsset, ...prev]);
    setOpen(false);
    setName("");
    setUrl("");
    setAltText("");
  };

  const handleDelete = async (id: string): Promise<void> => {
    const res = await deleteMediaAssetAction(id);
    if (res.success) setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const copyUrl = async (value: string): Promise<void> => {
    await navigator.clipboard.writeText(value);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Media Library</h1>
          <p className="text-sm text-muted-foreground">
            Centralized assets for CMS, blog, banners, and product content · {totalCount} items
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add asset
        </Button>
      </div>

      {folders.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {folders.map((f) => (
            <span
              key={f}
              className="rounded-full border border-border/50 px-2.5 py-0.5 text-[11px] text-muted-foreground"
            >
              {f}
            </span>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <ImageIcon className="mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No media assets yet.</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setOpen(true)}>
              Add first asset
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative aspect-square bg-muted">
                {item.type === "image" ? (
                  <Image src={item.url} alt={item.altText || item.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    {item.type}
                  </div>
                )}
              </div>
              <CardContent className="space-y-2 p-3">
                <p className="truncate text-xs font-medium">{item.name}</p>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Copy URL"
                    onClick={() => copyUrl(item.url)}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Delete"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Register media asset</DialogTitle>
            <DialogDescription className="text-xs">
              Paste an ImageKit or CDN URL. Upload auth is available via CMS media actions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="media-name">Name</Label>
              <Input id="media-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="media-url">URL</Label>
              <Input
                id="media-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="media-alt">Alt text</Label>
              <Input id="media-alt" value={altText} onChange={(e) => setAltText(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="media-folder">Folder</Label>
                <Input id="media-folder" value={folder} onChange={(e) => setFolder(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="media-type">Type</Label>
                <select
                  id="media-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as typeof type)}
                  className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="document">Document</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleRegister} disabled={loading || !url}>
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
