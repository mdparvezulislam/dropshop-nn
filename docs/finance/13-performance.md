# 13 - Finance Engine Performance Plan

## Optimizations
- **Compound Indexes**: Indexed `{ walletId: 1, status: 1, clearsAt: 1 }` to guarantee fast balance evaluations.
- **Aggregation Pipelines**: Optimized sums calculations.
- **Caching**: Future Redis caching layers.
