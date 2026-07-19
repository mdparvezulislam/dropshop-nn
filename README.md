# DropshopNN

DropshopNN is an enterprise-grade dropshipping management and logistics orchestration platform built using Next.js 16, React 19, and TypeScript.

## Project Overview

This project serves as a highly scalable e-commerce infrastructure foundation enforcing Domain-Driven Design (DDD), Repository Pattern, and a Service Layer. It is designed to coordinate operations with MongoDB, caching with Redis, asynchronous processing via BullMQ, and asset uploads via ImageKit.

---

## Setup & Installation

### Prerequisites

- Node.js >= 20.x
- pnpm >= 9.x
- Local MongoDB and Redis instances

### Installation Steps

1. Clone the repository and navigate to the directory:
   ```bash
   cd dropshop-nn
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Initialize environment configuration:
   ```bash
   cp .env.example .env
   ```
   _Edit `.env` and fill in local database, authentication secret, and API keys._

---

## Available Scripts

### Development Server

Starts the development server with Turbopack:

```bash
pnpm dev
```

### Build Production Bundle

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

### Quality Assurance

- **Linter (ESLint)**: `pnpm run lint`
- **Formatter (Prettier)**: `pnpm run format`
- **TypeScript checks**: `pnpm run type-check`

---

## Folder Structure

```
dropshop-nn/
├── docs/                      # Architectural and process docs
├── src/
│   ├── app/                   # Next.js pages and layouts
│   ├── features/              # Feature modules (DDD structured)
│   │   ├── auth/
│   │   ├── products/
│   │   └── ... (orders, payments, courier, inventory, pricing, wallet, invoices)
│   └── shared/                # Core layers, types, utilities, UI primitives
```

_For detailed guidelines, see the documentation inside [docs/](file:///Users/parvez/code/dropshop-nn/docs/)._
