# DropshopNN (ড্রপশপএনএন)

> Enterprise Commerce Operating System — বাংলাদেশের জন্য তৈরি

---

## ১. প্রজেক্ট পরিচিতি

**DropshopNN** একটি পূর্ণাঙ্গ, enterprise-grade dropshipping management ও logistics orchestration platform। এটি একক জায়গা থেকে product catalog, inventory, pricing, order, courier, finance এবং partner management পরিচালনার জন্য তৈরি।

### কেন DropshopNN?

বাংলাদেশের e-commerce ecosystem-এ dropshipping ও সম্পূর্ণ supply chain management-এর জন্য কোনো open-source, enterprise-grade সমাধান নেই। DropshopNN সেই শূন্যস্থান পূরণ করে।

### সমস্যা যা সমাধান করে

- Manual order processing ও courier management-এর জটিলতা
- একাধিক supplier ও reseller partnership পরিচালনার অদক্ষতা
- Real-time inventory ও pricing synchronization-এর অভাব
- Scalable commerce infrastructure-এর অনুপস্থিতি

### লক্ষ্য ব্যবহারকারী

- Dropshipping ব্যবসায়ী
- Reseller ও wholesale ক্রেতা
- Supplier (সরবরাহকারী)
- E-commerce enterprise
- Supply chain manager

### ব্যবসায়িক লক্ষ্য

একটি পূর্ণাঙ্গ **Commerce Operating System** তৈরি করা যা বাংলাদেশের e-commerce ecosystem-এর প্রতিটি অংশীদারের জন্য প্রযোজ্য — supplier থেকে শুরু করে end customer পর্যন্ত।

---

## ২. প্রধান বৈশিষ্ট্যসমূহ

| বৈশিষ্ট্য             | বর্ণনা                                                                          |
| --------------------- | ------------------------------------------------------------------------------- |
| **Catalog**           | Product, variant, media, SEO, brand ও category management                       |
| **Inventory**         | Stock level, reservation, supplier stock map, movement history                  |
| **Pricing**           | Cost / sell / wholesale / reseller price tier, profit calculation, rules engine |
| **Dropshipping**      | Automated order routing, supplier dispatch, courier integration                 |
| **Reseller**          | Private catalog, reseller-only pricing, collection, product group               |
| **Wholesale**         | Bulk ordering, tier pricing, MOQ management, quotation flow                     |
| **Supplier**          | Onboarding, contacts, documents, performance scoring, product mapping           |
| **Order**             | 16-state state machine, timeline, courier assignment, profit preview            |
| **Courier**           | Steadfast / Pathao / RedX / eCourier / Paperfly adapter সহ tracking             |
| **Finance**           | Wallet, ledger, withdrawal, invoice, profit release jobs                        |
| **Customer**          | Profile, address, note, tag, search, relationship timeline                      |
| **Analytics**         | Sales report, top product, inventory summary, performance dashboard             |
| **Automation**        | BullMQ-based background job, cache invalidation, event-driven flow              |
| **Report**            | Sales summary, profit analysis, product ও order report                          |
| **Notification**      | Order status update, quotation response, invoice reminder                       |
| **Marketplace Ready** | Multi-role, multi-tenant, REST API ও Server Action সমর্থন                       |

---

## ৩. প্রজেক্ট ভিশন

### Commerce Operating System

DropshopNN শুধু একটি app নয় — এটি একটি **Commerce OS**। এটি সকল e-commerce operation-কে একীভূত platform-এ নিয়ে আসে।

### Bangladesh First

Role-driven architecture সহ DropshopNN বাংলাদেশের e-commerce landscape-এর জন্য তৈরি। Courier integration থেকে শুরু করে bKash / Nagad payment — সবকিছু বাংলাদেশের প্রেক্ষাপটে।

### Scalable

Microservice-ready architecture, event-driven communication ও BullMQ background job সার্বিক scalability নিশ্চিত করে।

### Enterprise Ready

Production-grade feature: audit log, soft delete, transactional safety, role-based permission, এবং throttling।

### ভবিষ্যৎ সম্প্রসারণ

- Mobile app (Flutter)
- Multi-warehouse management (WMS)
- Payment gateway integration (bKash / Nagad / Rocket)
- Source code marketplace
- AI-driven pricing optimization

---

## ৪. Technology Stack

