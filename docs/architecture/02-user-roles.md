# 02 - User Roles Architecture

## Role Taxonomy

The platform supports a hierarchical role model designed for extensibility. Every role is a document in the `roles` collection with an associated permission set.

### Role Hierarchy

```
Super Admin
    └── Admin
            └── Manager
                    └── Support Staff
                            └── Supplier
                    └── Accountant
            └── Reseller
            └── Wholesaler
            └── Customer
                    └── Guest
```

### Role Definitions

| Role          | Code          | Description             | Scope                               |
| ------------- | ------------- | ----------------------- | ----------------------------------- |
| Guest         | `guest`       | Unauthenticated visitor | Public catalog only                 |
| Customer      | `customer`    | Registered buyer        | Personal orders, retail pricing     |
| Reseller      | `reseller`    | Business reseller       | Private catalog, reseller pricing   |
| Wholesaler    | `wholesaler`  | Bulk buyer              | Wholesale pricing, MOQ              |
| Supplier      | `supplier`    | Product supplier        | Own products, supply info           |
| Support Staff | `support`     | Customer support        | Order management, user lookup       |
| Accountant    | `accountant`  | Financial user          | Reports, invoices, pricing view     |
| Manager       | `manager`     | Department manager      | Operational control                 |
| Admin         | `admin`       | Platform administrator  | Full platform access (non-system)   |
| Super Admin   | `super_admin` | System administrator    | System-wide access including config |

---

## Permission Model

Permissions follow a `Domain.Action` naming convention.

### Permission Groups

#### Product

```
Product.Create     — Create catalog entries
Product.View       — View product catalog
Product.Update     — Edit product details
Product.Delete     — Soft-delete products
Product.Publish    — Change product visibility status
Product.Archive    — Archive products
```

#### Pricing

```
Pricing.View       — Read pricing records
Pricing.Update     — Create/update pricing
Pricing.Override   — Force fixed price override
Pricing.BulkUpdate — Bulk price operations
```

#### Inventory

```
Inventory.View     — Read inventory data
Inventory.Update   — Create/update inventory
Inventory.Adjust   — Execute stock operations
Inventory.Bulk     — Bulk stock operations
Inventory.Transfer — Transfer between warehouses
```

#### Reseller

```
Reseller.Create    — Onboard new resellers
Reseller.View      — List/detail/search resellers
Reseller.Update    — Edit reseller profile
Reseller.Suspend   — Suspend/block resellers
Reseller.Pricing   — Manage reseller pricing
```

#### Supplier

```
Supplier.Create    — Onboard suppliers
Supplier.View      — List/detail suppliers
Supplier.Update    — Edit supplier profile
Supplier.Suspend   — Suspend suppliers
```

#### Order

```
Order.Create       — Place orders
Order.View         — View order details
Order.Update       — Update order status
Order.Cancel       — Cancel orders
Order.Refund       — Process refunds
```

#### User

```
User.Create        — Invite/create users
User.View          — View user details
User.Update        — Edit user information
User.Delete        — Remove users
```

#### Report

```
Report.View        — View reports
Report.Export      — Export report data
Report.Schedule    — Schedule automated reports
```

#### Analytics

```
Analytics.View     — View analytics dashboards
Analytics.Export   — Export analytics data
```

#### Finance

```
Finance.View       — View financial data
Finance.Process    — Process payments/refunds
Finance.Reconcile  — Reconcile transactions
```

#### Settings

```
Settings.View      — View system settings
Settings.Update    — Modify system settings
```

---

## Default Role-Permission Matrix

