# 01 - Project Roadmap

## Phase 0: Project Foundation (Current)

- Complete directory setup, linting/formatting rules, dev workflow (git hooks).
- Setup configuration validation and db/caching connections (MongoDB, Redis, BullMQ, ImageKit).
- Implement standard error handlers, logger, and API responders.

## Phase 1: Authentication & Core Domains

- Build complete Mongoose models for Auth and User profiles.
- Set up JWT session handling via Auth.js.
- Create merchant onboarding and admin dash layouts.

## Phase 2: Catalog & Inventory

- Develop Product catalog modules.
- Enforce Inventory reservation engines (locking/unlocking items on cart/checkout steps).

## Phase 3: Order Engine & Payments

- Construct checkout systems and payment integrations (Stripe, SSLCommerz).
- Build transaction loggers.

## Phase 4: Logistics & Backgrounding

- Integration of third-party Courier APIs.
- Dispatch queue processing using BullMQ.
