"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import {
  Info,
  DollarSign,
  ImageIcon,
  FileText,
  ListChecks,
  LayoutGrid,
  Search,
  Tag,
  Sparkles,
  Eye,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Settings2,
} from "lucide-react";
export { StudioTabPanel } from "@/components/ui/studio-tabs";

import { StudioTabList, type StudioTabItem } from "@/components/ui/studio-tabs";
import { Button } from "@/components/ui/button";
import type { SaveState } from "../hooks/use-autosave";
import type { HealthScoreResult } from "../types/studio-types";
import { StudioRightSidebar } from "./sidebar/studio-right-sidebar";

/* ─────────────────────────────────────────────────────────────────────────────
   Tab Definitions (shared between create + edit pages)
   ───────────────────────────────────────────────────────────────────────────── */

export const STUDIO_TABS: StudioTabItem[] = [
  { value: "basic", label: "Basic", icon: <Info className="h-4 w-4" /> },
  { value: "pricing", label: "Pricing", icon: <DollarSign className="h-4 w-4" /> },
  { value: "images", label: "Images", icon: <ImageIcon className="h-4 w-4" /> },
  { value: "description", label: "Description", icon: <FileText className="h-4 w-4" /> },
  { value: "specs", label: "Specifications", icon: <ListChecks className="h-4 w-4" /> },
  { value: "variants", label: "Variants", icon: <LayoutGrid className="h-4 w-4" /> },
  { value: "seo", label: "SEO", icon: <Search className="h-4 w-4" /> },
  { value: "marketing", label: "Marketing", icon: <Tag className="h-4 w-4" /> },
  { value: "advanced", label: "Advanced", icon: <Sparkles className="h-4 w-4" /> },
  { value: "preview", label: "Preview", icon: <Eye className="h-4 w-4" /> },
];

/** Tab indices for the mobile stepper (preview excluded) */
export const MOBILE_STEPS = STUDIO_TABS.filter((t) => t.value !== "preview");

export const MOBILE_STEP_LABELS = MOBILE_STEPS.map((t) => t.label);

/* ─────────────────────────────────────────────────────────────────────────────
   Props
   ───────────────────────────────────────────────────────────────────────────── */

export interface NewStudioLayoutProps {
  /* External state */
  status: string;
  visibility: string;
  onVisibilityChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onSave: () => void;
  onPublish: () => void;
  onPreview: () => void;
  saving: boolean;
  saveState: SaveState;
  productName: string;
  productSku: string;
  healthResult?: HealthScoreResult;
  sections: { id: string; label: string }[];
  activeSection: string;
  onSectionClick: (id: string) => void;

  /** Children grouped by tab value */
  children: React.ReactNode;

  /** Optional side-wide alert banner (draft recovery, validation errors) */
  alert?: React.ReactNode;

  /** Parser bar rendered above the tabs */
  parserBar?: React.ReactNode;

