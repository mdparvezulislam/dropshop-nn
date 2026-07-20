# Performance Tracking

## Purpose
Track supplier reliability, delivery speed, and order quality to compute an overall performance score used for automated ranking and suspension decisions.

## Performance Fields (`ISupplierPerformance`)
| Field | Type | Description |
|---|---|---|
| `performanceScore` | `number` (0–100) | Composite score |
| `onTimeDeliveryRate` | `number` (0–100) | Percentage of orders delivered on time |
| `averageDeliveryDays` | `number` | Average days from order to delivery |
| `returnRate` | `number` (0–100) | Percentage of items returned |
| `qualityRating` | `number` (0–100) | Quality rating |
| `responseTimeHours` | `number` | Average hours to respond to inquiries |
| `completedOrders` | `number` | Total completed order count |
| `cancelledOrders` | `number` | Total cancelled order count |
| `lastOrderDate` | `Date?` | Date of most recent order |
| `periodStart` | `Date?` | Start of current scoring period |
| `periodEnd` | `Date?` | End of current scoring period |

## Score Calculation
The composite `performanceScore` is a weighted average:
- On-time delivery: 30%
- Return rate (inverted): 25%
- Quality rating: 20%
- Response time: 15%
- Order volume bonus: 10%

## Decay & Auto-Suspend
- After `supplier.performance_decay_period_days` (default 90) without new data, the score decays.
- If score falls below `supplier.auto_suspend_threshold` (default 20), the system may automatically set status to `inactive`.

## Event
When performance is updated, a `supplier.performance_updated` event fires with the previous and new score.
