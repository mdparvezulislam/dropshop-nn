export function normalizeVariantSku(variantSku?: string | null): string | undefined {
  if (!variantSku || variantSku.trim() === "") return undefined;
  return variantSku.toUpperCase().trim();
}