  /** URL import bar rendered above the parser bar */
  urlImportBar?: React.ReactNode;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Context for nested components to access tab state
   ───────────────────────────────────────────────────────────────────────────── */

export interface StudioLayoutContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const StudioLayoutCtx = React.createContext<StudioLayoutContextValue>({
  activeTab: "basic",
  setActiveTab: () => {},
});

export function useStudioLayout(): StudioLayoutContextValue {
  return React.useContext(StudioLayoutCtx);
}

/* ─────────────────────────────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────────────────────────────── */

export function NewStudioLayout({
  status,
  visibility,
  onVisibilityChange,
  onStatusChange,
  onSave,
  onPublish,
  onPreview,
  saving,
  saveState,
  productName,
  productSku,
  healthResult,
  sections,
  activeSection,
  onSectionClick,
  children,
  alert,
  parserBar,
  urlImportBar,
}: NewStudioLayoutProps): React.ReactElement {
  const [activeTab, setActiveTab] = React.useState("basic");
  const [mobileSettingsOpen, setMobileSettingsOpen] = React.useState(false);

  /**
   * The mobile stepper and the desktop tab bar are two views of one selection, so the
   * step index is derived from `activeTab` rather than tracked separately. Both chromes
   * render at every width and are shown/hidden with CSS breakpoints — the previous
   * `window.innerWidth` switch flashed the desktop bar on mobile before hydration and
   * re-rendered the whole studio on every resize event.
   */
  const mobileStep = Math.max(
    0,
    MOBILE_STEPS.findIndex((t) => t.value === activeTab),
  );

  const handleTabChange = React.useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  const handleMobileStep = React.useCallback((step: number) => {
    if (step < 0 || step >= MOBILE_STEPS.length) return;
    setActiveTab(MOBILE_STEPS[step].value);
  }, []);

  const showSidebar = activeTab !== "preview";

  const ctxValue = React.useMemo<StudioLayoutContextValue>(
    () => ({ activeTab, setActiveTab: handleTabChange }),
    [activeTab, handleTabChange],
  );

  const activePanel = React.Children.toArray(children).find((child) => {
    if (!React.isValidElement(child)) return false;
    return (child.props as { value?: string }).value === activeTab;
  });

  return (
    <StudioLayoutCtx.Provider value={ctxValue}>
      <div
        data-layout="studio"
        className={cn("min-h-screen flex flex-col", "bg-background text-foreground")}
      >
        {/* ── URL Import Bar ── */}
        {urlImportBar ? (
          <div className="mx-auto w-full max-w-[94rem] px-3 sm:px-6 lg:px-8 pt-4">
            {urlImportBar}
          </div>
        ) : null}

        {/* ── Parser Bar ── */}
        {parserBar ? (
          <div className="mx-auto w-full max-w-[94rem] px-3 sm:px-6 lg:px-8 pt-2">{parserBar}</div>
        ) : null}

        {/* ── Desktop Tab Bar (navigation only — panels render once in <main>) ── */}
        <div className="hidden md:block sticky top-0 z-30 border-b border-border bg-card shadow-2xs">
          <div className="mx-auto w-full max-w-[94rem] px-3 sm:px-6">
            <StudioTabList
              tabs={STUDIO_TABS}
              variant="enclosed"
              scrollable
              label="Product studio sections"
              value={activeTab}
              onValueChange={handleTabChange}
            />
          </div>
        </div>

        {/* ── Mobile Stepper ── */}
        <div className="md:hidden sticky top-0 z-30 border-b border-border bg-card px-3 py-2.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleMobileStep(mobileStep - 1)}
              disabled={mobileStep === 0}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground disabled:opacity-30 disabled:pointer-events-none hover:text-foreground min-h-10 px-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Prev</span>
            </button>

            <div className="flex items-center gap-1.5" role="tablist" aria-label="Studio steps">
              {MOBILE_STEPS.map((step, i) => (
                <button
                  key={step.value}
                  type="button"
                  role="tab"
                  aria-selected={i === mobileStep}
                  onClick={() => handleMobileStep(i)}
                  // 8px dot inside a 40px hit area — the dot alone was far below the
                  // 44px minimum touch target.
                  className="grid h-10 w-5 place-items-center"
                  aria-label={`${step.label} (step ${i + 1} of ${MOBILE_STEPS.length})`}
                >
                  <span
                    className={cn(
                      "block h-2 rounded-full transition-all duration-200",
                      i === mobileStep
                        ? "bg-amber-500 w-5"
                        : i < mobileStep
                          ? "bg-amber-500/50 w-2"
                          : "bg-muted-foreground/20 w-2",
                    )}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleMobileStep(mobileStep + 1)}
              disabled={mobileStep >= MOBILE_STEPS.length - 1}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground disabled:opacity-30 disabled:pointer-events-none hover:text-foreground min-h-10 px-1"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Step label */}
          <p className="text-center text-[11px] font-bold text-muted-foreground mt-1.5">
            {mobileStep + 1} / {MOBILE_STEPS.length} &mdash; {MOBILE_STEP_LABELS[mobileStep]}
          </p>
        </div>

        {/* ── Alert Banner ── */}
        {alert && (
          <div className="mx-auto w-full max-w-[94rem] px-3 sm:px-6 lg:px-8 py-3">{alert}</div>
        )}

        {/* ── Main Content ── */}
        <div
          className={cn(
            "flex-1 mx-auto w-full max-w-[94rem]",
            "px-3 sm:px-6 lg:px-8 py-4 sm:py-5",
            "pb-28 md:pb-5" /* clearance for the mobile action bar */,
            showSidebar && "lg:flex lg:gap-6",
          )}
        >
          {/* Panels render exactly once, here. */}
          <main className={cn("min-w-0", showSidebar ? "w-full lg:w-[72%]" : "w-full")}>
            <div key={activeTab} className="animate-fade-in">
              {activePanel}
            </div>
          </main>

          {/* Right Sidebar (desktop only, hidden on preview tab) */}
          {showSidebar && (
            <aside className="hidden lg:block w-[28%] shrink-0">
              <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto ws-scroll space-y-4 pr-0.5">
                <StudioRightSidebar
                  status={status}
                  visibility={visibility}
                  onVisibilityChange={onVisibilityChange}
                  onStatusChange={onStatusChange}
                  onPublish={onPublish}
                  onSave={onSave}
                  onPreview={onPreview}
                  saving={saving}
                  saveState={saveState}
                  productName={productName}
                  productSku={productSku}
                  healthResult={healthResult}
                  sections={sections}
                  activeSection={activeSection}
                  onSectionClick={onSectionClick}
                />
              </div>
            </aside>
          )}
        </div>

        {/* ── Mobile Settings Drawer ── */}
        {mobileSettingsOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
            <button
              type="button"
              aria-label="Close settings"
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileSettingsOpen(false)}
            />
            <div className="relative ml-auto w-80 max-w-[85vw] h-full bg-card shadow-xl overflow-y-auto p-5 space-y-4 animate-slide-in-right">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold">Settings</h3>
                <button
                  type="button"
                  onClick={() => setMobileSettingsOpen(false)}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground min-h-10 px-2"
                >
                  Close
                </button>
              </div>
              <StudioRightSidebar
                status={status}
                visibility={visibility}
                onVisibilityChange={onVisibilityChange}
                onStatusChange={onStatusChange}
                onPublish={onPublish}
                onSave={onSave}
                onPreview={onPreview}
                saving={saving}
                saveState={saveState}
                productName={productName}
                productSku={productSku}
                healthResult={healthResult}
                sections={sections}
                activeSection={activeSection}
                onSectionClick={onSectionClick}
              />
            </div>
          </div>
        )}

        {/* ── Mobile Bottom Save Bar ── */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl">
          <div className="flex items-center justify-between gap-1.5 max-w-lg mx-auto">
            <Button
              variant="ghost"
              size="sm"
              className="h-11 px-2.5 text-xs font-semibold text-muted-foreground"
              onClick={() => setMobileSettingsOpen(true)}
            >
              <Settings2 className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-11 gap-1.5 text-xs font-semibold flex-1"
              onClick={onSave}
              disabled={saving}
            >
              <Save className="h-4 w-4 text-amber-500" />
              Save Draft
            </Button>

            <Button
              size="sm"
              className="h-11 gap-1.5 text-xs font-extrabold shadow-xs bg-amber-500 hover:bg-amber-600 text-amber-950 flex-1"
              onClick={onPublish}
              disabled={saving}
            >
              <Send className="h-4 w-4" />
              {status === "active" ? "Changes" : "Publish"}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-11 px-2.5 text-xs font-semibold text-muted-foreground"
              onClick={() => handleMobileStep(mobileStep + 1)}
              disabled={mobileStep >= MOBILE_STEPS.length - 1}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </StudioLayoutCtx.Provider>
  );
}

export default NewStudioLayout;
