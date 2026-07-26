"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Cloud,
  CloudOff,
  CheckCircle2,
  Copy,
  Eye,
  Send,
  Save,
  Keyboard,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SaveState } from "../hooks/use-autosave";
import { KeyboardShortcutsModal } from "./modals/keyboard-shortcuts-modal";

export interface StudioHeaderProps {
  productName: string;
  onNameChange?: (name: string) => void;
  status: string;
  saveState: SaveState;
  saving: boolean;
  lastSavedAt?: Date | null;
  onSave: () => void;
  onPublish: () => void;
  onDuplicate?: () => void;
  onPreview: () => void;
  isEditing?: boolean;
}

export function StudioHeader({
  productName,
  status,
  saveState,
  saving,
  lastSavedAt,
  onSave,
  onPublish,
  onDuplicate,
  onPreview,
  isEditing = false,
}: StudioHeaderProps): React.ReactElement {
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);

  // Global Keyboard listener for studio
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSave();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        onPublish();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d" && onDuplicate) {
        e.preventDefault();
        onDuplicate();
      } else if (
        e.key === "?" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSave, onPublish, onDuplicate]);

  const saveBadgeIcon =
    saveState === "saving" ? (
      <Cloud className="h-3.5 w-3.5 text-warning animate-pulse" />
    ) : saveState === "saved" ? (
      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
    ) : saveState === "error" ? (
      <CloudOff className="h-3.5 w-3.5 text-destructive" />
    ) : (
      <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
    );

  const saveLabel =
    saveState === "saving"
      ? "Saving Changes…"
      : saveState === "saved"
        ? "Autosaved to Cloud"
        : saveState === "error"
          ? "Save Failed"
          : "Unsaved Changes";

  const timeLabel = lastSavedAt
    ? `Last saved ${lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : "";

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-6 py-3 gap-2 sm:gap-3 bg-card/95 backdrop-blur-md">
        {/* Left: Back Link & Product Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <Link
            href="/dashboard/products"
            className="inline-flex h-9 sm:h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-all shadow-2xs"
            title="Back to products"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h1 className="text-sm sm:text-lg font-extrabold tracking-tight text-foreground truncate max-w-[160px] xs:max-w-[200px] sm:max-w-none">
                {productName.trim() || "Untitled Product"}
              </h1>
              <Badge
                variant="secondary"
                size="xs"
                className="gap-1 font-bold whitespace-nowrap shrink-0"
              >
                <Sparkles className="h-3 w-3 text-primary" />{" "}
                <span className="hidden sm:inline">
                  {isEditing ? "Edit Mode" : "Product Studio"}
                </span>
                <span className="sm:hidden">{isEditing ? "Edit" : "Studio"}</span>
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-semibold text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1 truncate">
                {saveBadgeIcon} <span className="truncate">{saveLabel}</span>
              </span>
              {timeLabel ? (
                <>
                  <span className="shrink-0">•</span>
                  <span className="hidden sm:inline truncate">{timeLabel}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right: Actions & Shortcuts */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 overflow-x-auto ws-scroll pb-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShortcutsOpen(true)}
            title="Keyboard Shortcuts (?)"
            className="text-muted-foreground hover:text-foreground hidden sm:inline-flex"
          >
            <Keyboard className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-semibold shadow-2xs h-9 sm:h-9 max-sm:h-10"
            onClick={onPreview}
          >
            <Eye className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Preview</span>
          </Button>

          {onDuplicate ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold shadow-2xs hidden lg:inline-flex"
              onClick={onDuplicate}
            >
              <Copy className="h-3.5 w-3.5 text-muted-foreground" /> Duplicate
            </Button>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-semibold shadow-2xs h-9 sm:h-9 max-sm:h-10"
            onClick={onSave}
            disabled={saving}
          >
            <Save className="h-3.5 w-3.5 text-primary" />{" "}
            <span className="hidden sm:inline">Save Draft</span>
            <span className="sm:hidden">Save</span>
          </Button>

          <Button
            size="sm"
            className="gap-1.5 text-xs font-extrabold shadow-xs bg-amber-500 hover:bg-amber-600 text-slate-950 h-9 sm:h-9 max-sm:h-10 shrink-0"
            onClick={onPublish}
            disabled={saving}
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {status === "active" ? "Publish Changes" : "Publish"}
            </span>
            <span className="sm:hidden">{status === "active" ? "Changes" : "Pub."}</span>
          </Button>
        </div>
      </div>

      <KeyboardShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </>
  );
}
