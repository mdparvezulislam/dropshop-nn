# 17 - Scalability Architecture

## Overview

The architecture is designed to scale from 100 to 1,000,000+ products, users, and orders without requiring architectural redesign. The key design decisions that enable this are enumerated below.

---

## Database Scalability

### MongoDB

| Strategy | Implementation | Scale Impact |
|----------|---------------|-------------|
| Indexing | Compound indexes on all query patterns | 10x-100x query performance |
| Sharding (future) | Shard key on `productId` for pricing/inventory | 100x+ data volume |
| Read Replicas | Secondary reads for dashboard/reports | 10x+ read throughput |
| TTL Indexes | Auto-expire temp data | Prevents collection bloat |
| Aggregation Pipeline | Server-side aggregation for reports | Reduces data transfer |

### Redis

| Strategy | Implementation | Scale Impact |
|----------|---------------|-------------|
| Caching | Cache heavy reads with 15min TTL | 10x-100x read performance |
| Session Store | JWT tokens with Redis session cache | 100x+ concurrent sessions |
| Rate Limiting | Per-user/API rate limits | Prevents abuse at scale |
| Pub/Sub | Event bus for real-time updates | 100x+ event throughput |

### Scalability Patterns

```typescript
// 1. Pagination everywhere
const result = await repository.findPaginated(filter, { page: 1, limit: 50 })

// 2. Selective field loading
const product = await Product.findById(id).select('name sku categoryId')

// 3. Aggregation pipelines for complex queries
const topProducts = await Product.aggregate([
  { $match: { status: 'published' } },
  { $sort: { salesCount: -1 } },
  { $limit: 10 },
])

// 4. Bulk operations for mass updates
await PricingRepository.bulkUpdatePrices(filter, updates)
```

---

## Application Scalability

### Next.js Architecture

| Strategy | Implementation |
|----------|---------------|
| Server Components | Minimal client JS; data fetching on server |
| Route Segmentation | Automatic code splitting per route |
| Streaming | Progressive rendering for data-heavy pages |
| ISR | Static generation for public catalog pages |
| Edge Runtime | Auth middleware at edge |

### Feature Module Isolation

Each feature module is independently scalable:

```
src/features/pricing/    → Can be deployed as microservice (future)
src/features/inventory/  → Can be deployed as microservice (future)
src/features/reseller/   → Can be deployed as microservice (future)
```

Module boundaries (`productId + variantSku` references) make this transition possible.

---

## Background Job Scalability (BullMQ)

### Queue Architecture

| Queue | Workers | Priority | Description |
|-------|---------|----------|-------------|
| order-processing | 5 | High | Order creation, payment |
| automation | 3 | High | Cascade automations |
| notifications | 3 | Medium | Email/SMS dispatch |
| analytics | 2 | Low | Event processing, aggregation |
| reports | 2 | Low | Report generation |
| email | 3 | Medium | Email delivery |
| exports | 1 | Low | CSV/PDF generation |

### BullMQ Configuration
- Redis connection with connection pooling
- Job retry with exponential backoff
- Rate limiting per queue
- Stalled job handling
- Dead letter queue for failed jobs
- Job scheduling (cron-based)

---

## Horizontal Scaling

### Stateless Application
- All application instances are stateless
- Session data in Redis
- No local file storage (ImageKit for media)
- No WebSocket state (server-sent events or polling)

### Load Balancing
- Round-robin or least-connections
- Sticky sessions not required
- Health check endpoints
- Auto-scaling based on CPU/memory

### Database Connection Pooling
```typescript
// ConnectionManager configuration
const poolConfig = {
  maxPoolSize: 10,     // Per application instance
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  waitQueueTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000,
}
```

---

## Caching Strategy

| Cache Layer | What | Where | TTL | Invalidation |
|------------|------|-------|-----|-------------|
| Browser | Static assets | CDN | 1y | Cache-busting hash |
| Next.js | Pages (ISR) | Edge | 60s | Revalidate on demand |
| Redis | Database queries | Redis | 15min | On write events |
| Redis | User sessions | Redis | 24h | On logout |
| In-Memory | Role permissions | Node | 5min | Cache.clear() |

---

## Scale Targets

| Metric | Current Target | Future Target |
|--------|---------------|---------------|
| Products | 10,000 | 1,000,000+ |
| Users | 5,000 | 100,000+ |
| Resellers | 500 | 10,000+ |
| Suppliers | 100 | 5,000+ |
| Daily Orders | 1,000 | 100,000+ |
| Concurrent Users | 500 | 50,000+ |
| API Latency (p95) | <200ms | <500ms |
| Page Load (p95) | <1s | <2s |
| Database Size | 10GB | 1TB+ |

---

## Performance Monitoring

- API response time tracking
- Database query profiling (slow query log)
- BullMQ job metrics (queue depth, processing time, failure rate)
- Cache hit/miss ratio monitoring
- Error rate and type tracking
- Resource utilization (CPU, memory, connections)

All metrics exposed through the Analytics Engine for dashboard visibility.
