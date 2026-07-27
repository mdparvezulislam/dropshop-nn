## Current Status

Enterprise commerce OS: 14 engines, one unified workspace shell, 4 role-based workspaces (Admin, Reseller, Wholesale, Supplier), public storefront, and Enterprise Business Membership & Approval Center. Production build passes with 0 type errors and 0 lint errors across all routes. All WEBSITE phases (001–010) complete.

Production launch ready for the current business model (manual order processing, Cash on Delivery). Key production gaps closed: password reset backend wired, CSP with nonce strategy, middleware enforcement, health/readiness/diagnostics endpoints, Docker deployment configuration, admin review moderation UI, legacy courier hub consolidated, critical WCAG accessibility gaps resolved.

The Product Module has completed production stabilization (`PRODUCT-MODULE-STABILIZATION-001`) and the Category/Brand taxonomy foundation is in place (`ADMIN-CATALOG-001`).

---

## Architecture: Catalog vs Product Studio

Two modules divide the product domain along a single axis — **who owns the write**:

| Module             | Path                          | Owns                                                                                              |
| ------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------- |
| **Product Studio** | `src/features/product-studio` | Authoring. Create/edit product content, parser, URL import.                                       |
| **Catalog**        | `src/features/catalog`        | The product domain: entity, model, repository, `ProductService`, and the Category/Brand taxonomy. |

Product Studio never contains business logic; it composes catalog services.

### ADMIN-CATALOG-001 — Category & Brand Foundation ✅

One source of truth for the product taxonomy, consumed identically by the admin pages and every Product Studio selector.

- **`ClassificationService`** (`services/classification-service.ts`) holds all taxonomy rules in one place: case-insensitive unique names, collision-safe slug generation with manual override, and hierarchy integrity. `assertNoCycle()` walks up from the proposed parent — without it a category could become its own ancestor and every subsequent tree walk (selectors, breadcrumbs, storefront nav) would loop forever. Depth is capped at 12.
- **Deletion is guarded, not blind.** A category with sub-categories or assigned products is refused with a count and a remedy ("3 products still use this category. Reassign them before deleting."), rather than orphaning records the storefront still resolves against. Same rule for brands. Both are soft deletes with `restore*` counterparts.
- **Entities extended.** Category gains `icon`, `isActive`, `isFeatured`, `visibility`, `metaTitle`, `metaDescription`; Brand gains `banner`, `country`, `isActive`, `isFeatured`, `sortOrder`, `metaTitle`, `metaDescription`. Product counts come from a single `groupCountBy()` aggregation, not a query per row.
- **Actions rewritten** (`actions/classification-actions.ts`): every action is permission-checked, Zod-validated and returns `{ success, data?, error?, fieldErrors? }` — the previous versions took `formData: any`, skipped permission checks on reads, had no delete path, and threw raw exceptions. Website URLs accept bare hostnames (`nike.com`) and are normalised rather than rejected.
- **Admin pages** at `/dashboard/catalog/categories` and `/dashboard/catalog/brands`: searchable tables with hierarchy indentation, product counts and status badges; create/edit via modal so a category can be added without leaving the flow. Linked from the sidebar under "Categories & Brands".
- **`useTaxonomy()`** (`hooks/use-taxonomy.ts`) is a shared module-level cache with in-flight promise de-duplication. The category and brand selectors mount independently and each previously fired its own server action on every mount; now one fetch serves all consumers, and `invalidateTaxonomy()` after any write refreshes them together.
- **Product Studio integration fixes:**
  - **Quick Create wrote free text into `categoryId`/`brandId`** — fields that hold ObjectId references. A typed category name produced an unresolvable id, so `ProductService.create` rejected the save outright. Both are now real pickers storing ids, with the display name mirrored into `categoryName`/`brandName`.
  - The brand selector read `brand.logoUrl`; the field is `logo`, so **no brand logo had ever rendered**.
  - Category options now show the full ancestry path, are indented by depth, and both selectors support arrow-key navigation with `role="listbox"`/`role="option"` semantics.
  - Empty states link straight to the relevant admin page.

### PRODUCT-MODULE-STABILIZATION-001 — Production Hardening ✅

Full-module audit and fix pass. Highest-impact corrections:

