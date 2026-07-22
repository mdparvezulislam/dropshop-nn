"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Keyboard, Command } from "lucide-react";

export interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps): React.ReactElement {
  const shortcuts = [
    { key: "CTRL + S / CMD + S", label: "Save Product Draft" },
    { key: "CTRL + P / CMD + P", label: "Publish Product" },
    { key: "CTRL + D / CMD + D", label: "Duplicate Product" },
    { key: "ESC", label: "Cancel / Close Modals" },
    { key: "?", label: "Open Keyboard Shortcuts" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border border-border bg-card shadow-2xl rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <Keyboard className="h-4 w-4 text-primary" /> Product Studio Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2.5 pt-3">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/30">
              <span className="text-xs font-semibold text-foreground">{s.label}</span>
              <kbd className="inline-flex items-center gap-1 rounded border border-border bg-card px-2 py-1 font-mono text-[10px] font-bold text-muted-foreground shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
