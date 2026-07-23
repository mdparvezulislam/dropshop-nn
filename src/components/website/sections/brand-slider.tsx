"use client";

import { motion } from "framer-motion";
import type { Brand } from "@/features/catalog/domain/classification-entity";

interface BrandSliderProps {
  brands: Brand[];
  title?: string;
}

export function BrandSlider({
  brands,
  title = "Top Brands",
}: BrandSliderProps) {
  if (brands.length === 0) return null;

  const duplicated = [...brands, ...brands];

  return (
    <section className="py-16 lg:py-24 bg-muted/30 overflow-hidden">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground text-center mb-10">
          {title}
        </h2>

        <div className="relative">
          <motion.div
            className="flex gap-8 items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              x: {
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          >
            {duplicated.map((brand, index) => (
              <div
                key={`${brand.id}-${index}`}
                className="flex-shrink-0 flex items-center justify-center h-16 px-6 rounded-xl bg-card border border-border/40"
              >
                {brand.logo ? (
                  <span className="text-foreground/30 text-sm">Brand Logo</span>
                ) : (
                  <span className="text-sm font-semibold text-foreground/40 whitespace-nowrap">
                    {brand.name}
                  </span>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
