"use client";

import * as React from "react";
import { Check, ChevronDown, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { BD_DISTRICTS, getDistrict, searchDistricts, type BdDistrict } from "@/config/bd-districts";

/**
 * Searchable district picker for all 64 districts.
 *
 * A native `<select>` with 64 options is unusable on a phone, so this is a
 * combobox: type to filter (Bangla or English), arrow keys to move, Enter to
 * pick, Escape to close. It implements the ARIA combobox pattern properly —
 * `role="combobox"` with `aria-expanded`/`aria-controls`/`aria-activedescendant`
 * — so screen readers announce the highlighted option as it changes.
 */
export function DistrictSelect({
  value,
  onChange,
  id = "district",
  error,
  placeholder = "জেলা খুঁজুন বা নির্বাচন করুন",
}: {
  /** District id from `BD_DISTRICTS`. */
  value: string;
  onChange: (district: BdDistrict) => void;
  id?: string;
  error?: boolean;
  placeholder?: string;
}): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  const selected = value ? getDistrict(value) : undefined;
  const options = React.useMemo(
    () => (open ? searchDistricts(query) : BD_DISTRICTS),
    [open, query],
  );

  // Close on outside click / focus leaving the widget.
  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  // Keep the highlighted option in view while arrowing through 64 items.
  React.useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const openList = () => {
    setOpen(true);
    setQuery("");
    const index = options.findIndex((d) => d.id === value);
    setActiveIndex(index >= 0 ? index : 0);
  };

  const pick = (district: BdDistrict) => {
    onChange(district);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      event.preventDefault();
      openList();
      return;
    }
    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const district = options[activeIndex];
      if (district) pick(district);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin
          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
          aria-hidden
        />
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          aria-autocomplete="list"
          aria-activedescendant={open ? `${id}-option-${activeIndex}` : undefined}
          aria-invalid={error || undefined}
          autoComplete="off"
          value={open ? query : (selected?.name ?? "")}
          placeholder={selected ? selected.name : placeholder}
          onFocus={openList}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
            if (!open) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className={cn(
            "w-full h-12 pl-10 pr-10 rounded-xl border bg-white dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-slate-100",
            "placeholder:text-slate-400 placeholder:font-medium",
            "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-amber-500",
            error ? "border-red-400" : "border-slate-300 dark:border-slate-800",
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? "তালিকা বন্ধ করুন" : "জেলার তালিকা খুলুন"}
          onClick={() => (open ? setOpen(false) : (inputRef.current?.focus(), openList()))}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
        >
          {open ? (
            <Search className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>

      {open && (
        <ul
          ref={listRef}
          id={`${id}-listbox`}
          role="listbox"
          aria-label="জেলা"
          className="absolute z-40 mt-1.5 w-full max-h-64 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-1"
        >
          {options.length === 0 ? (
            <li className="px-3.5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400">
              &quot;{query}&quot; নামে কোনো জেলা পাওয়া যায়নি
            </li>
          ) : (
            options.map((district, index) => {
              const isSelected = district.id === value;
              const isActive = index === activeIndex;
              return (
                <li
                  key={district.id}
                  id={`${id}-option-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    pick(district);
                  }}
                  onClick={() => pick(district)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "flex items-center justify-between gap-2 px-3.5 py-2.5 cursor-pointer",
                    isActive && "bg-amber-50 dark:bg-amber-950/40",
                    isSelected && "font-black",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {district.name}
                    </span>
                    <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {district.nameEn} • {district.division} বিভাগ
                    </span>
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden />}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

export default DistrictSelect;
