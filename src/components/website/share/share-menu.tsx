"use client";

import * as React from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { SITE_URL } from "@/config/site";

/**
 * Product sharing.
 *
 * Native share sheet first (the right affordance on mobile, where most of the
 * traffic is); everything else falls back to an accessible dropdown of real
 * share endpoints. Every target receives an ABSOLUTE, encoded URL built from
 * SITE_URL — never `window.location`, which would leak preview/localhost hosts
 * into shared links.
 */

export interface ShareMenuProps {
  /** Site-relative path (e.g. "/product/foo") or a full absolute URL. */
  path: string;
  title: string;
  /** Optional blurb passed to the native sheet and messaging apps. */
  text?: string;
  /** "pill" = labelled bar button (PDP); "icon" = icon-only. */
  variant?: "pill" | "icon";
  className?: string;
}

export function buildShareUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = SITE_URL.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Clipboard API when granted, execCommand when not, plain reveal as last resort. */
async function copyText(value: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Blocked/insecure context — fall through to the legacy path.
  }

  try {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.top = "-1000px";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    field.setSelectionRange(0, value.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(field);
    return ok;
  } catch {
    return false;
  }
}

function isMobileLike(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(pointer: coarse)").matches) return true;
  return /android|iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

// ── Brand glyphs (inline so the CSP-safe bundle stays dependency-free) ──
function FacebookGlyph(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden focusable="false">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
    </svg>
  );
}

function MessengerGlyph(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden focusable="false">
      <path d="M12 0C5.37 0 0 4.97 0 11.11c0 3.5 1.74 6.61 4.47 8.65V24l4.09-2.25c1.09.3 2.24.47 3.44.47 6.63 0 12-4.97 12-11.11S18.63 0 12 0Zm1.19 14.96-3.06-3.26-5.97 3.26 6.56-6.97 3.13 3.26 5.9-3.26-6.56 6.97Z" />
    </svg>
  );
}

function WhatsappGlyph(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden focusable="false">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.28.17-1.41-.07-.12-.27-.2-.57-.35ZM12.05 21.8h-.01a9.8 9.8 0 0 1-4.99-1.37l-.36-.21-3.71.97.99-3.62-.23-.37a9.79 9.79 0 0 1-1.5-5.23c0-5.41 4.4-9.81 9.82-9.81 2.62 0 5.08 1.02 6.93 2.88a9.74 9.74 0 0 1 2.87 6.94c0 5.41-4.4 9.82-9.81 9.82ZM20.52 3.45A11.7 11.7 0 0 0 12.05 0C5.5 0 .17 5.33.17 11.88c0 2.09.55 4.14 1.59 5.94L.07 24l6.33-1.66a11.86 11.86 0 0 0 5.65 1.44h.01c6.54 0 11.87-5.33 11.88-11.88a11.8 11.8 0 0 0-3.42-8.45Z" />
    </svg>
  );
}

function TelegramGlyph(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden focusable="false">
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42Z" />
    </svg>
  );
}

interface ShareTarget {
  id: string;
  label: string;
  icon: React.ReactElement;
  /** Brand tint for the icon only — the row itself stays neutral. */
  tone: string;
  href: (url: string, title: string, text?: string) => string;
  /** Deep links must replace the location instead of opening a popup. */
  deepLink?: boolean;
}

