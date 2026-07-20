# 13 - Localization

## Bangladesh Localization

The identity engine is localized for Bangladesh from day one.

## Phone Format

Bangladeshi phone numbers are validated and stored in standard format:

| Format | Example |
|--------|---------|
| Local | 01XXXXXXXXX |
| International | +8801XXXXXXXXX |
| Stored | 01XXXXXXXXX (11 digits) |

Validation rules:
- Must start with `01`
- Must be 11 digits total
- Must be a valid operator prefix (`013`, `014`, `015`, `016`, `017`, `018`, `019`)

## Address Hierarchy

The identity engine uses Bangladesh's administrative hierarchy:

```
Division (বিভাগ)
  └── District (জেলা)
        └── Upazila/Thana (উপজেলা/থানা)
              └── Area/Mouza (এলাকা/মৌজা)
                    └── Postal Code
```

### Divisions

| Division | Capital |
|----------|---------|
| Dhaka (ঢাকা) | Dhaka |
| Chittagong (চট্টগ্রাম) | Chittagong |
| Rajshahi (রাজশাহী) | Rajshahi |
| Khulna (খুলনা) | Khulna |
| Barisal (বরিশাল) | Barisal |
| Sylhet (সিলেট) | Sylhet |
| Rangpur (রংপুর) | Rangpur |
| Mymensingh (ময়মনসিংহ) | Mymensingh |

## Timezone

- **Default Timezone**: Asia/Dhaka (UTC+6)
- **DST**: None observed
- **Storage**: All dates stored as UTC in MongoDB
- **Display**: Converted to Asia/Dhaka on read

## Currency

- **Default Currency**: BDT (Bangladeshi Taka)
- **Format**: ৳1,234.56
- **Subunit**: Poisha (100 poisha = 1 taka)
- **Storage**: All amounts stored as integer cents (paise)

## Language Support

| Language | Code | Status |
|----------|------|--------|
| English | en | ✅ Default |
| Bangla | bn | ⏳ Planned |

Future: Bangla translations for all UI labels, error messages, and notifications.

## Name Conventions

- Bengali names stored in Unicode
- English names stored in ASCII
- Both name fields available
- No assumption of first/last name structure — use `fullName` field
