"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Save, Send, Archive } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import {
  createContentAction,
  updateContentAction,
  publishContentAction,
  archiveContentAction,
} from "../actions/content-actions";
import type { CmsContent, ContentType } from "../domain/content-entity";
import { generateSlug } from "@/shared/utils/slug-utils";

const RichTextEditor = dynamic(
  () =>
    import("@/shared/components/editor/rich-text-editor").then((m) => ({
      default: m.RichTextEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 animate-pulse rounded-lg bg-muted" aria-label="Loading editor" />
    ),
  },
);

interface ContentEditorProps {
  type: ContentType;
  initial?: CmsContent | null;
  backHref: string;
}

export function ContentEditor({ type, initial, backHref }: ContentEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [bodyHtml, setBodyHtml] = useState(initial?.bodyHtml ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [metaTitle, setMetaTitle] = useState(initial?.seo?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.seo?.metaDescription ?? "");
  const [ogImage, setOgImage] = useState(initial?.seo?.ogImage ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncSlug = (value: string) => {
    setTitle(value);
    if (!initial) setSlug(generateSlug(value));
  };

  const buildPayload = () => ({
    type,
    title,
    slug: slug || generateSlug(title),
    excerpt,
    bodyHtml,
    coverImage,
    category,
    tags: tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    seo: {
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      ogImage: ogImage || coverImage,
      ogTitle: metaTitle || title,
      ogDescription: metaDescription || excerpt,
    },
    blocks: initial?.blocks ?? [],
  });

  const handleSave = async (publish = false) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const payload = buildPayload();
      let id = initial?.id;

      if (initial?.id) {
        const res = await updateContentAction({ id: initial.id, ...payload });
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createContentAction({ ...payload, status: "draft" });
        if (!res.success) throw new Error(res.error);
        id = (res.data as { id: string })?.id;
      }

      if (publish && id) {
        const pub = await publishContentAction({ id });
        if (!pub.success) throw new Error(pub.error);
        setMessage("Published successfully.");
      } else {
        setMessage("Saved as draft.");
      }

      if (!initial && id) {
        router.replace(`${backHref}/${id}/edit`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!initial?.id) return;
    setLoading(true);
    const res = await archiveContentAction(initial.id);
    setLoading(false);
    if (res.success) {
      setMessage("Archived.");
      router.refresh();
    } else {
      setError(res.error ?? "Archive failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {initial ? "Edit content" : "New content"}
          </h1>
          <p className="text-sm text-muted-foreground capitalize">{type.replace("_", " ")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {initial?.id && (
            <Button variant="outline" size="sm" onClick={handleArchive} disabled={loading}>
              <Archive className="h-3.5 w-3.5" />
              Archive
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => handleSave(false)} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save draft
          </Button>
          <Button size="sm" onClick={() => handleSave(true)} disabled={loading}>
            <Send className="h-3.5 w-3.5" />
            Publish
          </Button>
        </div>
      </div>

      {(message || error) && (
        <p className={`text-sm ${error ? "text-rose-600" : "text-emerald-600"}`}>
          {error ?? message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => syncSlug(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Input
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Short summary"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Body</Label>
                <RichTextEditor value={bodyHtml} onChange={setBodyHtml} minHeight="280px" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Media & taxonomy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="cover">Cover image URL</Label>
                <Input
                  id="cover"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="metaTitle">Meta title</Label>
                <Input
                  id="metaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  maxLength={70}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="metaDesc">Meta description</Label>
                <Input
                  id="metaDesc"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  maxLength={160}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="og">OG image URL</Label>
                <Input id="og" value={ogImage} onChange={(e) => setOgImage(e.target.value)} />
              </div>
              <Separator />
              <p className="text-[11px] text-muted-foreground">
                Canonical, robots, Twitter cards, and JSON-LD are stored on publish and ready for public
                pages.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
