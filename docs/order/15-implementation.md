# 15 - Order Engine Implementation Guide

## File Structure

- `src/features/order/domain/` - state machine guards, enums, entities, and event structures.
- `src/features/order/types/` - validation rules.
- `src/features/order/repositories/` - mongoose schemas.
- `src/features/order/services/` - core business services.
- `src/features/order/actions/` - Next.js Server Actions.

## Bootstrapping

- `registerOrderFeatureFlags()` registers all feature flags, default operational settings, and hooks the checkout draft sync subscriber.
- Server Actions enforce strict Zod parse schema checks.
