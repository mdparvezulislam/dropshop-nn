"use client";

import * as React from "react";
import { useDebounce } from "@/hooks/use-debounce";

export type SaveState = "idle" | "saving" | "saved" | "error" | "unsaved";

export interface AutosaveOptions {
  delay?: number;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  onSave: () => Promise<unknown>;
  enabled?: boolean;
}

export function useAutosave({ delay = 2000, onSave, enabled = true }: AutosaveOptions): {
  saveState: SaveState;
  triggerSave: () => void;
  setSaveState: React.Dispatch<React.SetStateAction<SaveState>>;
  isDirty: boolean;
  markClean: () => void;
} {
  const [saveState, setSaveState] = React.useState<SaveState>("idle");
  const [dirty, setDirty] = React.useState(false);
  const [revision, setRevision] = React.useState(0);

  const debouncedRevision = useDebounce(revision, delay);

  const triggerSave = React.useCallback(() => {
    setDirty(true);
    setRevision((r) => r + 1);
  }, []);

  const markClean = React.useCallback(() => {
    setDirty(false);
    setSaveState("idle");
  }, []);

  React.useEffect(() => {
    if (!enabled || !dirty || debouncedRevision === 0) return;

    let cancelled = false;

    const run = async () => {
      setSaveState("saving");
      try {
        await onSave();
        if (!cancelled) {
          setSaveState("saved");
          setDirty(false);
        }
      } catch {
        if (!cancelled) {
          setSaveState("error");
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [debouncedRevision, enabled, dirty, onSave]);

  return { saveState, triggerSave, setSaveState, isDirty: dirty, markClean };
}