| Permission       | Super Admin | Admin | Manager | Support | Supplier | Reseller | Wholesaler | Customer | Guest |
| ---------------- | :---------: | :---: | :-----: | :-----: | :------: | :------: | :--------: | :------: | :---: |
| Product.Create   |      *      |   ✓   |    ✓    |    -    |    ✓     |    -     |     -      |    -     |   -   |
| Product.View     |      *      |   ✓   |    ✓    |    ✓    |    ✓     |    ✓     |     ✓      |    ✓     |   ✓   |
| Product.Update   |      *      |   ✓   |    ✓    |    -    |    ✓     |    -     |     -      |    -     |   -   |
| Product.Delete   |      *      |   ✓   |    -    |    -    |    -     |    -     |     -      |    -     |   -   |
| Product.Publish  |      *      |   ✓   |    ✓    |    -    |    -     |    -     |     -      |    -     |   -   |
| Pricing.View     |      *      |   ✓   |    ✓    |    -    |    ✓     |    ✓     |     ✓      |    -     |   -   |
| Pricing.Update   |      *      |   ✓   |    ✓    |    -    |    -     |    -     |     -      |    -     |   -   |
| Pricing.Override |      *      |   ✓   |    -    |    -    |    -     |    -     |     -      |    -     |   -   |
| Inventory.View   |      *      |   ✓   |    ✓    |    ✓    |    ✓     |    -     |     -      |    -     |   -   |
| Inventory.Update |      *      |   ✓   |    ✓    |    -    |    ✓     |    -     |     -      |    -     |   -   |
| Inventory.Adjust |      *      |   ✓   |    ✓    |    -    |    -     |    -     |     -      |    -     |   -   |
| Reseller.Create  |      *      |   ✓   |    ✓    |    -    |    -     |    -     |     -      |    -     |   -   |
| Reseller.View    |      *      |   ✓   |    ✓    |    ✓    |    -     |    ✓     |     -      |    -     |   -   |
| Reseller.Update  |      *      |   ✓   |    ✓    |    -    |    -     |    ✓     |     -      |    -     |   -   |
| Reseller.Suspend |      *      |   ✓   |    -    |    -    |    -     |    -     |     -      |    -     |   -   |
| Supplier.Create  |      *      |   ✓   |    -    |    -    |    -     |    -     |     -      |    -     |   -   |
| Supplier.View    |      *      |   ✓   |    ✓    |    -    |    ✓     |    -     |     -      |    -     |   -   |
| Supplier.Update  |      *      |   ✓   |    -    |    -    |    ✓     |    -     |     -      |    -     |   -   |
| Supplier.Suspend |      *      |   ✓   |    -    |    -    |    -     |    -     |     -      |    -     |   -   |
| Order.View       |      *      |   ✓   |    ✓    |    ✓    |    ✓     |    ✓     |     ✓      |    ✓     |   -   |
| Order.Update     |      *      |   ✓   |    ✓    |    ✓    |    -     |    -     |     -      |    -     |   -   |
| Order.Cancel     |      *      |   ✓   |    ✓    |    ✓    |    -     |    -     |     -      |    -     |   -   |
| Order.Refund     |      *      |   ✓   |    ✓    |    -    |    -     |    -     |     -      |    -     |   -   |
| User.Create      |      *      |   ✓   |    -    |    -    |    -     |    -     |     -      |    -     |   -   |
| User.View        |      *      |   ✓   |    -    |    ✓    |    -     |    -     |     -      |    -     |   -   |
| User.Update      |      *      |   ✓   |    -    |    -    |    -     |    -     |     -      |    -     |   -   |
| Report.View      |      *      |   ✓   |    ✓    |    ✓    |    -     |    -     |     -      |    -     |   -   |
| Report.Export    |      *      |   ✓   |    ✓    |    -    |    -     |    -     |     -      |    -     |   -   |
| Analytics.View   |      *      |   ✓   |    ✓    |    -    |    -     |    -     |     -      |    -     |   -   |
| Settings.Update  |      *      |   ✓   |    -    |    -    |    -     |    -     |     -      |    -     |   -   |

---

## Role Extensibility

New roles can be added by:

1. Creating a `Role` document in the database
2. Assigning a permission set
3. Implementing any role-specific UI guards in `middleware.ts`

No code changes to the core authorization service are required for new roles that use existing permission combinations.
