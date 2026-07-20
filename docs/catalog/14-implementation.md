# 14 - Implementation Guide

## Module Structure

```
src/features/catalog/
├── domain/
│   ├── product-entity.ts           # Product, Variant, Media, SEO, Content, SupplierReference types
│   ├── classification-entity.ts    # Brand, Category, Collection, ProductTag, ProductAttribute
│   └── catalog-events.ts           # Event type constants + payload types
├── repositories/
│   ├── product-model.ts            # Product + Variant + Media + SEO + Content mongoose schemas
│   ├── product-repository.ts       # ProductRepository with cursor pagination
│   ├── classification-model.ts     # Brand, Category, Collection, ProductTag models
│   └── classification-repository.ts # BrandRepository, CategoryRepository, CollectionRepository, TagRepository
├── services/
│   ├── product-service.ts          # Product CRUD + publish + archive + variants + media + SEO
│   └── catalog-search-service.ts   # Search, filter, autocomplete
├── actions/
│   ├── product-actions.ts          # Product CRUD server actions
│   ├── classification-actions.ts   # Brand, Category, Collection, Tag actions
│   └── media-actions.ts            # Media management actions
├── types/
│   └── validation.ts               # All Zod schemas
├── init.ts                         # Feature flags + settings registration
├── index.ts                        # Barrel exports
├── components/
│   └── .gitkeep
└── hooks/
    └── .gitkeep
```

## Implementation Order

1. **Domain entities** — Product, Variant, Media, SEO, Content, SupplierReference, Brand, Category, Collection, Tag
2. **Event types** — Event constants + payload interfaces
3. **Validation schemas** — Zod schemas for all inputs
4. **Mongoose models** — Product + Classification schemas
5. **Repositories** — Data access with specialized queries
6. **Services** — ProductService + CatalogSearchService
7. **Actions** — Server actions with Zod + auth guards
8. **Init + Index** — Feature flags, settings, barrel exports

## Dependency Injection

All services instantiate their own repositories in constructors:

```typescript
export class ProductService {
  private readonly productRepository: ProductRepository;
  private readonly brandRepository: BrandRepository;
  private readonly categoryRepository: CategoryRepository;

  constructor() {
    this.productRepository = new ProductRepository();
    this.brandRepository = new BrandRepository();
    this.categoryRepository = new CategoryRepository();
  }
}
```

## Event Publishing Pattern

```typescript
await EventBus.publish("catalog.product.created", {
  productId: product.id,
  name: product.name,
  sku: product.sku,
  // ...
}, {
  actor: actor ? { id: actor.id, name: actor.name, role: actor.role } : undefined,
  source: "catalog-service",
})
```

## Action Pattern

```typescript
"use server";

export async function createProductAction(formData: any) {
  const session = await auth();
  const sessionUser = getSessionUser(session);
  const validated = createProductSchema.parse(formData);
  const service = new ProductService();
  const result = await service.create(validated, {
    id: sessionUser.id,
    name: sessionUser.name,
    role: sessionUser.role,
  });
  revalidatePath("/dashboard/catalog/products");
  return { success: true, data: result };
}
```

## Testing (Future)

- Unit tests for ProductService (create, update, publish, archive)
- Unit tests for CatalogSearchService (search, filter)
- Integration tests for unique constraints
- Integration tests for event publication
- E2E tests for complete product lifecycle
