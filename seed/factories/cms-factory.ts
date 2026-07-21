import { ContentRepository } from "@/features/cms/repositories/content-repository";
import { CMS_PAGES_DATA, CMS_BANNERS_DATA } from "../datasets/cms-data";
import { SeedLogger } from "../helpers/logger";

export async function seedCms(): Promise<void> {
  const repo = new ContentRepository();

  // 1. Seed CMS Pages
  for (const p of CMS_PAGES_DATA) {
    let existing = await repo.findBySlug("page", p.slug);
    if (!existing) {
      await repo.create({
        type: "page",
        title: p.title,
        slug: p.slug,
        bodyHtml: p.content,
        seo: {
          metaTitle: p.metaTitle,
          metaDescription: p.metaDescription,
        },
        status: "published",
        publishedAt: new Date(),
      });
    }
  }

  // 2. Seed Homepage Banners & Sections
  for (let i = 0; i < CMS_BANNERS_DATA.length; i++) {
    const b = CMS_BANNERS_DATA[i];
    const slug = `banner-${i + 1}`;
    let existing = await repo.findBySlug("banner", slug);
    if (!existing) {
      await repo.create({
        type: "banner",
        title: b.title,
        slug,
        excerpt: b.subtitle,
        coverImage: b.imageUrl,
        blocks: [
          {
            id: `b_${i}_1`,
            type: "hero",
            title: b.title,
            subtitle: b.subtitle,
            imageUrl: b.imageUrl,
            ctaLabel: "Shop Now",
            ctaHref: b.linkUrl,
            sortOrder: i,
          },
        ],
        status: "published",
        publishedAt: new Date(),
      });
    }
  }

  SeedLogger.success("CMS Pages, Banners & Navigation seeded", CMS_PAGES_DATA.length + CMS_BANNERS_DATA.length);
}
