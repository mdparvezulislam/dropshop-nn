import { FeatureFlags, Settings } from "@/shared/core/feature-flags";

export function registerCmsModule(): void {
  FeatureFlags.register({
    key: "cms-module",
    name: "CMS Module",
    description: "Enterprise headless content management platform",
    defaultState: "on",
  });

  FeatureFlags.register({
    key: "cms-public-blog",
    name: "Public Blog",
    description: "Expose published blog posts on the storefront",
    defaultState: "on",
  });

  Settings.register({
    key: "cms.blog-posts-per-page",
    name: "Blog posts per page",
    description: "Pagination size for public blog listing",
    scope: "global",
    defaultValue: 12,
  });

  Settings.register({
    key: "cms.default-locale",
    name: "Default CMS locale",
    description: "Default locale for new content",
    scope: "global",
    defaultValue: "en",
  });
}
