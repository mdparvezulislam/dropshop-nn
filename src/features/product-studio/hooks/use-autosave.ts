"use client";

import * as React from "react";
import { useDebounce } from "@/hooks/use-debounce";

export type SaveState = "idle" | "saving" | "saved" | "error";

export interface AutosaveOptions {
  delay?: number;
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

  /**
   * `onSave` is re-created by callers on every form keystroke. Keeping it in the
   * effect dependency list would re-run the effect (and fire a save) on every
   * render while dirty, defeating the debounce entirely. The ref keeps the
   * latest callback reachable without making it a trigger.
   */
  const onSaveRef = React.useRef(onSave);
  React.useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  /** Revision already committed to the server — guards against re-saving the same state. */
  const savedRevisionRef = React.useRef(0);
  /** Prevents overlapping in-flight saves (which can duplicate a not-yet-created product). */
  const inFlightRef = React.useRef(false);

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
    if (debouncedRevision === savedRevisionRef.current) return;
    if (inFlightRef.current) return;

    let cancelled = false;
    inFlightRef.current = true;
    savedRevisionRef.current = debouncedRevision;

    const run = async () => {
      setSaveState("saving");
      try {
        await onSaveRef.current();
        if (!cancelled) {
          setSaveState("saved");
          setDirty(false);
        }
      } catch {
        if (!cancelled) {
          setSaveState("error");
        }
      } finally {
        inFlightRef.current = false;
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [debouncedRevision, enabled, dirty]);

  return { saveState, triggerSave, setSaveState, isDirty: dirty, markClean };
}