| স্তর                | Technology                      |
| ------------------- | ------------------------------- |
| **Framework**       | Next.js 16 (App Router)         |
| **Frontend**        | React 19, TypeScript            |
| **Styling**         | Tailwind CSS v4                 |
| **UI Component**    | Sera UI, shadcn/ui              |
| **Animation**       | Framer Motion                   |
| **Database**        | MongoDB, Mongoose               |
| **Cache**           | Redis (ioredis)                 |
| **Background Job**  | BullMQ                          |
| **Authentication**  | NextAuth v5 (JWT)               |
| **Validation**      | Zod                             |
| **Media**           | ImageKit CDN                    |
| **Form**            | React Hook Form                 |
| **Package Manager** | pnpm                            |
| **Cloud**           | Vercel / Docker / MongoDB Atlas |
| **CI/CD**           | GitHub Actions                  |
| **Hosting**         | Vercel / Coolify                |

---

## ৫. Architecture

### Feature-First DDD (Domain-Driven Design)

প্রজেক্টটি **Domain-Driven Design** অনুসরণ করে, যেখানে প্রতিটি feature একটি সম্পূর্ণ স্বতন্ত্র module।

```
Client (Next.js) → Server Action → Service Layer → Domain → Repository → MongoDB
                                                          ↓
                                                     BullMQ (Background)
```

### চার স্তরের Architecture

| স্তর             | অবস্থান                   | দায়িত্ব                                      |
| ---------------- | ------------------------- | --------------------------------------------- |
| **Domain**       | `domain/`                 | Entity, value object, business rules          |
| **Service**      | `services/`               | Business logic coordination, third-party call |
| **Repository**   | `repositories/`           | Database access, domain entity conversion     |
| **Presentation** | `actions/`, `components/` | Input validation, UI rendering                |

### Engine-based Architecture

প্রতিটি business domain একটি **Engine** হিসেবে নিবন্ধিত। Engine Registry pattern ব্যবহার করে core-এ সকল engine register, initialize ও verify হয়।

### Server Action First

সকল data mutation **Next.js Server Action**-এর মাধ্যমে সম্পন্ন হয়। Client component সরাসরি Server Action call করে — কোনো REST API layer নেই।

### Shared UI ও Reusable Component

`src/shared/components/ui/`-এ base UI component (Button, DataTable, Card, Dialog ইত্যাদি) এবং `src/shared/components/workspace/`-এ app shell component (Sidebar, Topbar, WorkspaceLayout, ResourceListPage) রাখা হয়েছে।

### Role-Driven Commerce

একটি platform, একটি catalog, একটি checkout, একটি pricing engine। Behavior শুধু **user role** অনুযায়ী বদলায় — Guest, Customer, Reseller, Wholesale, Supplier, Admin।

---

## ৬. Folder Structure

```
dropshop-nn/
├── docs/                          # Documentation
│   └── 00-project.md              # Project summary
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── auth/                  # Login, registration pages
│   │   ├── dashboard/             # Admin workspace
│   │   ├── reseller/              # Reseller workspace
│   │   ├── wholesale/             # Wholesale workspace
│   │   └── supplier/              # Supplier workspace
│   ├── features/                  # Feature modules
│   │   ├── auth/                  # Authentication & authorization
│   │   ├── catalog/               # Product catalog
│   │   ├── checkout/              # Checkout flow
│   │   ├── courier/               # Courier integration
│   │   ├── customer/              # Customer management
│   │   ├── finance/               # Wallet, ledger, invoice
│   │   ├── identity/              # User identity & profile
│   │   ├── inventory/             # Inventory management
│   │   ├── order/                 # Order management
│   │   ├── pricing/               # Pricing engine
│   │   ├── quotation/             # Quotation system
│   │   ├── reseller/              # Reseller platform
│   │   ├── reseller-workspace/    # Reseller workspace config
│   │   ├── supplier/              # Supplier platform
│   │   ├── supplier-workspace/    # Supplier workspace config
│   │   └── wholesale-workspace/   # Wholesale workspace config
│   ├── shared/                    # Shared code
│   │   ├── components/            # Shared UI
│   │   │   ├── ui/                # Primitives (Button, Card, Table...)
│   │   │   ├── workspace/         # App shell (Sidebar, Topbar...)
│   │   │   └── forms/             # Form components
│   │   ├── config/                # System configuration
│   │   ├── constants/             # Global constants
│   │   ├── core/                  # Feature flags, settings, platform
│   │   ├── errors/                # Custom error classes
│   │   ├── hooks/                 # Utility hooks
│   │   ├── lib/                   # Shared libraries
│   │   ├── platform/              # Platform bootstrap
│   │   ├── types/                 # Shared types
│   │   └── utils/                 # Helper functions
│   └── middleware.ts              # Route protection middleware
├── AGENTS.md                      # AI agent guidelines
└── README.md                      # This file
```

প্রতিটি feature module-এর অভ্যন্তরীণ কাঠামো:

