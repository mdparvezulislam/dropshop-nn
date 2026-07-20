# Supplier Categories

Suppliers are classified into one of five categories to enable differentiated pricing rules, lead-time expectations, and quality scoring.

| Category     | Enum Value     | Typical characteristics                                   |
| ------------ | -------------- | --------------------------------------------------------- |
| Wholesaler   | `wholesaler`   | Bulk pricing, higher MOQ, best per-unit cost              |
| Manufacturer | `manufacturer` | Direct factory, customisation possible, longer lead times |
| Distributor  | `distributor`  | Mid-volume, regional stock, faster delivery               |
| Dropshipper  | `dropshipper`  | Low/zero MOQ, ship-on-demand, higher per-unit cost        |
| Independent  | `independent`  | Small-scale or boutique, flexible terms, personal service |

## Usage

- Category is set at creation and can be updated via `updateSupplier`.
- Catalog and Pricing services may read category to apply rule variations.
- Inventory module may use category to affect lead-time defaults.
