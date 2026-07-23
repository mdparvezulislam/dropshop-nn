"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface ShareButtonsProps {
  title: string;
  slug: string;
  className?: string;
  sticky?: boolean;
}

export function ShareButtons({
  title,
  slug,
  className,
  sticky = false,
}: ShareButtonsProps): React.ReactElement {
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/blog/${slug}`
      : `https://dropshopnn.com/blog/${slug}`;

  const share = async (network?: "twitter" | "facebook" | "linkedin"): Promise<void> => {
    if (!network && typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title, url });
      return;
    }
    const encoded = encodeURIComponent(url);
    const text = encodeURIComponent(title);
    const href =
      network === "twitter"
        ? `https://twitter.com/intent/tweet?url=${encoded}&text=${text}`
        : network === "facebook"
          ? `https://www.facebook.com/sharer/sharer.php?u=${encoded}`
          : network === "linkedin"
            ? `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`
            : url;
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  const copyLink = async (): Promise<void> => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1.5",
        sticky && "lg:sticky lg:top-28 lg:flex-col",
        className,
      )}
    >
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Share"
        onClick={() => share()}
      >
        <Share2 className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 px-2 text-[11px]"
        aria-label="Share on X"
        onClick={() => share("twitter")}
      >
        X
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 px-2 text-[11px]"
        aria-label="Share on Facebook"
        onClick={() => share("facebook")}
      >
        f
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 px-2 text-[11px]"
        aria-label="Share on LinkedIn"
        onClick={() => share("linkedin")}
      >
        in
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Copy link"
        onClick={copyLink}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Link2 className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}