```
features/<module-name>/
├── domain/              # Entity, type, event
├── repositories/        # Database access (Mongoose model + repository)
├── services/            # Business logic
├── actions/             # Server Actions
├── types/               # Zod validation schema
├── components/          # Feature-specific UI
├── hooks/               # Custom hooks
└── init.ts              # Engine initializer
```

---

## ৭. Business Engines

### Identity (`identity`)

User registration, authentication, business profile, role ও permission management। Session management ও third-party authorization সমর্থন করে।

### Catalog (`catalog`)

Product creation, variant generation, media upload, SEO metadata, brand ও category classification। Price বা stock এখানে রাখা হয় না — শুধু catalog data।

### Pricing (`pricing`)

সকল financial data এখানে: cost, selling price, wholesale ও reseller price, discount, tax, commission, margin। Rules engine fixed / percentage / supplier / category-based pricing সমর্থন করে।

### Inventory (`inventory`)

Stock tracking, reservation, incoming, damage/return tracking, supplier stock mapping। Stock operation: adjustment, stock in/out, এবং release।

### Supplier (`supplier`)

Onboarding, business profile, banking info, documents (trade license, BIN, TIN), performance scoring, product mapping।

### Product Studio (`product-studio`)

Enterprise product creation UI। Catalog, Pricing ও Inventory engine-কে একীভূত interface-এ orchestrate করে। Tiptap rich text editor, variant generator, এবং profit preview অন্তর্ভুক্ত।

### Checkout (`checkout`)

Cart management, checkout session, price resolution, inventory validation, order draft। Reseller / wholesale / customer type সমর্থন করে — একই pipeline, role অনুযায়ী behavior।

### Order (`order`)

16-state state machine (`draft` → `pending` → `confirmed` → `packed` → `courier_assigned` → `shipped` → `delivered` → `completed` + return/refund states)। Timeline, courier assignment, profit preview, note support।

### Finance (`finance`)

Wallet management (balance, pending profit), ledger entry (credit/debit), withdrawal request (bKash / Nagad / Rocket / bank), invoice generation, profit release jobs।

### Customer (`customer`)

Customer profile, address, note, tag, timeline, search। Reseller workspace tenant isolation সহ।

### Courier (`courier`)

Multi-provider support (Steadfast, Pathao, RedX, eCourier, Paperfly)। Tracking, webhook, business rules।

### Quotation (`quotation`)

Wholesale buyer-দের জন্য quotation request, approval ও rejection flow।

---

## ৮. Workspaces

### Admin Workspace (`/dashboard/`)

সম্পূর্ণ platform নিয়ন্ত্রণের জন্য enterprise OS shell। Collapsible sidebar, sticky topbar, breadcrumbs, command palette (`⌘K`) ও workspace switcher। সকল listing page shared `ListLayout` + `DataTable` / `ResourceListPage` pattern ব্যবহার করে।

### Reseller Workspace (`/reseller/`)

Private catalog ও order management। Product browsing, marketing kit, order creation (checkout pipeline), এবং customer management।

### Wholesale Workspace (`/wholesale/`)

Enterprise bulk buying portal। Wholesale price ও MOQ সহ product browsing, bulk order, quotation request, invoice view, order history।

### Supplier Workspace (`/supplier/`)

Self-service supplier portal। Product management, inventory monitoring, purchase orders, delivery tracking, finance ও report।

---

## ৯. User Roles

| Role            | বিবরণ                                                          |
| --------------- | -------------------------------------------------------------- |
| **Super Admin** | পূর্ণ platform নিয়ন্ত্রণ, সকল engine ও workspace-এ permission |
| **Admin**       | Administrative কাজ, user management, operational control       |
| **Manager**     | সীমিত admin access, নির্দিষ্ট engine-এ permission              |
| **Reseller**    | নিজস্ব catalog, order ও customer management                    |
| **Wholesaler**  | Bulk purchase, quotation ও wholesale pricing                   |
| **Supplier**    | নিজস্ব product, inventory ও order management                   |
| **Customer**    | Personal profile ও order history                               |
| **Guest**       | Retail browse ও guest checkout (public storefront)             |

---

## ১০. বর্তমান Implementation Status

