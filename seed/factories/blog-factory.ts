import { ContentRepository } from "@/features/cms/repositories/content-repository";
import { BLOGS_DATA } from "../datasets/blogs-data";
import { SeedLogger } from "../helpers/logger";

export async function seedBlogs(): Promise<void> {
  const repo = new ContentRepository();
  let count = 0;

  for (let i = 0; i < 50; i++) {
    const template = BLOGS_DATA[i % BLOGS_DATA.length];
    const slug = i < BLOGS_DATA.length ? template.slug : `${template.slug}-${i + 1}`;
    const title = i < BLOGS_DATA.length ? template.title : `${template.title} (Part ${Math.floor(i / BLOGS_DATA.length) + 1})`;

    let existing = await repo.findBySlug("blog", slug);
    if (!existing) {
      await repo.create({
        type: "blog",
        title,
        slug,
        excerpt: template.excerpt,
        bodyHtml: template.content,
        blocks: [],
        seo: {
          metaTitle: `${title} | DropshopNN Blog`,
          metaDescription: template.excerpt,
        },
        authorId: "admin",
        authorName: "DropshopNN Editorial Team",
        publishedAt: new Date(Date.now() - 86400000 * i),
        status: "published",
        tags: template.tags,
        category: template.category,
        coverImage: template.featuredImage,
      });
      count++;
    }
  }

  SeedLogger.success("Blog Articles seeded", count > 0 ? count : 50);
}
