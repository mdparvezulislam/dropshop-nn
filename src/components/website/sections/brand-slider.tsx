"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Store } from "lucide-react";
import type { Brand } from "@/features/catalog/domain/classification-entity";

interface BrandSliderProps {
  brands: Brand[];
  title?: string;
}

export function BrandSlider({
  brands,
  title = "Trusted Brands",
}: BrandSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  if (brands.length === 0) return null;

  const duplicated = [...brands, ...brands];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isPaused) return;

    let animationId: number;
    let startTime: number | null = null;
    const speed = 0.5;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      if (!el) return;

      const elapsed = timestamp - startTime;
      el.scrollLeft = (el.scrollLeft + speed * (elapsed / 16)) % (el.scrollWidth / 2);

      startTime = timestamp;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[hsl(222_47%_11%)]">
            {title}
          </h2>
          <p className="mt-2 text-[hsl(215_16%_47%)]">
            Partnering with the best brands in Bangladesh
          </p>
        </div>

        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex overflow-x-hidden gap-10 items-center py-4"
        >
          {duplicated.map((brand, i) => (
            <Link
              key={`${brand.id}-${i}`}
              href={`/brands/${brand.slug}`}
              className="shrink-0 flex items-center justify-center h-16 px-6 rounded-xl border border-[hsl(0_0%_91%)] bg-white hover:border-primary/30 hover:shadow-sm transition-all opacity-60 hover:opacity-100"
            >
              {brand.logo ? (
                <span className="text-sm font-semibold text-[hsl(215_16%_47%)] group-hover:text-primary">
                  {brand.name}
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-primary/60" />
                  <span className="text-sm font-semibold text-[hsl(215_16%_47%)] whitespace-nowrap">
                    {brand.name}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
