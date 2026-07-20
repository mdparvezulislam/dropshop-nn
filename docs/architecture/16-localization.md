# 16 - Localization Architecture

## Overview

The primary market is Bangladesh. The architecture is designed for BDT currency, Bangla/English languages, Bangladesh address hierarchy, and Bangladesh commerce workflows — while supporting future international expansion.

---

## Currency

### BDT as Primary

- Default currency: BDT (Bangladeshi Taka)
- All monetary values stored as integer cents (paisa)
- Currency stored per pricing record for future multi-currency support

### Currency Handling

```typescript
const CURRENCY_CONFIG = {
  BDT: {
    code: "BDT",
    symbol: "৳",
    name: "Bangladeshi Taka",
    subunit: "paisa",
    subunitToUnit: 100, // 1 BDT = 100 paisa
    decimalPlaces: 2,
    locale: "bn-BD",
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    subunit: "cent",
    subunitToUnit: 100,
    decimalPlaces: 2,
    locale: "en-US",
  },
};
```

### Price Display

- BDT format: `৳ 1,234.56`
- English locale: `৳ 1,234.56`
- Bangla locale: `৳ ১,২৩৪.৫৬`
- All prices formatted via centralized `formatCurrency()` utility

---

## Language

### Supported Languages

| Language | Code | Script  | Status        |
| -------- | ---- | ------- | ------------- |
| English  | `en` | Latin   | ✅ Primary UI |
| Bangla   | `bn` | Bengali | ⏳ Planned    |

### Language Detection

- Default: Browser language detection
- Override: User preference in settings
- URL-based: `example.com/bn/products`
- Cookie-based: Persisted language preference

### Translation Architecture

- next-intl or react-i18next for runtime translations
- Namespace-based translation files: `common.json`, `dashboard.json`, `auth.json`
- Admin-managed translation editor (future)
- Right-to-left (RTL) support for Bangla (future)

---

## Address Hierarchy

### Bangladesh Address Format

```
Division → District → Upazila/Thana → Area/Locality → Postal Code
```

### Standard Address Fields

```typescript
interface BangladeshAddress {
  division: string; // e.g., "Dhaka", "Chittagong"
  district: string; // e.g., "Dhaka", "Comilla"
  upazila: string; // e.g., "Savar", "Dhanmondi"
  area?: string; // e.g., "Mirpur 12", "Gulshan 2"
  postalCode?: string; // e.g., "1216"
  fullAddress: string; // Full street address
  country: string; // Default: "Bangladesh"
}
```

### Address Data

- Divisions, districts, and upazilas stored as seed data
- Hierarchical cascading dropdown in forms
- Search/autocomplete for faster data entry
- Validation against known BD postal codes

---

## Mobile Numbers

### Bangladesh Mobile Format

- Country code: +880
- National number: 01XXXXXXXXX (11 digits)
- Operators: 013, 014, 015, 016, 017, 018, 019

### Validation

```typescript
const BD_MOBILE_REGEX = /^(\+?880|0)1[3-9]\d{8}$/;
// Examples: 01712345678, +8801712345678
```

### Storage

- Stored in E.164 format: `+8801712345678`
- Displayed in local format: `01712-345678`

---

## Commerce Workflows

### Bangladesh-Specific Features

- **bKash Payment**: Primary mobile money integration
- **Nagad Payment**: Government-backed mobile money
- **Cash on Delivery**: Most common payment method
- **Bank Transfer**: Traditional business payments
- **Split Payment**: Partial bKash + COD (future)

### Shipping Context

- Courier services: Sundarban, SA Paribahan, eCourier, Pathao, SteadFast
- City vs. National delivery zones
- Inside Dhaka vs. Outside Dhaka pricing
- COD charge handling

### Tax Context

- VAT: 5% standard (simplified)
- TIN/BIN registration for businesses
- Source tax deduction for suppliers
- E-commerce-specific tax rules

### Holiday Calendar

- Pohela Boishakh (Bengali New Year)
- Pahela Falgun (Spring Festival)
- Eid-ul-Fitr (shopping season)
- Eid-ul-Azha (shopping season)
- Victory Day (Dec 16)
- Independence Day (Mar 26)

---

## Future International Expansion

### Expansion Architecture

```
Country Configuration (Database)
│
├── currency: BDT | USD | INR | ...
├── language: bn | en | hi | ...
├── addressFormat: BD | US | IN | ...
├── phoneRegex: RegExp
├── taxRules: TaxConfig
├── holidayCalendar: Holiday[]
└── shippingZones: Zone[]
```

### New Market Onboarding

1. Add country configuration to database
2. Create translation files
3. Configure payment gateways
4. Set up shipping zones
5. Configure tax rules
6. Test and deploy

### Multi-Currency Roadmap

- Phase 1: BDT only with display conversion estimates
- Phase 2: Multi-currency pricing records
- Phase 3: Live currency conversion (forex API)
- Phase 4: Settlement in local currency per merchant