const TARGETS: ShareTarget[] = [
  {
    id: "facebook",
    label: "ফেসবুক",
    icon: <FacebookGlyph />,
    tone: "text-[#1877F2]",
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "messenger",
    label: "মেসেঞ্জার",
    icon: <MessengerGlyph />,
    tone: "text-[#0084FF]",
    href: (url) => `fb-messenger://share/?link=${encodeURIComponent(url)}`,
    deepLink: true,
  },
  {
    id: "whatsapp",
    label: "হোয়াটসঅ্যাপ",
    icon: <WhatsappGlyph />,
    tone: "text-[#25D366]",
    href: (url, title) => `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
  },
  {
    id: "telegram",
    label: "টেলিগ্রাম",
    icon: <TelegramGlyph />,
    tone: "text-[#229ED9]",
    href: (url, title) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
];

export function ShareMenu({
  path,
  title,
  text,
  variant = "pill",
  className,
}: ShareMenuProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  /** Set when neither clipboard path worked — the URL is revealed to copy by hand. */
  const [manualUrl, setManualUrl] = React.useState<string | null>(null);

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const manualRef = React.useRef<HTMLInputElement>(null);
  const menuId = React.useId();

  const shareUrl = React.useMemo(() => buildShareUrl(path), [path]);

  const closeAndRestoreFocus = React.useCallback((): void => {
    setOpen(false);
    setManualUrl(null);
    triggerRef.current?.focus();
  }, []);

  // Escape closes and returns focus; an outside pointer just closes.
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeAndRestoreFocus();
      }
    };
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
      setManualUrl(null);
    };

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, closeAndRestoreFocus]);

  // Move focus into the menu so keyboard users land somewhere useful.
  React.useEffect(() => {
    if (!open) return;
    const first = menuRef.current?.querySelector<HTMLElement>("[data-share-item]");
    first?.focus();
  }, [open]);

  React.useEffect(() => {
    if (manualUrl && manualRef.current) {
      manualRef.current.focus();
      manualRef.current.select();
    }
  }, [manualUrl]);

  const moveFocus = (from: HTMLElement, direction: 1 | -1): void => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>("[data-share-item]") ?? [],
    );
    if (items.length === 0) return;
    const index = items.indexOf(from);
    const next = items[(index + direction + items.length) % items.length];
    next?.focus();
  };

  const onMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    const active = event.target as HTMLElement;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveFocus(active, 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(active, -1);
    } else if (event.key === "Tab") {
      // A menu is a single stop — tabbing out dismisses it.
      setOpen(false);
      setManualUrl(null);
    }
  };

  /** `silent` suppresses the toast when the copy is a side effect of another action. */
  const handleCopy = React.useCallback(
    async (silent = false): Promise<boolean> => {
      const ok = await copyText(shareUrl);
      if (ok) {
        setCopied(true);
        setManualUrl(null);
        if (!silent) toast.success("কপি হয়েছে");
        window.setTimeout(() => setCopied(false), 2000);
        return true;
      }
      // No clipboard access at all — show the link so it can be copied manually.
      setManualUrl(shareUrl);
      if (!silent) toast.error("অটো-কপি সম্ভব হয়নি — লিংকটি নিচে থেকে কপি করুন");
      return false;
    },
    [shareUrl],
  );

  const openTarget = React.useCallback(
    (target: ShareTarget): void => {
      const href = target.href(shareUrl, title, text);

      if (target.deepLink) {
        // Messenger has no app-id-free web share dialog; the deep link works
        // where the app exists, and desktop users get the link instead.
        if (isMobileLike()) {
          window.location.href = href;
          setOpen(false);
        } else {
          void handleCopy(true).then((copied) => {
            toast.info(
              copied
                ? "মেসেঞ্জার শেয়ার মোবাইল অ্যাপে কাজ করে — লিংক কপি হয়েছে, পাঠিয়ে দিন"
                : "মেসেঞ্জার শেয়ার মোবাইল অ্যাপে কাজ করে — নিচের লিংকটি কপি করে পাঠান",
            );
          });
        }
        return;
      }

      window.open(href, "_blank", "noopener,noreferrer");
      setOpen(false);
    },
    [shareUrl, title, text, handleCopy],
  );

  const handleTrigger = React.useCallback(async (): Promise<void> => {
    if (open) {
      closeAndRestoreFocus();
      return;
    }

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch (error) {
        // A dismissed sheet is not a failure; anything else falls back to the menu.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    setOpen(true);
  }, [open, closeAndRestoreFocus, title, text, shareUrl]);

  const triggerClass =
    variant === "icon"
      ? "flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
      : "h-11 min-h-11 w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500";

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleTrigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`প্রোডাক্ট শেয়ার করুন: ${title}`}
        className={triggerClass}
      >
        <Share2 className="h-4 w-4" aria-hidden />
        {variant === "pill" && "শেয়ার"}
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="শেয়ার অপশন"
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 bottom-full z-50 mb-2 w-60 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            data-share-item
            onClick={() => void handleCopy()}
            className="w-full min-h-10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber-500"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600" aria-hidden />
            ) : (
              <Copy className="h-4 w-4 text-slate-500" aria-hidden />
            )}
            {copied ? "কপি হয়েছে" : "লিংক কপি করুন"}
          </button>

          {TARGETS.map((target) => (
            <button
              key={target.id}
              type="button"
              role="menuitem"
              data-share-item
              onClick={() => openTarget(target)}
              className="w-full min-h-10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber-500"
            >
              <span className={target.tone}>{target.icon}</span>
              {target.label}
            </button>
          ))}

          {manualUrl && (
            <div className="mt-1 border-t border-slate-200 px-3 pt-2 pb-1">
              <label
                htmlFor={`${menuId}-manual`}
                className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1"
              >
                লিংক
              </label>
              <input
                ref={manualRef}
                id={`${menuId}-manual`}
                readOnly
                value={manualUrl}
                onFocus={(event) => event.currentTarget.select()}
                className="w-full min-h-10 rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-[11px] font-medium text-slate-700 focus-visible:outline-2 focus-visible:outline-amber-500"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ShareMenu;
