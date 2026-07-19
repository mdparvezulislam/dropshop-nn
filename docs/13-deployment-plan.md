# 13 - Deployment Plan

## 1. Hosting Architecture

- Next.js application hosts on Vercel or custom Node clusters.
- MongoDB cluster deployed to MongoDB Atlas.
- Redis server hosted on Upstash (for serverless compatibility) or Redis Enterprise clusters.

## 2. CI/CD Pipeline

- Branch push events run GitHub Actions to lint, test, format, and typecheck code.
- Successfully built code is auto-deployed to staging on branch merge events.
