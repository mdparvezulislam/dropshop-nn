"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface Brand {
  id: string;
  name: string;
  logo: string;
  slug: string;
}

const brands: Brand[] = [
  {
    id: "1",
    name: "Apple",
    logo: "🍎",
    slug: "apple",
  },
  {
    id: "2",
    name: "Samsung",
    logo: "📱",
    slug: "samsung",
  },
  {
    id: "3",
    name: "Sony",
    logo: "🎧",
    slug: "sony",
  },
  {
    id: "4",
    name: "LG",
    logo: "📺",
    slug: "lg",
  },
  {
    id: "5",
    name: "Dell",
    logo: "💻",
    slug: "dell",
  },
  {
    id: "6",
    name: "HP",
    logo: "🖥️",
    slug: "hp",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
};

export function BrandSliderSection(): React.ReactElement {
  return (
    <section
      className="w-full py-8 sm:py-12 lg:py-16 bg-[hsl(0_0%_96%)]"
      aria-labelledby="brands-heading"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2
            id="brands-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
          >
            Featured Brands
          </h2>
          <p className="text-muted-foreground mt-2">Shop from trusted global and local brands</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {brands.map((brand) => (
            <motion.div key={brand.id} variants={itemVariants}>
              <Link
                href={`/brand/${brand.slug}`}
                className="flex items-center justify-center p-6 rounded-lg border border-[hsl(0_0%_91%)] bg-white hover:border-primary/40 hover:shadow-md transition-all grayscale hover:grayscale-0"
              >
                <span className="text-4xl">{brand.logo}</span>
              </Link>
              <p className="text-center text-xs font-medium text-foreground mt-2">{brand.name}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-8">
          <Link
            href="/brands"
            className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-2"
          >
            View All Brands →
          </Link>
        </div>
      </div>
    </section>
  );
}
