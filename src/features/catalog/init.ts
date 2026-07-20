import { FeatureFlags, Settings } from "@/shared/core/feature-flags";

export function registerCatalogModule(): void {
  FeatureFlags.register({
    key: "catalog-module",
    name: "Catalog Module",
    description: "Enterprise product catalog engine",
    defaultState: "on",
  });

  FeatureFlags.register({
    key: "catalog-require-category",
    name: "Require Category",
    description: "Require category assignment before publishing",
    defaultState: "off",
  });

  FeatureFlags.register({
    key: "catalog-enable-collections",
    name: "Enable Collections",
    description: "Enable product collections feature",
    defaultState: "on",
  });

  Settings.register({
    key: "catalog.require-category",
    name: "Require Category",
    description: "Require category assignment before publishing",
    scope: "global",
    defaultValue: false,
  });

  Settings.register({
    key: "catalog.default-visibility",
    name: "Default Visibility",
    description: "Default visibility for new products",
    scope: "global",
    defaultValue: "public",
  });

  Settings.register({
    key: "catalog.search-default-weight",
    name: "Search Default Weight",
    description: "Default search weight for new products",
    scope: "global",
    defaultValue: 1.0,
  });

  Settings.register({
    key: "catalog.max-media-per-product",
    name: "Max Media Per Product",
    description: "Maximum media items per product",
    scope: "global",
    defaultValue: 30,
  });

  Settings.register({
    key: "catalog.max-variants-per-product",
    name: "Max Variants Per Product",
    description: "Maximum variant combinations per product",
    scope: "global",
    defaultValue: 100,
  });
}
