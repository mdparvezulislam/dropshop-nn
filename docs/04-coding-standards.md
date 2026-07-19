# 04 - Coding Standards

## TypeScript

- Enforce strict typing. Avoid using `any`.
- Define type declarations inside domain folders or `shared/types`.
- Use interface structures for objects, types for union configurations.
- Return explicit types from public methods, functions, and services.

## Naming Conventions

- **Folders**: kebab-case (e.g. `shared-components`).
- **Components**: PascalCase (e.g. `Button.tsx`).
- **Hooks**: camelCase starting with `use` (e.g. `useDebounce.ts`).
- **Helper functions**: camelCase (e.g. `formatDate.ts`).
- **Interfaces**: PascalCase without prefixing "I" (e.g. `UserSession` rather than `IUserSession`).

## Formatting & Tooling

- Code must pass ESLint lints (`pnpm run lint`) and Prettier formatting checks (`pnpm run format`).
- Unused variables are restricted and cause pre-commit check warnings.
- Tab width: 2 spaces. Single quotes: false. Semicolons: true.
