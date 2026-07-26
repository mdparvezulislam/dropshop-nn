# PUBLIC-WEBSITE-001: Enterprise Storefront Redesign

## Status: Spec (Draft)

## Date: 2026-07-23

---

## 1. Goal

Redesign the public DropshopNN storefront homepage from the existing dark-mode amber theme to a white/soft-warm-gray + soft red accent aesthetic inspired by Stripe, Apple, Linear, and Daraz. The admin workspace (4 role dashboards) retains its existing amber DS-001 tokens unchanged.

## 2. Scope

- **In scope:** Homepage only (`src/app/(website)/page.tsx` and all imported section components)
- **Out of scope:** Product listing, product detail, cart, checkout, auth, blog, CMS pages
- **Out of scope:** All admin/workspace UI (dashboard, reseller, wholesale, supplier)

## 3. Architecture

### 3.1 New `features/public/` engine

```
src/features/public/
  styles/
    public-theme.css    # CSS variable overrides for [data-layout="public"]
  types/
    index.ts            # Public-specific types (shared with existing domain types)
```

### 3.2 Theme scoping

The `(website)` layout wraps content in `<div data-layout="public">`. The `public-theme.css` file uses `[data-layout="public"]` as a scope selector to override CSS custom properties. No global token changes.

The root layout (`src/app/layout.tsx`) imports `public-theme.css` globally. The admin workspace pages are NOT nested inside `[data-layout="public"]` so they retain existing amber tokens.

## 4. Color System (Public Theme Override)

```css
[data-layout="public"] {
  --primary: 0 84% 60%; /* #EF4444 Soft Red */
  --primary-foreground: 0 0% 100%;
  --accent: 0 85% 96%; /* #FFF0F0 Light red tint */
  --accent-foreground: 0 74% 42%; /* #C62828 */
  --ring: 0 84% 60%; /* Red focus ring */
  --background: 0 0% 98%; /* #FAFAFA Soft white */
  --card: 0 0% 100%; /* Pure white cards */
  --muted: 0 0% 96%; /* Light warm gray */
  --border: 0 0% 91%; /* Soft borders */

  --shadow-xs: 0 1px 2px hsl(0 0% 0% / 0.04);
  --shadow-sm: 0 1px 3px hsl(0 0% 0% / 0.05);
  --shadow-md: 0 4px 12px hsl(0 0% 0% / 0.06);
  --shadow-lg: 0 12px 32px hsl(0 0% 0% / 0.08);
}
```

Background pattern: subtle grid (`repeating-linear-gradient` or `background-image` with light lines).

## 5. Component Refactoring Plan

All existing components in `src/components/website/sections/` are refactored in place:

### 5.1 Hero Section

- Split layout: left column (headline, description, CTA, trust bar), right column (banner slider with auto-rotation and dots)
- Background: soft white, subtle grid pattern overlay
- Headline: "Source, Sell & Scale Across Bangladesh" — large display text
- CTAs: solid red "Browse Products" + outlined "Become a Reseller"
- Trust bar: horizontal row of 3 items (icons + label + subtext)

### 5.2 Category Showcase

- Grid of 8 large rounded cards (aspect ratio ~4/3 or 3/2)
- Card: pure white, soft shadow, hover elevation + border/ring accent
- Category image or letter avatar fallback
- Title, product count subtitle
- "View All" link

### 5.3 Featured Products Section

- Section header with Sparkles icon, title, subtitle
- ProductGrid (reuses existing `ProductCard` component)
- Alternating section backgrounds (white → very light warm gray)

### 5.4 Trending / New Arrivals / Flash Deals

- Same pattern as featured products
- Flash deals cards have red "SALE" countdown badge on image

### 5.5 Brand Slider

- Auto-scroll horizontal row of brand logos
- Grayscale by default, full color on hover
- Pause on hover

### 5.6 Why Choose Us

- 3-column or 3x2 grid of premium icon cards
- Card: icon (red tint), title, short description
- Soft card bg, shadow-sm

### 5.7 How It Works

- Numbered steps (1-2-3 or 1-4)
- Horizontal desktop, vertical mobile
- Connector line between steps
- Each step: number badge (red), icon, title, description

### 5.8 Role Highlights

- Three role cards: Reseller, Wholesaler, Supplier
- Benefit list + red CTA button per card
- Different icon per role

### 5.9 Testimonials

- Clean quote cards with avatar, name, role, star rating
- Horizontal scroll or 3-column grid
- Soft card bg, subtle red quote mark accent

### 5.10 Latest Blog Preview

- 3 blog cards: image, category badge, title, excerpt, date
- Link to blog page

### 5.11 Newsletter

- Minimal: "Stay Updated" heading, short description
- Email input + red submit button
- Card-style container with soft border

### 5.12 Footer CTA

- Large section with red accent gradient background
- Two CTAs: "Start Selling" (reseller) and "Browse Products"
- Visible at bottom before footer

### 5.13 Site Header

- Sticky, white bg, subtle bottom border
- Logo (left) → nav links → search button → cart → account menu (right)
- Red "Become a Reseller" CTA in desktop nav

### 5.14 Site Footer

- White bg, thin red top accent bar
- Columns: Company info, Shop, Support, Company (legal)
- Contact info (phone, email, address)
- Social icons, payment icons, courier icons
- Copyright

## 6. Data Flow

No changes to data fetching. All existing server actions, repositories, and services are reused:

- `getPublicFeaturedProductsAction`
- `getPublicTrendingProductsAction`
- `getPublicNewArrivalsAction`
- `getPublicFlashDealsAction`
- `getPublicBrandsAction`
- `getPublicCategoriesAction`
- `listPublicBlogAction`

## 7. Shared Components Reused

- `Button` (ui/button.tsx) — all variants
- `Badge` (ui/badge.tsx) — for NEW/SALE badges
- `ProductCard` (website/product-card.tsx) — product cards
- `PriceDisplay` (website/price-display.tsx) — pricing
- `ProductGrid` (website/product-grid.tsx) — product grid layout
- `Skeleton` (ui/skeleton.tsx) — loading states
- `AnnouncementBar` — top bar
- `CartButton` — cart icon with count
- `AccountMenu` — user menu

## 8. Animations

- Framer Motion: fade-in + Y offset (10px) on scroll into view
- Button hover: slight scale + shadow elevation
- Card hover: translateY(-2px) + shadow-md
- Hero slider: horizontal crossfade auto-rotation (5s)
- Brand slider: continuous horizontal scroll
- Section reveal: staggered children

## 9. Performance

- Server components where possible (category showcase, featured, etc.)
- Client components only where interactivity needed (hero slider, brand slider, newsletter form)
- Image lazy loading
- No new data fetching or API calls

## 10. Responsive

- Desktop (1200px+): full layout, mega menu, 4-column grids
- Tablet (768-1199px): 2-3 column grids, collapsed nav
- Mobile (<768px): single column, hamburger menu, stacked sections
