# 10 - API Standards

## REST Architecture

- Base URL endpoints under `/api/...` (e.g. `/api/orders`).
- Standardize methods: `GET` (fetch), `POST` (create), `PUT`/`PATCH` (edit), `DELETE` (remove).
- Respond using the standardized payload from `ApiResponse`.

## Server Actions

- Must return a standardized payload matching this layout: `{ success: boolean; data?: T; error?: string }`.
- Wrap all server action operations in try/catch structures, utilizing the custom Logger to record stack traces.
