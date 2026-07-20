# Order Module — Automation

## Auto-Confirm
When `order.auto_confirm` feature flag is `on`, orders created from checkout drafts start in `confirmed` status instead of `draft`. This enables frictionless checkout experiences.

## Auto-Complete
- Orders in `delivered` status are auto-completed after `order.auto_complete_days` setting (default 7 days)
- A scheduled job (cron) runs daily:
  1. Finds orders in `delivered` status older than the threshold
  2. Calls `transitionStatus(orderId, "completed")` for each
  3. Logs all auto-completions in timeline

## Event-Driven Automation
| Trigger | Automated Action |
|---|---|
| `order.created` | If auto-confirm enabled, transition to `confirmed` |
| `order.delivered` | Schedule auto-completion timer |
| `order.failed` | Alert admin, log to monitoring |
| `order.return_requested` | Notify warehouse for pickup |

## Future Automation
- **Supplier Routing** — auto-assign order items to suppliers based on inventory
- **Courier Assignment** — auto-assign best courier based on zone/weight/pricing
- **Payment Verification** — auto-confirm orders when payment is verified
- **Fraud Detection** — flag orders based on rules before confirmation
