"use client";

import * as React from "react";
import { Search, ChevronDown, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ComboboxItem {
  id: string;
  label: string;
  subLabel?: string;
  value: string;
}

interface SearchableComboboxProps {
  label: string;
  placeholder: string;
  items: ComboboxItem[];
  value: string;
  onChange: (value: string, selectedItem?: ComboboxItem) => void;
  disabled?: boolean;
  loading?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  onSelectCallback?: () => void;
  className?: string;
  required?: boolean;
}

export const SearchableCombobox = React.forwardRef<HTMLInputElement, SearchableComboboxProps>(
  (
    {
      label,
      placeholder,
      items,
      value,
      onChange,
      disabled = false,
      loading = false,
      inputRef,
      onSelectCallback,
      className,
      required = false,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [highlightedIndex, setHighlightedIndex] = React.useState(0);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const listRef = React.useRef<HTMLDivElement>(null);

    // Selected Item Display Label
    const selectedItem = React.useMemo(() => {
      if (!value) return null;
      return items.find((i) => i.value.toLowerCase() === value.toLowerCase()) || null;
    }, [value, items]);

    const displayInputText = React.useMemo(() => {
      if (isOpen) return searchQuery;
      if (selectedItem) {
        return selectedItem.subLabel
          ? `${selectedItem.label} (${selectedItem.subLabel})`
          : selectedItem.label;
      }
      return value || "";
    }, [isOpen, searchQuery, selectedItem, value]);

    // Click outside listener
    React.useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          setSearchQuery("");
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter items based on searchQuery
    const filteredItems = React.useMemo(() => {
      if (!searchQuery.trim()) return items;
      const q = searchQuery.toLowerCase().trim();
      return items.filter(
        (i) => i.label.toLowerCase().includes(q) || (i.subLabel && i.subLabel.toLowerCase().includes(q)),
      );
    }, [items, searchQuery]);

    // Reset highlighted index when list changes
    React.useEffect(() => {
      setHighlightedIndex(0);
    }, [filteredItems]);

    const handleSelectItem = (item: ComboboxItem) => {
      onChange(item.value, item);
      setSearchQuery("");
      setIsOpen(false);
      if (onSelectCallback) onSelectCallback();
    };

    // Keyboard Navigation (Arrow Up, Arrow Down, Enter, ESC)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
        }
      } else if (e.key === "Enter") {
        if (isOpen && filteredItems.length > 0) {
          e.preventDefault();
          const target = filteredItems[highlightedIndex];
          if (target) handleSelectItem(target);
        }
      } else if (e.key === "Escape") {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    // Highlight Substring Helper
    const renderHighlightedText = (text: string, query: string) => {
      if (!query || !query.trim()) return text;
      const parts = text.split(new RegExp(`(${query})`, "gi"));
      return parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100 rounded-xs px-0.5 font-black">
            {part}
          </mark>
        ) : (
          part
        ),
      );
    };

    return (
      <div className={cn("space-y-1 relative", className)} ref={containerRef}>
        <label className="text-xs font-black text-slate-800 dark:text-slate-200 block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>

        <div className="relative">
          <input
            ref={ref || inputRef}
            type="text"
            disabled={disabled}
            value={displayInputText}
            onFocus={() => {
              if (!disabled) {
                setIsOpen(true);
                setSearchQuery("");
              }
            }}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full h-11 pl-3.5 pr-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold outline-none focus:border-amber-500 transition-all cursor-text disabled:opacity-50 shadow-2xs"
          />
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 cursor-pointer"
            onClick={() => {
              if (!disabled) {
                setIsOpen((prev) => !prev);
                setSearchQuery("");
              }
            }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </div>

        {/* Dropdown Options */}
        {isOpen && (
          <div
            ref={listRef}
            className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto p-1 divide-y divide-slate-100 dark:divide-slate-800/50 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            {filteredItems.length === 0 ? (
              <div className="p-3 text-center text-xs font-semibold text-slate-400">
                কোনো তথ্য পাওয়া যায়নি
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = value.toLowerCase() === item.value.toLowerCase();
                const isHighlighted = highlightedIndex === idx;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelectItem(item);
                      if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                      }
                    }}
                    className={cn(
                      "w-full min-h-[44px] px-3 py-2.5 text-left text-xs font-bold rounded-xl flex items-center justify-between transition-colors cursor-pointer select-none",
                      isSelected
                        ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                        : isHighlighted
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                    )}
                  >
                    <span>
                      {renderHighlightedText(item.label, searchQuery)}
                      {item.subLabel && (
                        <span className="text-slate-400 font-normal ml-1">
                          ({renderHighlightedText(item.subLabel, searchQuery)})
                        </span>
                      )}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-amber-500 shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  },
);

SearchableCombobox.displayName = "SearchableCombobox";
