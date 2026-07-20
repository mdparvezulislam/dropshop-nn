# 08 - Search Metadata

## Overview

Products carry search metadata that influences how they appear in search results. This data is managed by the Catalog Engine and consumed by the Search Engine.

## Search Metadata Fields

| Field             | Type     | Description                                       |
| ----------------- | -------- | ------------------------------------------------- |
| `searchKeywords`  | String[] | Additional keywords for search indexing           |
| `searchSynonyms`  | String[] | Synonym terms for the product                     |
| `searchWeight`    | Number   | Boost factor (1.0 = normal, 2.0 = double weight)  |
| `popularityScore` | Number   | Computed popularity (0-100), updated by Analytics |
| `searchable`      | Boolean  | Whether product appears in search (default: true) |

## Search Weight

Search weight boosts a product's position in search results:

| Weight | Effect             | Use Case              |
| ------ | ------------------ | --------------------- |
| 0.5    | Reduced visibility | Low priority products |
| 1.0    | Normal (default)   | Standard products     |
| 1.5    | Boosted            | Featured products     |
| 2.0    | Highly boosted     | Promotional products  |
| 3.0    | Maximum            | Flash sale items      |

## Popularity Score

Popularity score is computed by the Analytics Engine based on:

- Views (30% weight)
- Orders (40% weight)
- Revenue (20% weight)
- Returns (negative, 10% weight)

Score is 0-100 and updated periodically (not in real-time).

## Search Indexing Flow

```
Product Created / Updated / Published
  │
  ├── Catalog generates search document:
  │     ├── title: product.name
  │     ├── description: shortDescription
  │     ├── keywords: [...searchKeywords, ...tags, ...categoryName]
  │     ├── synonyms: searchSynonyms
  │     ├── weight: searchWeight
  │     └── score: popularityScore
  │
  └── Event published → Search Engine reindexes
```

## Future: AI Search Ready

The search metadata structure supports future AI-powered search:

- Vector embeddings stored alongside metadata
- Semantic search weights
- Natural language query processing
- Personalized search results based on user behavior

## Keywords Best Practices

- Include common misspellings as synonyms
- Include Bengali translations in keywords
- Add seasonal terms when applicable
- Avoid keyword stuffing (>20 starts to hurt ranking)
