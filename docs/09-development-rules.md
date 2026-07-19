# 09 - Development Rules

## 1. Config Validation

- All new environment variables must be registered inside `.env.example` and validated inside `src/shared/config/env.ts` with strict Zod types.

## 2. Commit & Pre-Commit Rules

- Never bypass pre-commit husky hooks.
- Fix all lint issues and typescript check errors prior to pushing commits.

## 3. Branching Strategy

- `main`: Production release branch.
- `dev`: Active integration branch.
- `feature/<name>`: New feature iterations.
- `bugfix/<name>`: Bug correction branch.
