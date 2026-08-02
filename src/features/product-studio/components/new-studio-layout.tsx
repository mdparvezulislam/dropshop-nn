"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import {
  Info,
  DollarSign,
  ImageIcon,
  Search,
  Sparkles,
  Eye,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Settings2,
  LayoutGrid,
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
  { value: "basic", label: "Product Details", icon: <Info className="h-4 w-4" /> },
  { value: "pricing", label: "Pricing & Stock", icon: <DollarSign className="h-4 w-4" /> },
  { value: "media", label: "Media & Video Studio", icon: <ImageIcon className="h-4 w-4" /> },
  { value: "variants", label: "Variant Studio Matrix", icon: <LayoutGrid className="h-4 w-4" /> },
  { value: "seo", label: "SEO & Publishing", icon: <Search className="h-4 w-4" /> },
  { value: "preview", label: "Live Preview", icon: <Eye className="h-4 w-4" /> },
];

/** Tab indices for the mobile stepper (preview excluded) */
export const MOBILE_STEPS = STUDIO_TABS.filter((t) => t.value !== "preview");
export const MOBILE_STEP_LABELS = MOBILE_STEPS.map((t) => t.label);

/* ─────────────────────────────────────────────────────────────────────────────
   Props
   ───────────────────────────────────────────────────────────────────────────── */

export interface NewStudioLayoutProps {
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
  children: React.ReactNode;
  alert?: React.ReactNode;
  parserBar?: React.ReactNode;
  urlImportBar?: React.ReactNode;
}

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
        className={cn("min-h-screen flex flex-col bg-background text-foreground")}
      >
        {/* ── URL Import Bar ── */}
        {urlImportBar ? (
          <div className="mx-auto w-full max-w-[94rem] px-3 sm:px-6 lg:px-8 pt-3">
            {urlImportBar}
          </div>
        ) : null}

        {/* ── Parser Bar ── */}
        {parserBar ? (
          <div className="mx-auto w-full max-w-[94rem] px-3 sm:px-6 lg:px-8 pt-2">{parserBar}</div>
        ) : null}

        {/* ── Desktop Tab Bar ── */}
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

        {/* ── Mobile Mobile-App Navigation Header ── */}
        <div className="md:hidden sticky top-0 z-30 border-b border-border/80 bg-card/95 backdrop-blur-md px-3 py-2 space-y-2 shadow-2xs">
          {/* Top Step Pill & Stepper Buttons */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleMobileStep(mobileStep - 1)}
              disabled={mobileStep === 0}
              className="flex items-center gap-1 text-xs font-bold text-muted-foreground disabled:opacity-30 disabled:pointer-events-none hover:text-foreground h-8 px-2 rounded-lg hover:bg-muted transition-colors active:scale-95 touch-manipulation"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-full border border-border/60">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[11px] font-extrabold text-foreground tracking-tight">
                Step {mobileStep + 1} of {MOBILE_STEPS.length}: {MOBILE_STEP_LABELS[mobileStep]}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleMobileStep(mobileStep + 1)}
              disabled={mobileStep >= MOBILE_STEPS.length - 1}
              className="flex items-center gap-1 text-xs font-bold text-primary disabled:opacity-30 disabled:pointer-events-none hover:text-primary/80 h-8 px-2 rounded-lg hover:bg-primary/10 transition-colors active:scale-95 touch-manipulation"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Swipeable Mobile Tab Pills */}
          <div className="flex items-center overflow-x-auto scrollbar-none gap-1.5 pb-0.5">
            {STUDIO_TABS.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleTabChange(tab.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all touch-manipulation active:scale-95",
                    isActive
                      ? "bg-amber-500 text-amber-950 shadow-xs"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <span className="shrink-0">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Alert Banner ── */}
        {alert && (
          <div className="mx-auto w-full max-w-[94rem] px-3 sm:px-6 lg:px-8 py-2.5">{alert}</div>
        )}

        {/* ── Main Content ── */}
        <div
          className={cn(
            "flex-1 mx-auto w-full max-w-[94rem]",
            "px-3 sm:px-6 lg:px-8 py-3 sm:py-5",
            "pb-24 md:pb-5",
            showSidebar && "lg:flex lg:gap-6",
          )}
        >
          <main className={cn("min-w-0", showSidebar ? "w-full lg:w-[72%]" : "w-full")}>
            <div key={activeTab} className="animate-fade-in">
              {activePanel}
            </div>
          </main>

          {/* Right Sidebar (desktop only) */}
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
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileSettingsOpen(false)}
            />
            <div className="relative ml-auto w-80 max-w-[85vw] h-full bg-card shadow-2xl overflow-y-auto p-4 space-y-4 animate-slide-in-right">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-sm font-black text-foreground">Publishing & Status</h3>
                <button
                  type="button"
                  onClick={() => setMobileSettingsOpen(false)}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground px-2 py-1 rounded-md"
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

        {/* ── Mobile Bottom Floating Bar (App Style) ── */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border/80 bg-card/95 backdrop-blur-md px-3 py-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.15)]">
          <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0 rounded-xl border-border text-muted-foreground shrink-0 active:scale-95"
              onClick={() => setMobileSettingsOpen(true)}
              title="Settings"
            >
              <Settings2 className="h-4.5 w-4.5" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-10 gap-1 text-xs font-bold flex-1 rounded-xl border-border active:scale-95"
              onClick={onSave}
              disabled={saving}
            >
              <Save className="h-3.5 w-3.5 text-amber-500" />
              Save Draft
            </Button>

            <Button
              size="sm"
              className="h-10 gap-1.5 text-xs font-extrabold shadow-xs bg-amber-500 hover:bg-amber-600 text-amber-950 flex-1 rounded-xl active:scale-95"
              onClick={onPublish}
              disabled={saving}
            >
              <Send className="h-3.5 w-3.5" />
              {status === "active" ? "Save Changes" : "Publish"}
            </Button>
          </div>
        </div>
      </div>
    </StudioLayoutCtx.Provider>
  );
}

export default NewStudioLayout;