| পর্যায়                              | অবস্থা     |
| ------------------------------------ | ---------- |
| Project foundation                   | ✅ সম্পন্ন |
| Core infrastructure                  | ✅ সম্পন্ন |
| Identity & authentication            | ✅ সম্পন্ন |
| Enterprise supplier management       | ✅ সম্পন্ন |
| Product catalog foundation           | ✅ সম্পন্ন |
| Enterprise pricing & inventory       | ✅ সম্পন্ন |
| Enterprise reseller management       | ✅ সম্পন্ন |
| Enterprise workspace & design system | ✅ সম্পন্ন |
| Reseller workspace                   | ✅ সম্পন্ন |
| Wholesale workspace                  | ✅ সম্পন্ন |
| Supplier workspace                   | ✅ সম্পন্ন |
| Architecture alignment (role-driven) | ✅ সম্পন্ন |
| Courier integration                  | 🔄 চলমান   |
| Checkout & order pipeline            | 🔄 চলমান   |
| Finance engine                       | 🔄 চলমান   |
| Public website / Customer workspace  | ⏳ পরবর্তী |

---

## ১১. Future Roadmap

### পরিকল্পিত কাজসমূহ

- **Public Website** — Customer-facing storefront (`/products`, `/checkout`)
- **Mobile App** — Flutter-based mobile application
- **Payment Gateway** — bKash, Nagad ও Rocket integration
- **Multi-warehouse** — সম্পূর্ণ WMS implementation
- **AI Pricing** — Machine learning-driven price optimization
- **Source Code Marketplace** — Published theme ও plugin ecosystem
- **Analytics Dashboard** — Business intelligence reporting
- **Automation Engine** — Rule-based automation workflow

---

## ১২. Installation

### Requirements

- Node.js 20+
- pnpm 9+
- MongoDB 7+
- Redis 7+

### Steps

```bash
# 1. Install dependencies
pnpm install

# 2. Environment config
cp .env.example .env.local
# .env.local এ মান পূরণ করুন

# 3. Development server
pnpm dev

# 4. Production build
pnpm build

# 5. Production server
pnpm start
```

### Important Environment Variables

```
MONGODB_URI=           # MongoDB connection string
REDIS_URL=             # Redis URL
NEXTAUTH_SECRET=       # NextAuth secret
NEXTAUTH_URL=          # NextAuth URL
IMAGEKIT_PUBLIC_KEY=   # ImageKit public key
IMAGEKIT_PRIVATE_KEY=  # ImageKit private key
IMAGEKIT_URL_ENDPOINT= # ImageKit URL endpoint
```

---

## ১৩. Development Rules

### Architecture Rules

- **Feature-First**: প্রতিটি feature একটি স্বতন্ত্র module
- **Domain → Service → Repository**: Layer boundary কঠোরভাবে অনুসরণ করতে হবে
- **Component-এ database call নিষিদ্ধ**: সরাসরি MongoDB model import করা যাবে না

### Coding Rules

- TypeScript কঠোরভাবে ব্যবহার করুন, `any` type এড়িয়ে চলুন
- প্রতিটি function-এর জন্য explicit return type
- API credential source-এ রাখবেন না — `src/shared/config/env.ts`-এর মাধ্যমে route করতে হবে

### Folder ও Naming Rules

| Type      | Convention        | Example             |
| --------- | ----------------- | ------------------- |
| Folder    | kebab-case        | `shared-components` |
| Component | PascalCase        | `Button.tsx`        |
| Hook      | camelCase + `use` | `useDebounce.ts`    |
| Function  | camelCase         | `formatCurrency.ts` |

### Documentation Rules

- কেবল `README.md` ও `docs/00-project.md` রক্ষণাবেক্ষণ করুন
- অতিরিক্ত documentation folder তৈরি করবেন না
- Documentation সংক্ষিপ্ত ও update রাখুন

---

## ১৪. Contributing

### Commit Message Convention

`<type>(<scope>): <subject>`

- `feat`: নতুন feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting change (code logic নয়)
- `refactor`: Code restructuring
- `chore`: Build task বা config change

### Pull Request Flow

1. Feature branch তৈরি করুন (`feature/feature-name`)
2. Code test করুন ও pre-commit hook পাস করুন
3. `dev` branch-এ PR খুলুন
4. অন্তত একজন reviewer-এর approval নিন

### Branching Strategy

- `main` — Production release
- `dev` — Integration branch
- `feature/<name>` — নতুন feature
- `bugfix/<name>` — Bug fix

---

## ১৫. License

MIT License-এর অধীনে প্রকাশিত। বিস্তারিত জানতে `LICENSE` ফাইল দেখুন।

---

## ১৬. Author

**Parvez** — Project Lead & Architect

---

<div align="center">
  <p>বাংলাদেশের জন্য তৈরি, enterprise-এর জন্য প্রস্তুত।</p>
  <p>
    <a href="https://dropshop.nn">Website</a> ·
    <a href="https://github.com/anomalyco/dropshop-nn">GitHub</a> ·
    <a href="https://github.com/anomalyco/dropshop-nn/issues">Issue Report</a>
  </p>
</div>
