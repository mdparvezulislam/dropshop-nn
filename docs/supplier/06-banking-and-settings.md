# Banking & Settings

## Banking (`ISupplierBanking`)
| Field | Type | Description |
|---|---|---|
| `bankName` | `string` | Name of the bank |
| `accountName` | `string` | Account holder name |
| `accountNumber` | `string` | Account number |
| `routingNumber` | `string` | Routing / sort code |
| `currency` | `string` | ISO currency code (default: `USD`) |

## Settings (`ISupplierSettings`)
| Field | Type | Default | Description |
|---|---|---|---|
| `currency` | `string` | `USD` | Preferred transaction currency |
| `paymentTerms` | `string` | `net_30` | Payment terms (net_7, net_15, net_30, net_60, prepaid) |
| `shippingMethod` | `string` | — | Preferred shipping method |
| `returnPolicy` | `string` | — | Return policy summary |
| `autoShip` | `boolean` | `false` | Enable automatic reordering |
| `notifyOnOrder` | `boolean` | `true` | Send email on new order |
| `notifyOnStockUpdate` | `boolean` | `true` | Send email on stock changes |

Banking and settings are updated via dedicated server actions with permission `Supplier.Update`.
