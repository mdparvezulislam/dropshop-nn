# Address & Contact Management

## Address (`ISupplierAddress`)

| Field        | Type      | Description                                    |
| ------------ | --------- | ---------------------------------------------- |
| `line1`      | `string`  | Street address                                 |
| `line2`      | `string?` | Apartment, suite, etc.                         |
| `city`       | `string`  | City                                           |
| `state`      | `string`  | State / province                               |
| `district`   | `string`  | District or county (used for search filtering) |
| `postalCode` | `string`  | Zip / postal code                              |
| `country`    | `string`  | ISO country code                               |

## Contacts (`ISupplierContact[]`)

Each contact has:

| Field       | Type      | Description                              |
| ----------- | --------- | ---------------------------------------- |
| `name`      | `string`  | Full name                                |
| `role`      | `string`  | Job title or role (e.g. "Sales Manager") |
| `email`     | `string`  | Contact email                            |
| `phone`     | `string`  | Contact phone                            |
| `isPrimary` | `boolean` | Primary contact flag                     |

Max 10 contacts per supplier enforced at validation layer.
