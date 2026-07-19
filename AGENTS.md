<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# DropshopNN - AI Agent System Rules

## Project Vision

DropshopNN is designed as a modular, scalable, domain-driven dropshipping manager. It must remain pure, clean, and free of architectural clutter. All actions must conform to solid software engineering principles.

## Architecture Rules

- Strictly follow Feature-First Domain-Driven Design (DDD).
- Enforce the boundary of Domain -> Service -> Repository.
- Do not import MongoDB models directly into components or server actions; database transactions must go through Repositories, coordinated by Services.

## Coding Rules

- Use TypeScript strictly. No implicit `any` types.
- Export explicit return types for all functions, actions, and services.
- Never put API credentials in raw text. Always route through `src/shared/config/env.ts`.

## Naming Convention

- Folders: kebab-case
- Component Files: PascalCase (`Button.tsx`)
- Hooks: camelCase starting with "use" (`useDebounce.ts`)
- Functions: camelCase (`formatCurrency.ts`)

## Folder Convention

- Feature folders must reside in `src/features/<module-name>`.
- Shared components must reside in `src/shared/components/`.

## Component Rules

- Use Functional Components with hooks.
- Handle state locally or route through custom hooks.
- Styling must use Tailwind CSS v4 classnames.

## Server Action Rules

- Enforce `"use server";` directive at the top of action files.
- Validate all incoming arguments using Zod.
- Standardize response payload formatting: `{ success: boolean; data?: T; error?: string }`.

## Repository Rules

- Implement data layer mappings. Convert Mongoose models to clean domain entities.
- Limit repository code to querying and saving database entities.

## Service Rules

- Orchestrate business processes and enforce logic.
- Coordinate cache eviction and BullMQ job enqueues.

## UI Rules

- Build beautiful, modern, dark-mode-first interfaces.
- Standardize spacing and layout patterns using CSS custom variables mapped to Tailwind v4 theme configurations.

## Database Rules

- Keep connection pools active.
- Utilize MongoDB transactions for multi-document modifications.

## Validation Rules

- All user inputs must be validated with Zod.
- Configuration variables must be verified at startup.

## Performance Rules

- Minimize large libraries in bundle size.
- Utilize cache invalidation on write events.

## Security Rules

- Hash passwords securely.
- Sanitize user inputs to prevent injection attacks.

## Git Commit Convention

- Follow conventional commits: `<type>(<scope>): <subject>`.

## Development Workflow

- Perform formatting, linting, and type checking before committing code.

## AI Coding Instructions

### Things AI must never do:

- Never bypass Zod input validations.
- Never write database calls inside UI components or Server Actions directly.
- Never place API secrets in source files.
- Never ignore linting or formatting check failures.

### Things AI must always do:

- Always write clean, self-documenting code with TypeScript.
- Always run type checks and lints prior to marking tasks completed.
- Always maintain separation of concerns.
