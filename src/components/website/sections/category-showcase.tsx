import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/features/catalog/domain/classification-entity";

interface CategoryShowcaseProps {
  categories: Category[];
  title?: string;
  description?: string;
}

export function CategoryShowcase({
  categories,
  title = "Shop by Category",
  description = "Browse our curated categories to find exactly what you need",
}: CategoryShowcaseProps) {
  const displayCategories = categories.slice(0, 8);

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="mt-2 text-foreground/50">{description}</p>
          </div>
          {categories.length > 8 && (
            <Link
              href="/categories"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative rounded-xl border border-border/60 bg-card overflow-hidden hover:border-primary/30 hover:shadow-md transition-all"
            >
              <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                {category.image ? (
                  <span className="text-foreground/20">Category Image</span>
                ) : (
                  <div className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <span className="text-lg font-bold text-primary">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-xs text-foreground/40 mt-0.5 line-clamp-1">
                    {category.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {categories.length > 8 && (
          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View All Categories
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