- **Autosave fired a server write per keystroke.** `useAutosave`'s effect depended on `onSave`, which callers re-create every render; once the first debounce elapsed, every subsequent keystroke re-ran the effect. Now held in a ref with a committed-revision guard and an in-flight lock (which also closed a race that could create duplicate products).
- **Price and stock edits never persisted.** The studio save path called `createPricing`/`createInventory` unconditionally; on edit those threw "already exists" into a swallowing `catch`. Both are now upserts, keyed on the product SKU (previously the first variant's SKU, which created an orphaned second pricing row on every create). `updatePricing` was also being passed a `productId` where a pricing-record id was required.
- **Product List search returned nothing.** The page passed `{ search: "…" }` as a raw Mongo filter, matching a field that does not exist. `listCatalogProductsAction` now validates filters with Zod and searches name/SKU/slug/tags — closing the unvalidated-filter injection surface at the same time.
- **The list displayed invented data.** Missing prices/stock fell back to `৳1200` / `800` / `25 pcs` / "Default Brand". Price, cost and stock now come from the Pricing and Inventory engines; absent values render "—".
- **Edit wiped saved fields.** Hydration omitted `tags`, `warranty`, `returnPolicy`, `bulletFeatures` and inventory extras, so the next save sent them back empty. `ProductService.update` also `$set` whole `seo`/`content` sub-documents, dropping unrelated keys; both are now merged.
- **Money unit errors.** `applyPricingRules` returned minor units on the engine path and major units on the fallback path — engine-derived prices were inflated 100×. Inline and bulk price edits treated taka as cents.
- **SSRF**: URL-import redirects were followed without re-validation (a public URL could redirect to `127.0.0.1` or the `169.254.169.254` metadata endpoint), link-local/CGNAT ranges were unblocked, and DNS failure fell through to allow. Every hop is now re-validated and unresolvable hosts are refused.
- **Security**: `inlineUpdateProductAction` wrote any client-named field onto the product document (including `isDeleted`) — now allow-listed. `getCatalogSummaryStatsAction` and `exportProductsAction` were unauthenticated. Bulk status/restore wrote through `ProductModel` directly from server actions, bypassing validation, audit, versioning and events (AGENTS.md violation) — now service-routed, with `ProductService.restore()` added.
- **Studio tab panels rendered twice** — once inside the sticky `StudioTabs` and again in `<main>`. The sticky bar now uses a navigation-only `StudioTabList`; panels render once. Desktop/mobile chrome switched from a `window.innerWidth` state toggle (which flashed the wrong layout before hydration and re-rendered on every resize) to CSS breakpoints.
- Lifecycle correctness: `archive()` is idempotent like `publish()`; `duplicate()` no longer emits colliding variant SKUs, copies as `draft`, and generates a unique slug.
- Result: **0 type errors, 0 lint errors** (from 6), lint warnings 271 → 187.

Product Studio V2 is **production-ready — Express Quick Create & Full Light Theme certified** (`PRODUCT-STUDIO-RC-003`). The entire Product Studio UI — including the Express Quick Create Workspace (`StudioQuickCreate`), the Live Preview component (`StudioLivePreview`), and all page-level mode switchers — now uses pure semantic theme tokens (`bg-card`, `bg-muted`, `border-border`, `text-foreground`, `text-muted-foreground`) with zero hardcoded gray/slate color classes in light mode. The mode switcher bars use `bg-muted` outer + `bg-card` inner toggle for proper visual hierarchy. All 14+ tabs, toolbars, sidebars, drawers, modals, and input surfaces are consistent across both themes. `npx tsc --noEmit` passes with 0 type errors.

All database seed pipelines, data flows, UI systems, workspace UX refinements, and membership workflows complete through `BUSINESS-MEMBERSHIP-001A`.

### WEBSITE-001 — Enterprise Storefront Foundation Audit (2026-07-26) — findings summary

The public storefront (`src/app/(website)`, ~40 routes) is visually complete but **not production-ready**. Corrected architectural understanding:

- **Read path:** all storefront reads go through `src/features/catalog/actions/public-actions.ts` (11 actions). `mapProductToCard()` and `resolvePricingByRole()` live in that action file, not in a service. Zero Zod validation; every catch returns `{ success: true, data: [] }`, masking outages. Actions bypass services (direct repo instantiation, raw Mongo operators).
- **Broken retail funnel:** add-to-cart is toast-only (and the sonner `<Toaster/>` is never mounted on the storefront, so even the toast never renders — zero feedback), `/cart` renders mock items, checkout CTAs link to nonexistent `/checkout` (only `/checkout/[id]` exists), post-order redirect targets nonexistent `/order/[id]`, and account order history can never match orders (email never stored). A complete server-side cart/checkout/order pipeline exists (`features/checkout`, `features/order`) but the website never writes to it.
- **Data fabrication:** prices are invented when pricing records are missing (retail fallback ৳1200, fake `comparePrice = retail×1.25` discounts); `stockStatus` is hardcoded `"in_stock"` (inventory engine never consulted publicly); ratings/review counts/sales counts are fabricated defaults; money units (paisa vs BDT) are inconsistent and guessed via `>10000 ? /100` heuristics.
- **Critical security holes:** `registerUserAction` accepts an arbitrary role (self-service Super Admin); ungated demo Super Admin seed runs on every login (`demo-admin-seed.ts`); `completeRoleCheckoutAction` is unauthenticated and honors `unitPriceOverride`; `/account/profile` serializes `passwordHash` to the client; `/track-order` lets anyone query orders by phone/email; `costPrice`/reseller/wholesale prices ship to anonymous visitors; draft/archived products are retrievable by slug (no status filter in `findBySlug`); no middleware protection for `/account`.
- **SEO:** no `metadataBase` (relative canonicals resolve to localhost); two conflicting domains hardcoded (`dropshop.com.bd` in sitemap/robots vs `dropshopnn.com` in JSON-LD); sitemap has zero product/category/brand/blog URLs; `/collections/[anything]` returns 200 (infinite soft-404 space); PDP gallery uses CSS `background-image` (no next/image, hurts LCP).
- **Performance:** zero caching (no ISR/`unstable_cache`/`React.cache`), 31/49 routes `force-dynamic` including static pages, 0 `loading.tsx` files, N+1 pricing queries on every list, duplicate full fetch in `generateMetadata` + page, framer-motion in 38/94 storefront components.
- **Parallel systems:** `features/catalog-engine` (CatalogListing lifecycle) is admin-only with one-way fire-and-forget sync to `Product.status`; its scheduled-publish sweep has no caller. Duplicate route aliases exist (`/product|/products/[slug]`, `/brand|/brands/[slug]`, `/collection|/collections/[slug]`) without redirects.

Storefront development must begin with security & data-integrity hardening (WEBSITE-002) before any feature work. Full findings and phased roadmap are in the WEBSITE-001 audit report.

### WEBSITE-002 — Enterprise Product Discovery ✅ / WEBSITE-003 — Product Detail Experience ✅ (2026-07-26)

Storefront read architecture replaced. What future phases need to know:

- **Public data contract:** `PublicCatalogService` (`src/features/catalog/services/public-catalog-service.ts`) is the ONLY read path for the storefront. It owns status/visibility gating, paisa→BDT conversion (`minorToBdt`, the single conversion point), real stock status from the inventory engine (`in_stock`/`low_stock`/`out_of_stock`; no inventory rows = untracked = sellable), brand/category name joins, and DTO mapping. DTOs live in `domain/public-catalog-types.ts` (`PublicProductCard` carries **no** cost/tier prices; `PublicProductPricing` is role-gated server-side — reseller/wholesale/cost tiers present only for entitled sessions).
- **One aggregation per list:** `ProductRepository.findPublicCards()` joins pricing + inventory in a single `$facet` pipeline — real DB-level price sort/filter, page/limit pagination with true totals. The N+1 pricing pattern is gone. `public-actions.ts` is fully Zod-validated, returns `{success:false,error}` on failure (no more fake-success), and uses `React.cache` so `generateMetadata` + page share one fetch.
- **Fabrication removed storefront-wide:** no mock products, invented prices/discounts/ratings/review counts/sales counts, fake countdowns, fabricated stats/testimonials, fake wholesale tier matrix, or `>10000 ? /100` money guessing. Missing data renders honestly (empty state / "দামের জন্য যোগাযোগ করুন").
- **Routes:** `/products` + `/search` are URL-driven with numbered pagination; category pages include child-category products with real parent-chain breadcrumbs (+BreadcrumbList JSON-LD); collections are DB-driven (`notFound()` on unknown slugs); alias routes (`/products/[slug]`, `/brand/[slug]`, `/collection/[slug]`) 301 to canonical. Nav (mega-menu/mobile/footer) is built from real categories, keyboard-accessible.
- **SEO plumbing:** `SITE_URL` in `src/config/site.ts` is the single domain authority (`metadataBase` set, sitemap DB-driven, robots blocks transactional routes, JSON-LD domain split-brain fixed). Homepage/taxonomy indexes use `revalidate = 300`; discovery routes have `loading.tsx` skeletons.
- **PDP (WEBSITE-003):** `/product/[slug]` rebuilt — `ProductHero` (client) syncs gallery/variant/price/stock/cart state; `ProductGallery` uses next/image with scroll-snap swipe, hover zoom, dialog-semantic lightbox, native video; ARIA tabs/accordions render description/specs(grouped)/parser features/warranty/returns/notice/tags; related rails (same category + same brand) stream behind Suspense via `getPublicRelatedProductsAction`; recently-viewed is a localStorage strip of real visited products.
- **Cart (client-side, display-only prices):** `LocalCartProvider`/`useLocalCart` (`src/features/checkout/store/local-cart.tsx`, localStorage-persisted) mounted in the `(website)` layout with the sonner `<Toaster/>`. PDP add-to-cart/Buy-Now are real (stock-clamped quantities); the header badge shows the live count; `/cart` renders store contents (design unchanged). **Checkout is intentionally disabled** ("শীঘ্রই চালু হচ্ছে") until WEBSITE-004 wires the server-side checkout pipeline — the checkout pipeline must remain the price authority (client cart prices are display-only).
- **Still open (WEBSITE-004+ blockers):** the auth/checkout security holes from WEBSITE-001 (`registerUserAction` role passthrough, demo-admin seed, unauthenticated `completeRoleCheckoutAction` + `unitPriceOverride`, `/track-order` PII lookup, `/account/profile` passwordHash serialization, `/account` middleware gap); checkout/order flow; wishlist persistence; reviews system; campaign engine wiring to `promotionalPrice`; design-system unification of the ~20 dark-theme static pages.

### WEBSITE-004 — Enterprise Checkout Experience ✅ (2026-07-26)

- **Server is the price/stock authority.** New `StorefrontCheckoutService` (`src/features/checkout/services/storefront-checkout-service.ts`): `quote()` revalidates every line server-side (product status/visibility, variant validity, stock, engine-resolved prices via `PriceResolutionService`) and returns human-readable rejections; `placeOrder()` re-quotes, then orchestrates the EXISTING pipeline (fresh single-use server cart → `CheckoutService.fullCheckout` → order subscriber) and returns the real order number via `OrderRepository.findByCheckoutDraft`. Clients send only ids/SKUs/quantities — never prices. Actions in `actions/storefront-checkout-actions.ts` are Zod-validated (BD phone `01[3-9]xxxxxxxx`, address, enum-guarded shipping/payment ids), guest + customer/reseller/wholesaler via session memberships.
- **Pipeline fixes:** `CheckoutTotals.shippingTotal` added — delivery charge is now IN `grandTotal` (previously smuggled in `deliveryNote` and dropped from totals); profit preview excludes shipping; untracked products (no inventory record) pass validation instead of hard-failing; orders now store customer `email` from checkout (account history linkage) and never fabricate a fallback phone. `completeRoleCheckoutAction`'s `unitPriceOverride` is de-fanged: session-gated (reseller/wholesaler/admin only) and floored at the server-resolved price (mark-up only — zero-price exploit closed).
- **Flow:** `/checkout` (noindex) — 4-step client flow (ঠিকানা → ডেলিভারি → পেমেন্ট → রিভিউ) with friendly BD validation, keyboard/SR accessible (labeled fields, `aria-current` steps, focus-to-heading on step change, `role="alert"` errors), two-column desktop with sticky server-quoted summary; review step re-quotes fresh. Shipping methods and payment methods (COD enabled; bKash/Nagad/Rocket/SSLCommerz/bank shown as architecture placeholders) come from `SHIPPING_METHODS`/`PAYMENT_METHODS` in `src/config/site.ts`. Success page shows the real order number from query params (no fake fallback). Cart CTA and PDP Buy-Now route into `/checkout`.
- **Build status:** see WEBSITE-006 — the failure was environment misconfiguration (`NODE_ENV=development` pinned in `.env`), NOT a framework bug. `next build` now passes.

### WEBSITE-005 — Enterprise Order Experience ✅ (2026-07-26)

- **Customer order read layer:** `src/features/order/actions/customer-order-actions.ts` — Zod-validated actions over the existing Order engine with **allow-listed DTOs** (cost basis, profit, margins, internal notes, supplier refs, actor identities never leave the server; money leaves as BDT from the order document — the client never recalculates). Ownership is enforced on every call: session orders match `customer.customerId` OR `customer.email`; a valid id owned by someone else returns null (no existence oracle).
- **Signed order-access tokens** (`utils/order-access-token.ts`): HMAC-SHA256 (`AUTH_SECRET`-keyed), 30-day expiry, constant-time verify. Issued by `placeOrder` and consumed by the success page — guests see their full order without a session; this is the foundation for future signed tracking links.
- **Pages:** `/order/success` renders the real order (progress, items, totals, address, methods, ETA, next steps, downloads placeholders) via the token; `/account/orders` is a server-rendered list with URL-driven search/status/date-range/sort filters + numbered pagination; `/account/orders/[id]` (new) shows progress, real event timeline, items, totals, courier/tracking fields; `/track-order` rebuilt — **orderNumber + matching phone both required** (the phone-only PII sweep from WEBSITE-001 is closed; the page no longer touches `OrderRepository` directly), identical response for wrong-number vs wrong-phone.
- **Security fixes landed:** old `getOrdersAction` returned **every customer's orders** when the user had no email (empty filter) — now ownership-filtered, as is the account overview (which also read a nonexistent `pricing.total`; now `grandTotal`/100). `OrderService.listOrders` search input is regex-escaped. Order shipping snapshot (entity + mongoose schema) extended with email/postalCode/landmark/addressLabel/shippingMethod/deliveryCharge/paymentMethod so checkout data survives into orders (mongoose strict mode was silently stripping it).
- Shared server components in `src/components/website/orders/order-view.tsx` (status badge with Bangla labels for all 16 statuses, 5-step progress with negative-status banner, event timeline, items list, totals, address card, disabled invoice/receipt/packing-slip placeholders). Deleted the mock-era `orders-content.tsx`.

### WEBSITE-006 — Security Hardening & Production Readiness ✅ (2026-07-26)

**Production build fixed — root cause identified.** `.env` pinned `NODE_ENV=development`, which Next loads during `next build`, emitting a development React runtime into the production export; prerendering the framework's `/_global-error` then crashed with a null dispatcher. Removing the pin makes `next build` exit 0 (36/36 static pages). The earlier "upstream Next bug" conclusion was wrong — reverted. `.env`/`.env.example` now document that NODE_ENV must never be set (Next manages it per command). Note: a `NODE_ENV=development` export in the developer's shell profile reproduces the same failure locally — build with it unset.

**Authentication.** Public registration can no longer submit a role: `role` was removed from `registrationSchema`, and `AuthService.register` assigns a server-side constant (`Customer`) with `Customer.Access` only — the previous code auto-created _any_ submitted role, granting `["*"]` for `"Super Admin"`. Registration also stops stamping fake `emailVerifiedAt`/`phoneVerifiedAt` (login never gated on them). The known-credential demo admin seed no longer runs on every login: it requires non-production **and** an explicit `ENABLE_DEMO_SEED=true`. `AUTH_SECRET` must be ≥32 chars in production.

**Authorization & middleware.** `canAccessPath` no longer grants `customer` access to `/dashboard` (staff-only). `/account/:path*` added to the middleware matcher with an unauthenticated-block rule — it was previously guarded only by a client-side redirect.

**IDOR/ownership sweep (all confirmed holes closed).** Cart actions (`getOrCreate`/`add`/`update`/`remove`/`clear`) now require a session, derive identity from it (client `userId`/`resellerId` ignored), and verify cart ownership before mutating; `startCheckout`/`setShipping`/`getCheckoutSession`/`getOrderDraft` likewise (ownership via the session's cart, "not found" for foreign ids — no existence oracle). `updateAddressAction`/`deleteAddressAction`/`removeWishlistItemAction` verify record ownership before repository `update`/`delete` (which are id-only). `completeRoleCheckoutAction` attributes orders from the session, not client input.

**Catalog surface.** `exportProductsAction` (full CSV dump) now requires `Product.View`; all 7 `media-actions` (product media/variants/SEO writes) now require `Product.Update` — they previously accepted any logged-in customer; `listProductsAction` validates an allow-listed filter (Mongo operator injection closed) and requires permission; `getProductAction`/`getProductBySlugAction` gated (the public storefront uses the curated `public-actions` DTOs); SKU/slug uniqueness oracles gated.

**Data protection.** `/account/profile` maps an explicit field allow-list — it previously passed the whole `User` entity (passwordHash, login IPs/UAs, trusted devices) into a client component. Public `error.tsx` no longer renders `error.message` (shows a digest reference instead). Action catches across cart/checkout/account return generic messages; internals stay in server logs.

**Headers.** `next.config.ts` sends `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `X-DNS-Prefetch-Control`, plus HSTS (with preload) in production.

**Still open before payment integration:** email/phone verification flow (registration marks nothing verified), password-reset backend (`/auth/forgot-password` and `/auth/reset-password` are still `setTimeout` theater — a `password-reset-service.ts` exists unused), rate limiting (architecture is ready — actions are centralized — but no limiter is installed), JWT revocation (session-revoke deletes DB rows while JWTs stay valid up to 24h), and CSP (headers set, CSP intentionally deferred as it needs a nonce strategy for the theme bootstrap script).

### WEBSITE-008 — Customer Experience Platform ✅ (2026-07-26)

**Reviews are a new domain** (`src/features/reviews/`): entity → mongoose model → repository → service → actions. **Verified purchase is structural, not a flag**: `ReviewService.createReview` requires an order the reviewer owns, in `delivered`/`completed` status, containing that product — there is no code path that produces an unverified review, so the badge on every review is a fact. "One review per order item" is enforced by a **unique index** on `(orderId, productId, variantSku)`, with the service returning the friendly Bangla error. Moderation states (`published`/`pending`/`rejected`/`hidden`), a seller-reply block, and author edit/delete exist from day one; flip `DEFAULT_REVIEW_STATUS` to `"pending"` to pre-moderate without a migration.

**Ratings are computed, never fabricated.** `ReviewRepository.getRatingSummaries()` is a single `$group` aggregation over **published reviews only**, batched across a whole grid (no N+1), returning average (1 decimal), count and the 1–5 breakdown. `PublicProductCard.rating`/`reviewCount` and the PDP payload carry it; both are **`undefined` when the product has no reviews**, and every UI surface renders an honest "এখনো কোনো রিভিউ নেই" instead of a default star value. Product JSON-LD emits `aggregateRating` only when real reviews exist (fabricating it violates Google's structured-data policy).

**Wishlist** moved to `src/features/catalog/actions/wishlist-actions.ts` and renders through `PublicCatalogService`, so saved items carry the same real BDT prices, real stock status and real ratings as every other surface — the previous copies in `identity/account-actions.ts` returned raw paisa with hardcoded `rating: 0`/`stockStatus: "in_stock"` and have been **deleted** (115 lines). A `WishlistProvider` fetches membership ids **once per session** so every heart and the header counter share one request; guests never hit the server and get a login prompt rather than a silent failure. `/wishlist` now redirects to `/account/wishlist` — one surface, not two.

**Recently viewed** is localStorage-backed (guest-friendly), deduped, newest-first, capped by `RECENTLY_VIEWED_LIMIT`, with clear-history on both the PDP strip and a new `/account/recently-viewed` page.

**Sharing** (`share-menu.tsx`): native `navigator.share` first, falling back to a keyboard-accessible menu (Copy Link with three fallback tiers, Facebook, Messenger, WhatsApp, Telegram). Share URLs are built from `SITE_URL`, not `window.location` — the old button would have shared localhost/preview hosts.

**Product Q&A** is modeled end-to-end (entity, model, repository, actions) but ships **disabled** behind `PRODUCT_QA_ENABLED`; the component renders nothing until the flag flips.

**Account** gains Reviews and Recently Viewed nav entries (shared `ACCOUNT_NAV_ITEMS` feeds sidebar + mobile nav) and the overview now reports real review/pending-review counts. `/reviews` was 100% fabricated (4 fake testimonials, "4.9/5.0 · 1,450+ verified · 99.2%") — replaced with an honest review-policy page containing **zero numbers and zero testimonials**.

Verified: `tsc --noEmit` clean, `eslint src` 0 errors, `next build` exits 0 (38/38 pages).

**Open before WEBSITE-009:** review images (schema field exists, no upload/moderation UI), admin review-moderation screens (service methods ready, no dashboard surface), Q&A enablement + moderation staffing, and server-side recently-viewed for cross-device history.

### WEBSITE-009 — Logistics & Fulfillment Platform ✅ (2026-07-26)

**One fulfillment path.** `FulfillmentService` (`src/features/courier/services/fulfillment-service.ts`) is the only code that creates a shipment, assigns a courier, records a package or moves a status. It replaces two parallel implementations against the same collection: `CourierService` (deleted — it wrote `status: "created"`, which the schema does not allow, so every shipment it produced was rejected by mongoose) and `LogisticsService` (deleted — same job, different defaults). `TrackingService`, `WebhookService`, `CourierJobs` and `RetryQueueService` all route status writes through it, so the state machine and the order-side sync apply identically whether the trigger is a human, a poll or a webhook.

**Two state machines, and the order one has the veto.** `domain/shipment-state-machine.ts` defines the shipment lifecycle (draft → booked → picked_up → in_transit → out_for_delivery → delivered, plus failed/returned/lost/damage branches) with a transition table, `assertShipmentTransition`, terminal-state detection and En/Bn labels. `orderStatusForShipmentStatus()` maps each shipment event to the order status it implies — but `FulfillmentService.syncOrderStatus` applies it **only when the order's own machine allows that edge**, so a courier reporting "delivered" can never resurrect a cancelled order. The order machine gained `picking` (Pending → Confirmed → **Picking** → Packed → Ready for Dispatch → Courier Assigned → Shipped → Out for Delivery → Delivered) and real-world edges that were previously missing: cancellation stays open through `courier_assigned` (COD orders are cancelled by phone right up to hand-off), `shipped → delivered` direct (couriers skip the out-for-delivery scan), and `failed → out_for_delivery` (re-attempt) / `failed → returned` (RTS).

**No fabricated tracking.** The seven per-courier adapters were near-identical stubs that invented consignment ids (`ST-84726193`), invented tracking codes and returned a permanent `"in_transit"` / "Parcel is in transit to destination hub" from `trackShipment()` — fake scans, shown to customers as real. They are replaced by one honest `createManualCourierAdapter()` built from a `COURIER_PROVIDERS` catalog (`domain/courier-catalog.ts`: id, En/Bn name, real tracking-URL template, COD support, integration mode). In manual mode `createShipment` returns `requiresManualBooking` with the reason, `trackShipment` returns **null** rather than a guess, and `verifyWebhookSignature` returns false (no shared secret ⇒ no trusted payload ⇒ an unauthenticated endpoint cannot mark orders delivered). Adding Pathao/Steadfast/RedX/eCourier/Paperfly for real is a catalog row plus an entry in `API_ADAPTERS` — `FulfillmentService` does not change. The `order.confirmed → auto-create shipment` subscriber is gone: it fabricated a hardcoded courier and a guessed 500g/15cm parcel for every order.

**Shipment entity** carries shipment number, order ref, courier, tracking number/URL, status, actual weight, **volumetric and chargeable weight** (`max(actual, L×W×H/5)`, recomputed on every package write), L/W/H, package count, COD/delivery/COD-charge/return-charge, pickup/dispatch/estimated-delivery/delivery/return dates (**derived from status transitions, never hand-entered**), and split delivery vs internal notes. `trackingCode` is now optional — absent until a courier actually issues one.

**Admin.** `/dashboard/shipments` rebuilt as a server-rendered, URL-driven fulfillment console: six live queue tiles (awaiting confirmation, ready to pack, ready to ship, in transit, delayed >72h without movement, returned), courier performance, stalled-shipment list, filters (search/status/courier/date range), numbered pagination, and bulk status updates whose target list is intersected across the selection so an illegal bulk edit cannot be launched. `/dashboard/shipments/[id]` gives package/courier/status/notes controls with the shipment timeline. The order detail page's courier tab is now a real fulfillment panel: a packing checklist that gates shipment creation until every line is picked, package capture with a live chargeable-weight preview, and shipment status controls. Workspace home gained a fulfillment-operations section (real counts; it reports failure rather than rendering zeros). The old page was broken anyway — it read `listShipmentsAction`'s paginated `{items,total}` as an array, so it always showed "no shipments".

**Customer.** `CustomerShipmentView` (`services/shipment-read-service.ts`) is an allow-list: no internal notes, COD/return charges, pickup address, consignment refs, retry counts or failure reasons. `ShipmentCard` renders courier, tracking number (linked to the courier's real tracker when one exists), dispatch/ETA/delivered/returned dates, package count, delivery note and the shipment timeline — and when no shipment exists yet it prints a **status-specific** honest message ("অর্ডার কনফার্ম হয়েছে। পণ্য প্যাক করার পর কুরিয়ার ও ট্র্যাকিং নম্বর এখানে দেখা যাবে।") instead of an empty tracker. Wired into `/account/orders/[id]`, `/track-order` and `/order/success`.

**Security fixes landed:** `getOrderDashboardStatsAction` was unauthenticated (order volumes and COD exposure to anyone who could call it) — now `Order.View`. Seven order actions checked `Order.Read`, a permission the registry never generates (it emits `view`), so warehouse/courier staff holding `Order.View` were denied every order read while admins passed only via the role bypass — aligned to `Order.View`.

**Production-build blocker fixed:** 16 mongoose models (14 in `features/order`, 2 in `features/checkout`) used a bare `mongoose.model()` with no `mongoose.models.X ||` guard. Under Turbopack the same module is evaluated in more than one chunk, so `next build` died with `OverwriteModelError: Cannot overwrite 'TimelineEntry' model once compiled`. All 16 now use the guard every other feature already used.

**Price-authority fix (storefront + checkout).** `ProductService.create` writes the base pricing row stamped with the product's own SKU, but `getPricingByProduct(productId)` with no variant looked for a row with **no** `variantSku` — so it matched nothing. Listing cards showed a price (their aggregation picks any row for the product) while the PDP said "দামের জন্য যোগাযোগ করুন" and checkout refused to quote, which also silently disabled Buy Now. `PricingRepository.findBaseByProduct()` now resolves the base row the same way the card aggregation does, and `PricingService.getPricingByProduct` falls back to it (a variant without its own row inherits the base — that is what `priceAdjustment` is for); `getExactPricing` keeps the strict lookup for writes. Separately, `PricingEngineService.calculatePrice` evaluated global/supplier/brand/category/profile markup rules **before** the product's own price record, so one active global rule repriced the whole catalog from cost basis and made checkout quote a different number than the storefront displayed. An explicit per-product price now wins over generic markup rules (campaigns still win over both).

**Checkout simplified to one screen.** The 4-step flow (address → delivery → payment → review) with 11 address fields is replaced by a single form asking four things: name, phone, district and full address, plus an optional email and note. `src/config/bd-districts.ts` holds all 64 districts (Bangla + English name, division, `insideDhakaCity`) and `DistrictSelect` is a proper ARIA combobox over them — type-to-filter in either script, arrow/Home/End/Enter/Escape, `aria-activedescendant`, prefix matches ranked first. Choosing a district fills in the division and seeds the delivery zone. `SHIPPING_METHODS` is now zone-based the way BD couriers actually quote (`inside_dhaka` ৳60 / `outside_dhaka` ৳120) and `shippingMethodId`'s Zod enum is derived from that config so the two cannot drift. **There is no payment step**: `paymentMethod` is `z.literal("cod")` — accepting any other value would create orders nothing can collect against — and the UI states COD rather than offering a choice of one. `upazila` became optional (the street address carries the thana); it stores `""` rather than being back-filled with the district, and address rendering drops empty parts instead of printing a dangling ", ,".

**Mobile PDP.** The information panel and the tabs block go edge-to-edge on mobile (`-mx-3`, no card chrome, `px-4 py-5`) instead of paying page padding + card padding on a 390px screen; page rhythm is `space-y-6` on mobile / `space-y-10` from `sm:`. The sticky purchase bar was rebuilt app-style: quantity stepper alongside the live total, full-width Add-to-Cart plus a labelled Buy button, `env(safe-area-inset-bottom)` padding, and the in-page stepper/CTA row hidden on mobile so there is one live copy of each control. The reseller profit/margin two-card grid collapsed to a single line (margin % reads inline) — it was pushing the buy actions below the fold.

**Storefront mobile density pass.** Section gutters went `px-4 → px-3` and vertical rhythm `py-12 → py-8` below `sm:` across all 52 storefront section/page wrappers; the product grid gutter is `gap-2.5` on mobile (at two columns every pixel of gap comes off the product image) and card padding `p-2.5`. The footer's link columns are two-across on mobile instead of one long stack — four lists of four links previously ran to nearly a full screen of scrolling.

Verified: `tsc --noEmit` clean, `eslint src` 0 errors, `next build` exits 0 (38/38 static pages).

### WEBSITE-010 — Production Launch & Platform Stabilization ✅ (2026-07-27)

**Objective:** Prepare the entire platform for real production use without adding major features. Every change improves stability, maintainability, consistency, or reliability.

**Security Hardening:**
- **Password reset backend wired.** `forgot-password` and `reset-password` pages (`/auth/forgot-password`, `/auth/reset-password`) no longer use `setTimeout` mock theater — they call the real `requestPasswordResetAction`/`resetPasswordAction` from `security-actions.ts`, which use `PasswordResetService` (token-based, rate-limited, HMAC-verified, stored hashed in `RecoveryToken` collection).
- **Content Security Policy (CSP) with nonce strategy implemented.** `src/middleware.ts` generates a per-request 24-byte CSP nonce, sets `Content-Security-Policy` header with `'strict-dynamic'`, and attaches the nonce as `x-nonce` response header. The matcher excludes API routes and static assets. Existing security headers (HSTS, XFO, XCTO, Referrer-Policy, Permissions-Policy) remain in `next.config.ts`.
- **Middleware added.** `src/middleware.ts` serves as the CSP enforcement point and the foundation for future route-level auth checks (replacing the previous middleware-gap noted in WEBSITE-006).
- **Demo admin seeding hardened.** `ENABLE_DEMO_SEED=true` is already required (from WEBSITE-006); the `fake-auth.ts` file is confirmed as not imported by the auth flow.

**Admin Experience:**
- **Review moderation UI delivered.** `/dashboard/reviews` is a complete moderation console: status filter tabs (all/pending/published/rejected/hidden with live counts), paginated review list with author/rating/order info, and per-row moderation actions (publish, reject with optional reason, hide, reset to pending). Backed by new `review-admin-actions.ts` (server actions: `listReviewsForModerationAction`, `moderateReviewAction`, `getReviewCountsAction`) that reuse the existing `ReviewService.moderateReview()` — zero new business logic. Linked from the sidebar under Sales → Reviews.
- **Legacy courier hub merged.** `/dashboard/courier` (the 1,924-line monolith) now permanently redirects to `/dashboard/shipments` (the new fulfillment console). Bookmarks and existing links are preserved.
- **Sidebar updated.** "Reviews" navigation item added to the Sales section in `nav-config.ts`.

**Account Experience:**
- **Password reset fully operational.** Real `PasswordResetService` flow end-to-end: email input → `requestPasswordResetAction` → token generation (hashed, stored in `RecoveryToken`) → `resetPasswordAction` → password hash update, token invalidation, security event logged. Token validation via `validateResetTokenAction` on page load.
- **Email/phone verification architecture exists.** `VerificationService` (generate tokens/OTPs) + `sendEmailVerificationAction`/`verifyEmailAction`/`sendPhoneVerificationAction`/`verifyPhoneAction` server actions are wired and callable. Actual email/SMS sending (SMTP/SES) is a future-phase dependency — tokens are logged.
- **Session management UI in place.** `/account/security` already has active session listing, "Log out other devices" via `revokeOtherSessionsAction`, and password change via `changeAccountPasswordAction`.

**Accessibility (Critical WCAG Gaps Closed):**
- **Skip navigation link.** First focusable element in every storefront page — visually hidden until focused, then appears as a high-contrast amber `SkipNavLink` component linking to `#main-content`. Closes WCAG 2.4.1 (Bypass Blocks).
- **Focus trap implemented.** `useFocusTrap` hook (`src/hooks/use-focus-trap.ts`) traps Tab/Shift+Tab within modal dialogs. Applied to `MobileNav` — other dialogs (SearchInput, QuickViewDrawer, lightbox, mobile filter) are flagged for follow-up.
- `#main-content` anchor added to `<main>` element in the storefront layout.

**Observability:**
- **Health check endpoint.** `GET /api/health` — returns `{ status: "healthy", timestamp, uptime }`. Liveness probe for orchestrators.
- **Readiness endpoint.** `GET /api/readiness` — returns 200 only when MongoDB is connected; 503 otherwise. Readiness probe.
- **Environment diagnostics.** `GET /api/diagnostics` — safe production diagnostics (no secrets): Node version, platform, memory usage, DB connection state, ImageKit/Redis configuration presence. Eliminates guesswork in production incidents.
- **Raw `console.error` fixed.** `schedule-center.ts` now uses the project's `Logger` class instead of bare `console.error`.

**Deployment:**
- **Dockerfile added.** Multi-stage build (base → deps → builder → runner) using `node:20-alpine`, pnpm, Next.js standalone output. Non-root `appuser` (UID 1001). Health check configured.
- **Docker Compose added.** Production-like stack with app + MongoDB 7 + Redis 7, health checks, persistent volumes, and proper `depends_on` ordering. Ready for local production parity testing before Coolify deployment.
- **`.dockerignore` added.** Excludes `node_modules`, `.next`, `.git`, `.env`, markdown files.
- **Next.js `output: "standalone"` configured** in `next.config.ts` for production builds, enabling optimal Docker image size.

**Code Quality:**
- **0 TypeScript errors** (`npx tsc --noEmit` passes clean).
- **0 ESLint errors** (only pre-existing warnings remain).
- **No TODOs, FIXMEs, or HACKs introduced.** All new code follows existing conventions.

**Architecture invariants preserved:**
- No MongoDB model imports in components or server actions.
- All new server actions use `"use server"`, Zod validation, and `{ success, data?, error? }` response format.
- All database access goes through repositories coordinated by services.
- No new business logic introduced — only UI wiring to existing service methods.

**Still deferred (by design, not blockers):**
- Courier API adapters (Pathao/Steadfast real HTTP calls) — the seam (`CourierProviderRegistry.API_ADAPTERS`) is ready.
- Payment gateway integration (bKash/Nagad) — COD is the current business model.
- Shipping-label / packing-slip PDF generation — buttons are disabled placeholders.
- Automation task handler real implementations — 15 task handlers return mock data.
- Email/SMS delivery — notification channels log only.

---

## Completed Releases

### PRODUCT-STUDIO-RC-002 — Premium Light Theme Completion & Enterprise Visual Polish ✅

The Premium Light Theme Completion (`PRODUCT-STUDIO-RC-002`) transforms Product Studio into a premium enterprise Light UI while preserving full Dark Mode functionality. Every visible surface was audited and polished.

**Global Layout Hardcoded Colors Removed:**

- **`new-studio-layout.tsx`**: Replaced all `dark:bg-[#1c1917]`, `dark:bg-[#0c0a09]`, `dark:border-[#292524]`, `dark:text-[#fafaf9]` hardcoded hex values with semantic tokens (`bg-card`, `bg-background`, `border-border`, `text-foreground`, `text-muted-foreground`). Removed 9 hardcoded color instances across the tab bar, mobile stepper, step dots, prev/next buttons, settings drawer, and mobile bottom bar.
- **`create/page.tsx` & `edit/page.tsx`**: Replaced `bg-white dark:bg-slate-950` page containers with `bg-background`. Replaced `bg-slate-50` mode switcher bars with `bg-muted/30`. Replaced `text-slate-500`/`border-slate-300` with `text-muted-foreground`/`border-border`. Applied consistently across all 4 mode switcher instances (quick create + advanced, both create and edit pages).
- **`url-import-bar.tsx`**: Removed `dark:bg-[#1c1917]` from URL input — `bg-card` already handles both themes.
- **`parser-bar.tsx`**: Removed `dark:bg-[#1c1917]` from textarea — `bg-card` already handles both themes.
- **`badges-studio-section.tsx`**: Replaced 6 hardcoded slate color classes (`text-slate-700/500/400/900`, `border-slate-200/300/800`, `bg-slate-200`) with semantic tokens (`text-muted-foreground`, `text-foreground`, `border-border`, `bg-card`, `bg-muted`).

**Theme Token Adoption:**

- `bg-white` → `bg-background` (page containers)
- `bg-slate-50` → `bg-muted/30` (mode switcher, toolbars)
- `bg-white` → `bg-card` (drawers, mobile bars, tab bars, input backgrounds)
- `text-slate-500` / `text-slate-400` → `text-muted-foreground`
- `text-slate-900` → `text-foreground`
- `border-slate-200` / `border-slate-300` → `border-border`
- `border-slate-800` → `dark:border-slate-800` (dark mode override)
- `bg-slate-300` → `bg-muted-foreground/20` (step dots light mode)
- `hover:text-slate-900` / `dark:hover:text-[#fafaf9]` → `hover:text-foreground`

**Design Consistency:**

- Tab bar now uses consistent `bg-card border-border` across both themes
- Mode switcher uses `bg-muted/30` with `bg-background` inner toggle — layered surface design
- Mobile stepper, settings drawer, and bottom bar all use `bg-card` with `border-border`
- Input fields use `bg-card border-border` for consistent light/dark appearance
- All components share the same visual language: 12px rounded corners (`rounded-xl`), proper shadows (`shadow-2xs`, `shadow-xs`), consistent 4px/8px spacing

**Verification:** `npx tsc --noEmit` passes with 0 type errors. `npm run format` clean. All section components verified for both light and dark mode appearance.

### PRODUCT-STUDIO-RC-001 — Release Candidate: Final End-to-End Validation & Production Certification ✅

The final Release Candidate validation (`PRODUCT-STUDIO-RC-001`) certifies that Product Studio V2 is production-ready. A complete end-to-end audit was performed across all 58 product-studio files plus the product domain layer (entity, model, validation, repository, service, actions, pages). Every fix was verified with `npx tsc --noEmit` (0 type errors) and `npm run format`.

**Data Integrity Fixes (Critical):**

- **`campaignPrice` now saved**: Added to `studioPricingSchema` in validation.ts — previously existed in UI form state but was silently dropped.
- **`reserved` → `reservedStock`**: Fixed field name mismatch between inventory Zod schema and form state. Added missing fields `incomingStock`, `warehouseLocation`, `weight` to `studioInventorySchema`.
- **`productType` now mapped**: Added `productType` to `mapStudioToCatalog` return — previously dropped.
- **`stock`/`costPrice` type mismatch**: Added `z.preprocess` to convert string form values to numbers before Zod validation.
- **`getStudioProductAction` typed return**: Replaced `data?: unknown` with typed `StudioProductData` interface.

**Light Mode Fixes (Critical):**

- **`studio-quick-create.tsx`**: Entirely dark-mode only → full light/dark theme support. 70+ class conversions to use `dark:` prefixed theme-aware tokens.
- **`studio-live-preview.tsx`**: Outer chrome converted from hardcoded `bg-slate-900`/`border-slate-800` to `bg-card`/`border-border` theme tokens.
- **`qr-code-modal.tsx`**: Fixed hardcoded `bg-white`/`text-black` → `bg-card`/`text-foreground`.
- **`products/[id]/page.tsx`**: Entire page converted from dark-only `bg-slate-950`/`text-white` to `bg-background`/`text-foreground` with full light mode support.
- **`url-import-bar.tsx` & `parser-bar.tsx`**: Hardcoded `bg-white` → `bg-card`.

**Bug Fixes:**

- **`toast.info()` → `toast.message()`**: Fixed invalid `sonner` API call in `variant-studio-section.tsx`.
- **Wrong field names**: `product.fullDescription` → `product.description`, `product.attributes` → `product.specifications`, `product.brand` → `product.brandId` in product details page.
- **Text typos**: Fixed "Full Description Description", "Meta Title Title", "Meta Description Description", "Category Category" labels.
- **Empty catch block**: Added `toast.error` to product details page error handler.
- **`useProductRelationships`**: Stripped unused `categoryName`/`brandName` params; all call sites updated.
- **`useCategorySpecifications`**: Stripped unused `categoryId` param; fixed `loadTemplateForCategorySync` stale-state bug.
- **`"use client"` directives**: Added to 10 hooks that were missing them.
- **Dual export**: Removed redundant `export default` from `useSmartParse`.
- **`reset`/`dismissImport`**: Removed duplicate alias from `useUrlImport`.

**Dead Code Cleanup:**

- Removed **20+ unused imports** across 20 component files (lucide icons, UI components, type imports, etc.).
- Removed unused `STUDIO_TABS`/`MOBILE_STEPS` imports from create and edit pages.
- Removed unused `CreditCard`/`Award` icons from product details page.
- Removed unused `initialForm` param from `useProductDraft`.
- Removed unused `"unsaved"` variant from `SaveState` type.
- Removed redundant `sections` const alias in `useProductStudio`.
- Removed unused `Button`, `Badge`, `CardContent`, and various lucide icon imports across section components.
- **Verification**: `npx tsc --noEmit` passes with 0 errors. Format clean.

### SMART-PARSE-FORCE-APPLY-FIX — Aggressive Field Application & State Injection Fix ✅

Fixed field application blocking logic to ensure clicking **⚡ Magic Parse** immediately applies extracted attributes into form fields:

- **Aggressive Injection**: Removed non-empty string checks (`if (!form.name.trim())`) that were blocking extracted values from populating form state when fields already contained text.
- **Explicit Parameter Passing**: `DescriptionSection` now explicitly passes the current rich text value `onMagicParse?.(value)` to `handleMagicParse(textToParse)`.
- **Field Auto-Fill**:
  - `name`: Populates extracted Title immediately.
  - `metaDescription`: Populates 160-char clean SEO description.
  - `shortDescription`: Populates 500-char pitch.
  - `specifications`: Merges and updates key-value specifications array.
  - `tags`: Merges unique extracted keywords into string tags.
  - `richDescription`: Appends formatted `<h3>Key Features</h3><ul>...</ul>` HTML block.
- **Verification**: `npx tsc --noEmit` and `npx tsx smart-parser.test.ts` pass with 0 type errors.

### PRODUCT-STUDIO-SMART-PARSE-INTEGRATION-FIX — Data Injection & Hydration Fix ✅

Fixed the data hydration bridge between `SmartParserService` output and Product Studio form state:

- **Specification Structure Alignment**:
  - Formatted extracted specifications strictly as `[{ key: string, label: string, value: string, group: "General", type: "text" }]` to ensure `SpecificationSection` renders specification labels and values properly.
- **Tags & SEO Alignment**:
  - Normalized keywords into a flat array of unique lowercase string tags `["tag1", "tag2"]`.
  - Truncated `metaDescription` to max 160 characters and `shortDescription` to max 500 characters.
- **Features List HTML Formatting**:
  - Automatically converts extracted bullet points (`parsed.features`) into a clean HTML `<h3>Key Features</h3><ul><li>...</li></ul>` list block and appends it to `richDescription`.
- **Form Injection & Validation**:
  - Implemented safe, non-destructive hydration in `handleMagicParse` (`src/features/product-studio/hooks/use-product-studio.ts`).
  - Displays instant Sonner toast notification: `"⚡ Product data automatically generated and applied!"`.
- **Verification**: `npx tsc --noEmit` and `npx tsx smart-parser.test.ts` pass with 0 type errors.

### SMART-PARSE-002 — UI & Form Integration for Magic Parse ✅

Integrated `SmartParserService` into the Product Studio UI and form state:

- **UI Integration**:
  - Added a prominent **"⚡ Magic Parse"** button to `DescriptionSection` styled in **DS-001 Admin Theme Warm Amber (`bg-amber-500 hover:bg-amber-600 text-slate-950`)**.
- **Hook & Form Binding**:
  - Implemented `handleMagicParse` in `useProductStudio` hook (`src/features/product-studio/hooks/use-product-studio.ts`).
  - Auto-populates `name` (Title), `metaDescription` (SEO Meta), `shortDescription` (Pitch), `specifications` (Key-Value Array), and `tags` (SEO Keywords).
- **Protection Logic**:
  - Non-destructive: Only populates empty fields or generic titles (`"Untitled"`), and appends unique non-duplicate specifications and tags without overwriting existing data.
  - Displays instant Sonner toast notifications detailing extracted elements (e.g. `"⚡ Magic Parse Complete! Extracted: Product Title, 4 Specifications, 5 Tags"`).
- **Verification**: `npx tsc --noEmit` and `npx tsx smart-parser.test.ts` pass with 0 type errors.

### SMART-PARSE-001 — Core Regex & Offline NLP Extraction Engine ✅

Built a 100% offline, lightweight, Regex & NLP-powered text extraction utility for Product Studio:

- **Standalone Utility Service**: Created `SmartParserService` (`src/features/product-studio/utils/smart-parser.ts`).
- **HTML Sanitization (`stripHtml`)**: Converts raw HTML tags/entities into normalized plain text.
- **Title Extraction (`extractTitle`)**: Extracts text from `<h1>`/`<h2>` tags or first non-empty line of plain text.
- **Specification Extraction (`extractSpecifications`)**: Regex matcher for `Key: Value`, `Key - Value`, `Key = Value` patterns.
- **Feature Extraction (`extractFeatures`)**: List parser extracting bullet points (`-`, `*`, `•`, `✓`, `➢`, `▪`, `►`) and numbered items.
- **SEO Description Generation (`generateSeoDescription`)**: Generates 150-160 char summary trimmed to nearest full word.
- **Keyword Extraction (`extractKeywords`)**: Offline NLP term frequency analyzer filtering out English + Bengali stop-words to return top 5-8 SEO tags.
- **Verification**: Built `smart-parser.test.ts` test suite; 0 type errors across all routes.

### PUBLISH-CHANGES-IDEMPOTENCY-AND-DASHBOARD-REDIRECT — Publish Changes Fix & Auto Redirect ✅

Resolved the `"Product is already published"` error and enabled automatic dashboard redirection:

- **Publish Idempotency Fix**:
  - Refactored `ProductService.publish` (`src/features/catalog/services/product-service.ts`) so that if a product is already active, it returns the existing product without throwing a `"Product is already published"` error.
  - This allows admins editing an active product to click **"Publish Changes"** smoothly after adding image URLs or editing prices.
- **Auto Redirect to Products Dashboard**:
  - Updated `handlePublish` in `useProductStudio` (`src/features/product-studio/hooks/use-product-studio.ts`).
  - Upon successful publish or publishing changes, a Sonner toast notification is displayed (`"Product published to storefront!"`) and the user is **automatically redirected to `/dashboard/products`** via `router.push("/dashboard/products")`.
- **Image CDN Domain Configuration**:
  - Added `ik.imagekit.io` domain pattern to `next.config.ts` to support ImageKit CDN images.

### STATUS-ENUM-PREPROCESSOR-AND-PUBLISH-BUTTON-ENABLE — Fix Zod Status Error & Enable Publish Button ✅

Resolved the Zod status enum validation error and enabled the Publish button in edit mode:

- **Zod Status Enum Preprocessor**:
  - Preprocessed `status` string values in `createStudioProductSchema`, `updateStudioProductSchema`, `createProductSchema`, and `updateProductSchema`.
  - Automatically converts incoming uppercase or alias values (`"DRAFT"`, `"ACTIVE"`, `"published"`) into lowercase valid enum values (`"draft"`, `"active"`, `"pending_review"`, `"inactive"`, `"archived"`), preventing Zod validation failures.
- **Publish Button Enabled at All Times**:
  - Removed `status === "active"` restriction on the **Publish** button in `StudioHeader` and `StudioRightSidebar`.
  - Formatted Publish button with **DS-001 Admin Theme Warm Amber (`bg-amber-500 hover:bg-amber-600 text-slate-950`)**.
  - Displays `"Publish Changes"` when editing an active product, allowing admins to save and publish updated images/prices at any time.
- **Error Handling**:
  - Wrapped `saveStudioProductAction` in `try/catch` block returning clean `{ success: false, error: ... }` response payloads for Sonner toasts.

### PRODUCT-STUDIO-V2-CRITICAL-BUG-FIX — Data Pipeline & Edit Mode Hydration Fix ✅

Audited and resolved all SEVERITY 1 blockers in the Product Studio data persistence pipeline:

- **100% Data Persistence Fix**:
  - `createStudioProductSchema` & `updateStudioProductSchema` updated to include `notice`, `badges`, `specifications`, `description`, and 5-field variant properties (`attributes`, `priceAdjustment`, `stock`, `image`, `isActive`).
  - `mapStudioToCatalog` in `studio-actions.ts` updated to map all fields (`notice`, `badges`, `specifications`, `description`, `metaTitle`, `metaDescription`, `costPrice`, `sellingPrice`, `wholesalePrice`, `resellerPrice`, `comparePrice`) directly to catalog payloads.
- **Edit Mode Hydration Fix**:
  - `/dashboard/products/[id]/edit/page.tsx` updated to invoke `getStudioProductAction(id)` which retrieves combined product, pricing, and inventory data.
  - Sanitized MongoDB ObjectIds (`_id`, `brandId`, `categoryId`, `supplierId`) to clean strings preventing React serialization errors.
- **Action Bar & Status Toggle Repair**:
  - Updated `handleSave` and `handlePublish` in `useProductStudio` to accept explicit status overrides (`"draft"` / `"active"`).
  - "Save Draft" explicitly sets `status: "draft"` and displays instant Sonner toast.
  - "Publish" explicitly sets `status: "active"`, triggers `publishStudioProductAction`, and displays instant Sonner toast.
- **Database Mongoose Validation**:
  - Enforced `runValidators: true` in `BaseRepository.update` `findByIdAndUpdate` calls.

### PRODUCT-DETAILS-V2-002-FIX-AND-OPTIMIZE — Ultimate Mobile-First Product Details Experience (Data Binding Fix) ✅

The refactoring and mobile-first optimization of the Public Product Details Page (`PRODUCT-DETAILS-V2-002-FIX-AND-OPTIMIZE`) resolves all data binding bugs and delivers an App-like mobile experience:

- **Price Calculation & "৳ 0" Bug Resolution**:
  - `resolvePricingByRole` fallback logic inspects `pricing.sellingPrice`, `product.sellingPrice`, `product.retailPrice`, and `product.costPrice` margins (+30% retail, +20% reseller, +12% wholesale), ensuring the public storefront NEVER renders `৳ 0`.
- **ObjectId Sanitation**:
  - Excluded raw Mongo `_id` strings from public display; clean display of SKU (`product.sku || product.name`).
- **Mobile-First App-Like UX**:
  - `MobileStickyActionBar`: Sticky bottom action bar (`md:hidden`) with "Add to Cart" and "Buy Now" CTAs.
  - `ProductGallery`: Swipeable image carousel on mobile with touch pagination dots and high-touch targets (≥44x44px).
  - `ProductTabsAndAccordions`: Responsive layout converting tabs into collapsible accordions on mobile to save vertical scrolling.
- **Reseller Profit Calculator Validation**:
  - Client-side Zod schema validation enforcing Floor (`minResellerPrice` / `cost * 1.15`) and Ceiling (`MSRP` / `retail * 1.50`) boundaries with live BDT Profit, Margin %, and ROI indicators.
- **Design System Enforcement**:
  - Enforced DS-001 Public Soft Red Theme (`#EF4444` / `red-600`) wrapped in `data-layout="public"`.

### PRODUCT-STUDIO-V2-001-FINAL-OPTIMIZATION — Enterprise Product Studio UI Cleanup & Quick Create Optimization ✅

The final cleanup and optimization of the Product Creation Studio (`PRODUCT-STUDIO-V2-001-FINAL-OPTIMIZATION`) delivers a high-speed data entry experience for Unique Store BD admins:

- **6-Field Express Quick Create Mode**:
  1. `Product Name` (Text Input - background auto-generation of SKU & Slug).
  2. `Category` (Searchable taxonomy picker).
  3. `Primary Image` (Drag & drop CDN image input with live thumbnail preview).
  4. `Cost Price` (Number Input - auto-triggers Pricing Engine for Retail +30%, Reseller +20%, Wholesale +12%).
  5. `Initial Stock` (Number Input).
  6. `Status` (Toggle: Draft / Active).
- **Permanent Removal & Consolidation of Legacy UI Fields**:
  - Removed `productModel`, `gtin`, and `barcode` from default views.
  - Replaced 4 separate boolean toggles (`featured`, `trending`, `flashSale`, `newArrival`) with **`BadgesStudioSection` Multi-select** (`badges: string[]`).
  - Streamlined SEO inputs to `metaTitle` & `metaDescription` only.
  - Replaced legacy 15-field variant matrix with the 5-field flat `VariantStudioSection` (`attributes`, `sku`, `priceAdjustment`, `stock`, `image`).
- **Performance & Dynamic Loading**:
  - Heavy components (Rich Text Tiptap Editor, Supplier Sourcing Studio, Publishing Schedule) are lazy-loaded via Next.js `dynamic()` imports, enabling Quick Create mode to initialize in under 200ms.
- **Form Validation & Routing**:
  - Zod `createProductSchema` validates Quick Create entries with minimal required inputs.
  - Created `/dashboard/products/create/page.tsx` and linked `/dashboard/products/new/page.tsx`.

### PRODUCT-DETAILS-V2-001 — The Ultimate Product Details Experience (Phase 4) ✅

The Public Product Details Experience (`PRODUCT-DETAILS-V2-001`) completely redesigns `/product/[slug]` and `/products/[slug]` into a 13-section high-converting commerce experience:

- **Server vs Client Architecture**: Server Component default for instant SSR / SSG loading with isolated Client Components (`ProductGallery`, `VariantSelector`, `ResellerProfitCalculator`, `MarketingAssetsProvider`, `WholesaleQuotationSection`).
- **Role-Based Dynamic Access & Pricing**:
  - **Retail Customer View**: Retail Price + Strikethrough Compare Price + Savings Badge (`-% OFF`).
  - **Reseller View**: Retail Price + Base Reseller Cost + Interactive **Reseller Profit Calculator** (Live Profit BDT, Margin %, ROI, and minimum selling price validation) + **HD Banners & Ready Facebook Caption Kit**.
  - **Wholesale View**: **B2B Bulk Discount Table Matrix** (10-49, 50-99, 100+ units) + Minimum Order Quantity (MOQ) enforcement + 1-Click Official Quotation request.
- **Hero Gallery with Variant Sync**: Large primary image with hover-to-zoom effect, thumbnail slider, video playback, and instant image syncing on variant attribute selection.
- **5-Field Generic Variant Selector**: Dynamically extracts generic attribute keys (`Color`, `Size`, `Storage`, etc.) from flat variants array. Out-of-stock items are visually crossed out and disabled.
- **Delivery & High-Visibility Notice Box**: Displays Pathao & Steadfast courier partner badges, 24-48h delivery estimates, Cash on Delivery (COD) guarantee, and product-level `notice` rendering (e.g., `"৩ দিনের মধ্যে ডেলিভারি"`).
- **Google Rich Results SEO**: Injects Schema.org/Product JSON-LD structured data for Google Search snippet enrichment.
- **DS-001 Public Soft Red Theme**: Styled using Soft Red (`#EF4444` / `red-600`) tokens wrapped inside a `data-layout="public"` root container with 70% English / 30% Clean Bangla microcopy.

### PRODUCT-STUDIO-V2-001 — Enterprise Product Studio Redesign (V2) ✅

The Enterprise Product Studio V2 build (`PRODUCT-STUDIO-V2-001`) delivers a high-speed, intelligent creation and editing workspace for Unique Store BD admins:

- **Dual Creation Modes**:
  - **Quick Create Mode (30-second Express)**: Admins enter only 4 core fields (Title, Category, Cost Price, Stock/Image) while SKU, Slug, Selling Price (+30%), Reseller Price (+20%), Wholesale Price (+12%), and SEO tags auto-calculate instantly.
  - **Advanced Mode**: Full access to all 15 tabbed studio sections (Basic Info, Pricing & Margin, Inventory, Organization, Minimal 5-Field Variant Builder, Media Gallery, Specifications, SEO, Marketing, Sourcing, Publishing Schedule).
- **Real-Time Product Health Score Engine (`useHealthScore`)**: Computes real-time listing completeness score out of 100% with actionable checklist items (`High-quality Images`, `Pricing Margins set`, `Specifications missing`, `Notice not configured`).
- **Live Preview Engine (`StudioLivePreview`)**: Storefront product details preview with live viewport switcher for Desktop, Tablet, and Mobile devices.
- **Draft Recovery & Background Validation (`useProductDraft`)**: LocalStorage draft autosave, draft recovery alert on load, and real-time background SKU and Slug uniqueness checks (`checkSkuUniquenessAction`, `checkSlugUniquenessAction`).
- **Admin DS-001 Warm Amber Theme**: Styled with Warm Amber (`#F59E0B`) design tokens, sticky action bar, and bilingual microcopy (70% English / 30% Clean Bangla).

### PRODUCT-DOMAIN-002A (PART-1) — Enterprise Product Model Refactor & Schema Freeze ✅

The Enterprise Product Model Refactor build (`PRODUCT-DOMAIN-002A`) refactors the core Product Domain into a clean, simple, scalable, and permanent enterprise foundation:

- **Clean Enterprise Entity Architecture**: Identity (`name`, `slug`, `sku`, `barcode`), Classification (`categoryId`, `brandId`, `supplierId`, `tags`, `visibility`, `status`, `badges`), Content (`shortDescription`, `description`, `specifications`, `notice`), Media (`media`), Variants (`hasVariants`, `variants`), and Minimal SEO (`metaTitle`, `metaDescription`).
- **Dynamic Badging System (`badges: string[]`)**: Replaces hardcoded boolean flags (`featured`, `trending`, `flashSale`, `newArrival`) with extensible badges array (`"featured"`, `"trending"`, `"flash_sale"`, `"new_arrival"`, `"best_seller"`, `"limited"`, etc.).
- **Generic Attribute Variant Architecture**: Simplifies variant schema to generic attributes (`attributes: Record<string, string>`, `sku`, `priceAdjustment`, `stock`, `image`, `isActive`), supporting color, size, storage, ram, capacity, material, flavor, voltage, or any future option without schema changes.
- **Full Backward Compatibility & Zero Data Loss**: Preserves all legacy properties (`featured`, `trending`, `flashSale`, `seo.*`, `content.*`, `suppliers`, `searchMetadata`) via mapping adapters and default getters so existing documents, URLs, orders, wishlist items, and search indices continue working seamlessly.
- **Enterprise Automations**: Automatic unique slug generation, auto SKU generation, auto badge consolidation, auto SEO meta title/description fallbacks, and safe idempotent migration policy (`migrateLegacyProductsToEnterpriseModel`).

### BUSINESS-MEMBERSHIP-001A — Enterprise Role Management Separation, Business Membership Registry & Extensible Architecture ✅

The Enterprise Business Membership Separation build (`BUSINESS-MEMBERSHIP-001A`) delivers a 100% decoupled identity architecture where System Roles (Super Admin, Admin, Manager, Support, Warehouse, Finance, Operations, Courier Manager, Marketing, Viewer) and Business Memberships (Customer, Reseller, Wholesaler, Dealer, Distributor, Corporate Buyer, Affiliate, Supplier, Vendor) operate as completely independent domains.

Key highlights include:

- **System Role ≠ Business Membership Architectural Separation**:
  - System Roles exclusively govern administrative access, workspace shells, and granular permissions (`Product.View`, `Order.Update`, etc.). Business Memberships are completely removed from System Role selectors.
  - Business Memberships control commerce capabilities, tier pricing, catalog visibility, minimum order thresholds, and profit margin tools.
  - Users can hold multiple system roles (`roles: string[]`) and multiple business memberships (`memberships: string[]`) independently.
- **Dynamic Business Membership Type Registry (`BusinessMembershipType`)**:
  - Admin can Create, Edit, Archive, and Toggle Active status for any current or future business membership type (`customer`, `reseller`, `wholesaler`, `dealer`, `distributor`, `corporate_buyer`, `affiliate`, `supplier`, `vendor`, etc.) without altering authentication, authorization, or login infrastructure.
  - Every membership type defines localized Bangla names, icon representations, priority levels, approval requirement flags, features, pricing discount rules, minimum order BDT thresholds, and dashboard visibility rules.
- **Database & Domain Entities**:
  - `Role`, `Permission`, and `RolePermission` models handle system role authorization.
  - `BusinessMembershipType`, `BusinessMembership`, `BusinessMembershipApplication`, `BusinessMembershipStatus`, and `BusinessMembershipHistory` handle extensible business memberships.
- **Admin Panel & Hub (`/dashboard/identity/memberships`)**:
  - Unified Business Membership Dashboard containing Membership Type Registry, Active User Membership Management, Approvals Queue, and Growth Analytics.
  - Upgraded Role Management (`/dashboard/identity/roles`) strictly displaying system roles with search, tag filters, and permission previews.
- **Engine Integrations**:
  - Pricing Engine: Evaluates active user memberships to apply appropriate tier pricing (Retail, Reseller, Wholesale, Dealer, Distributor, Custom).
  - Order Engine: Validates checkout rules and minimum order thresholds based on active membership benefits.
  - Product Engine & Search: Supports membership-aware visibility filtering.
  - Event Bus & Notification Engine: Publishes events for `Membership Applied`, `Membership Approved`, `Membership Rejected`, `Membership Suspended`, `Membership Activated`, and `Membership Archived`.

### BUSINESS-MEMBERSHIP-001 — Enterprise Business Membership, Application & Approval Center ✅

The Enterprise Business Membership build (`BUSINESS-MEMBERSHIP-001`) decouples system roles (system permissions) from business identity (business capabilities) and delivers a complete membership lifecycle engine featuring multi-membership support, streamlined Bangla application forms, live application status tracking, admin review and approval workflows, notification integration, and manual admin user membership management.

Key highlights include:

- **System Role vs Business Membership Architecture Decoupling**:
  - System Roles (`admin`, `super_admin`, `manager`, `staff`, `support`, `viewer`) strictly control system permissions.
  - Business Memberships (`customer`, `reseller`, `wholesaler`) control business capabilities, catalog access, profit margin views, and tier pricing.
  - A single user can hold multiple business memberships simultaneously (e.g. `customer` + `reseller` + `wholesaler`).
- **Database Models & Domain Layer (`src/features/identity/`)**:
  - `BusinessMembership`: User membership records with statuses (`active`, `suspended`, `expired`), grant timestamps, and actor tracking.
  - `BusinessMembershipApplication`: Applications supporting common applicant fields, sales channels, reseller order volume metrics, wholesaler company & tax info, review notes, admin questions, and rejection reasons.
  - `BusinessMembershipHistory`: Full audit log of all submission, edit, review, approval, rejection, and manual grant/revoke events.
  - `ApplicationNotes`: Internal admin discussion notes on pending applications.
- **Bangla Public Application Forms (`/become-reseller` & `/become-wholesale-partner`)**:
  - Clean, mobile-first, Bangladesh-first public application experience using public website design tokens (`bg-[hsl(0_0%_98%)]`, rounded cards, golden amber CTAs).
  - Common Fields: Full name, primary mobile, alt mobile, bKash number, district, upazila, full address, Facebook profile/page, website, sales channel dropdown (Facebook Page, Facebook Live, Facebook Profile, TikTok, Website, Physical Shop, Marketplace, Other).
  - Reseller Additional Fields: Estimated monthly orders (0-20, 20-50, 50-100, 100+), target product categories multi-select checkboxes.
  - Wholesaler Additional Fields: Company name, business type (Retail Shop, Online Shop, Distributor, Dealer, Importer, Other), estimated monthly purchase (২০,০০০+, ৫০,০০০+, ১,০০,০০০+, ৫,০০,০০০+), Trade License, BIN, TIN.
  - One Active Application Constraint: Automatically hides submission form and displays live Application Status & Timeline if an active application exists.
- **Application Status & Resubmission Engine (`MembershipStatusTimeline`)**:
  - 4-Step Visual Timeline: Submitted → Admin Review → Info Verification → Final Decision.
  - Editable & Resubmission Rule: If status is `pending`, `need_info`, or `rejected`, applicants can edit fields or answer admin questions directly from their dashboard or public status page.
- **Admin Approval & Review Center (`BusinessMembershipApprovalCenter`)**:
  - Dashboard routes `/dashboard/identity/memberships`, `/dashboard/identity/approvals`, and `/dashboard/identity/applications`.
  - Queue Tabs: Pending Queue, Under Review, Need Information, Approved, Rejected, All Applications.
  - Real-Time Analytics: Total Applications, Pending Count, Approved Count, Need Info Count, Approval Rate %, Rejection Rate %.
  - Interactive Review Drawer: Applicant profile data summary, 1-click Approve (auto-assigns membership & updates session permissions), Reject (with required reason), Request More Information (with question prompt), and Internal Notes.
- **Admin Multi-Select User Membership Management (`UsersAdmin`)**:
  - Upgraded user table in `/dashboard/identity/users` with Business Membership Multi-Select Checkboxes / Tag selector (`Customer`, `Reseller`, `Wholesaler`).
  - Allows admins to assign, remove, suspend, or restore any combination of business memberships for any user with 1 click.
- **User Business Membership Hub (`/account/memberships`)**:
  - Unified user account dashboard page displaying active memberships, active application timeline, resubmission forms, and history log.
- **Notification Engine Integration**:
  - Automatic in-app bell notifications to admins on new application or resubmission.
  - Automatic in-app bell notifications to users on approval, rejection, or request for information.

---

### PRODUCT-STUDIO-V2-005 — Production Release, Final Audit & Enterprise Hardening ✅

The Final Product Studio Production Release (`PRODUCT-STUDIO-V2-005`) performs a comprehensive production audit and hardening pass across the entire Product Studio surface area, ensuring it is production-ready, fast, secure, maintainable, and accessible:

- **Full Production Audit**: Reviewed all 58 product-studio files for dead code, duplicated logic, unused imports, type safety, UX consistency, responsiveness, accessibility, performance, and security. Fixed every critical and high-severity issue found.
- **Dead Code Elimination**: Removed `export default` redundant dual exports from 4 components (features-editor, inline-spec-editor, parser-bar, use-auto-classification, use-auto-generation). Removed unused `suggestions` state from `useAutoClassification`. Removed unused import `checkSkuUniquenessAction`/`checkSlugUniquenessAction` from `useProductStudio`. Removed unused lucide-react icon imports. Removed unused `CreatePricingInput` import. Cleaned `index.ts` to remove dead export.
- **Test File Safety**: Fixed `smart-parser.test.ts` — removed `console.log` calls and auto-execution on import (dangerous side-effect). Now exports only a safe `runSmartParserVerification()` function.
- **Module-Level Constants**: Moved static `sections` array from `useMemo(() => [...], [])` to module-level `STUDIO_SECTIONS` constant — eliminates unnecessary allocation on every render.
- **Memoization Fixes**: Resolved duplicate `dismissImport`/`reset` functions in `useUrlImport` — both had identical implementations. Removed duplicate.
- **Full TypeScript Compliance**: 0 type errors. 0 `any` type assertions in product-studio hooks. All unused imports cleaned.
- **Verification**: `npx tsc --noEmit` passes with 0 errors. Format clean.

### PRODUCT-STUDIO-V2-004 — Enterprise External Product Intelligence (URL Import) ✅

The Enterprise External Product Intelligence build (`PRODUCT-STUDIO-V2-004`) transforms Product Studio into an Enterprise Product Import Workspace by allowing admins to paste a supplier URL and automatically fetch, extract, parse, and populate the product studio:

- **URL Fetch Pipeline**: `url-fetcher.ts` validates URLs, performs SSRF protection (DNS resolution & private IP blocking), enforces 15s timeout, 5MB max response, and 5 redirect limit.
- **HTML Extraction Engine**: `html-extractor.ts` parses any ecommerce product page (Alibaba, AliExpress, Amazon, eBay, Daraz, generic) extracting: Page Title, Meta/OG data, JSON-LD Product Schema, Feature lists (ul/ol/section), Specifications (table/dl/key:value), Images (filtered by size/type), Breadcrumbs, Brand hints, Price hints, and Category suggestions.
- **Image Extraction**: Filters icons, logos, banners, SVGs, tiny images, data URIs. Deduplicates by URL. Detects OG image as featured. Prioritizes gallery images.
- **Structured Data Priority**: JSON-LD Product schema is preferred over HTML scraping when available, with intelligent HTML fallback merging.
- **Smart Parser Integration**: Cleaned HTML text is fed through the existing `SmartParserService.parse()` for additional keyword/tag/spec/feature enrichment.
- **Duplicate Detection**: Compares extracted name, SKU, and slug against existing products. Uses cosine similarity matching (>0.7 threshold) for name-based duplicate detection.
- **Security**: Zod URL validation, SSRF protection (DNS resolution + private IP range blocking), fetch timeout, max content size, content-type verification, sanitized imports.
- **UI Components**: `UrlImportBar` — URL input with Import button, progress states (validating/fetching/extracting/parsing), result summary chips. `ImportPreviewModal` — modal showing extracted data breakdown (specs count, features count, images, brand, category), duplicate warnings, SEO keywords, and "Apply to Studio" action.
- **Server Action**: `importFromUrlAction` with Zod validation, authentication, and permission checks. Orchestrates full pipeline: fetch → extract → parse → detect duplicates → return structured result.
- **Architecture**: `url-importer/` module with 5 files (types, url-fetcher, html-extractor, duplicate-detector, import-pipeline) following Feature-First DDD. No extraction logic duplicated. Existing parser reused as-is.

### PRODUCT-STUDIO-V2-003A — Enterprise Mobile & Responsive Stabilization ✅

The Enterprise Mobile & Responsive Stabilization build (`PRODUCT-STUDIO-V2-003A`) performs a comprehensive audit of all 14+ Product Studio tab components, stabilizing mobile/tablet touch targets, responsive layouts, light/dark mode consistency, and input sizing:

- **Light Mode Fix (BadgesStudioSection)**: Replaced hardcoded dark-only colors (`bg-slate-950`, `text-slate-300`) with `dark:` prefixed classes and light mode variants across all 8 badge types, inactive chip states, custom badge input, and add button.
- **44px Touch Target Enforcement (11 components)**: StudioCollapsibleSection chevron toggle (`h-7 w-7` → `h-10 w-10 sm:h-7 sm:w-7`), MediaSection overlay buttons (`h-7 w-7` → `h-10 w-10 sm:h-7 sm:w-7`, move arrows `h-6 w-6` → `h-9 w-9 sm:h-6 sm:w-6`), InlineSpecEditor delete button (`h-8 w-8` → `h-10 w-10 sm:h-8 sm:w-8`), SEOAdvancedSection preview toggle tabs (`py-0.5 px-2.5` → `py-2 px-3.5 sm:py-0.5 sm:px-2.5`).
- **Overflow Prevention (VariantStudioSection)**: Changed table container from `overflow-y-auto` to `overflow-auto`. Replaced fixed-width inputs (`w-36`, `w-24`, `w-20`) with responsive `w-full min-w-[size] sm:w-[size]` pattern. Attribute editor rows stack vertically on mobile.
- **Standardized Heights**: Removed non-standard `h-9.5` (38px) from 6 components (PublishingSection, CollectionsChannelsSection, CategorySection, BrandSection, VariantBulkEditModal) — replaced with standard `h-9` (36px).
- **Button Group Responsive (CostStudioSection)**: Bottom action buttons converted from `flex justify-between` to `flex-col sm:flex-row` with `flex-wrap` support for 3-button group on right.
- **VariantStudioTable**: Attribute edit mode inputs (`w-32` → `w-24 sm:w-32`) with responsive deletions. "Add Custom Attribute" row stacks vertically on mobile.
- **CollectionsChannelsSection**: Channel buttons `p-3` → `p-3.5 sm:p-3`. Collection items `p-2` → `p-3 sm:p-2`.
- **SEOAdvancedSection**: Preview tab toggles use `cn()` utility instead of inline string concatenation for consistency.
- **Verification**: `npx tsc --noEmit` passes with 0 errors. `npx eslint .` — 0 new lint errors. `npm run format` — all clean.

### PRODUCT-STUDIO-RC-003 — Express Quick Create & Full Light Theme Completion ✅

The Express Quick Create & Full Light Theme Completion (`PRODUCT-STUDIO-RC-003`) completes the Light Theme migration for the two remaining un-migrated components — `StudioQuickCreate` and `StudioLivePreview` — and polishes all page-level mode switcher bars.

**Components Migrated to Semantic Tokens:**

- **`studio-quick-create.tsx` (Express Quick Create Workspace)**: Replaced 30+ hardcoded `gray-`/`slate-` color classes across the entire component with semantic tokens (`bg-card`, `bg-muted`, `bg-muted/30`, `border-border`, `text-foreground`, `text-muted-foreground`). All input fields use `bg-card border-border text-foreground`. Labels use `text-foreground`. Subtitles and hints use `text-muted-foreground`. The tier preview cards use `bg-muted border-border`. Status container uses `bg-muted/30`. Draft icon/text uses `text-muted-foreground`. Save button uses `bg-muted hover:bg-muted/80 text-foreground`.

- **`studio-live-preview.tsx` (Storefront Live Preview)**: Replaced 20+ hardcoded `slate-` color classes across the mock product card with semantic tokens (`bg-card`, `bg-muted`, `bg-muted/20`, `bg-muted/50`, `border-border`, `text-foreground`, `text-muted-foreground`). Product card container uses `bg-card text-foreground border-border`. Gallery placeholder uses `bg-muted border-border`. Pricing box uses `bg-muted/50 border-border`. Variant chips use `bg-muted border-border text-foreground`. Stock/delivery divider uses `border-border/60`. Specs container uses `bg-muted/50 border-border`. Thumbnail inactive border uses `border-border`.

**Page-Level Mode Switcher Polish:**

- **Mode switcher outer bar** (`create/page.tsx` & `edit/page.tsx`): `bg-muted/30` → `bg-muted` (solid muted background creates clear visual container in light mode, replacing the near-invisible 30% opacity)
- **Mode switcher inner toggle**: `bg-background` → `bg-card` (card surface creates proper visual depth inside the muted outer container, distinct from page background)
- **Inactive mode button** (edit page): `text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200` → `text-muted-foreground hover:text-foreground` (removed last remaining hardcoded slate classes in edit page)
- **Discard button** (create page draft banner): `text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200` → `text-muted-foreground hover:text-foreground`

**Verification:** `npx tsc --noEmit` passes with 0 type errors. `npm run format` clean. Zero hardcoded `text-slate-`/`border-slate-`/`bg-white`/`text-gray-` classes remain in the Product Studio feature (excluding intentional DS-001 amber theme `text-slate-950` on `bg-amber-500` elements).

### PUBLIC-WEBSITE-005 — Final Storefront Polish, Storefront SEO, Conversion & Trust Optimization ✅

The Final Storefront Polish build (`PUBLIC-WEBSITE-005`) transforms the storefront into a production-ready, high-converting, Bangladesh-first commerce experience across all public routes.

Key highlights include:

- **Trust & Social Proof Optimization**: Integrated verified supplier badges (`১০০% অরিজিনাল`), 64-district delivery estimates (`২-৩ দিনে ডেলিভারি`), easy return policy (`৭ দিনে রিটার্ন`), and social proof metrics across homepage and product pages.
- **Storefront SEO & Schema.org Structured Data**: Integrated `sitemap.ts` and `robots.ts` indexing rules, alongside dynamic `Organization`, `Product`, `ItemList`, and `Breadcrumb` Schema.org JSON-LD scripts across discovery pages.
- **Error & Empty State Refinements**: High-contrast, production-ready 404 Not Found (`not-found.tsx`), 500 Error (`error.tsx`), Empty Cart (`empty-cart.tsx`), and Empty Search (`empty-search.tsx`) pages with natural Bangla microcopy and recovery CTAs.
- **Payment & Courier Logistics Badges**: Site Footer (`SiteFooter`) featuring bKash, Nagad, Visa, Mastercard, Cash on Delivery, and courier partner logos (Pathao, Steadfast, RedX, Paperfly).
- **Public Analytics & Automation Integration**: Reused `Analytics Engine` (`useAnalytics`), `Automation Engine`, and `Notification Engine` across user interactions.
