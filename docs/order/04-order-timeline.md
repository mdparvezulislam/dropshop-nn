# 04 - Order Timeline

## Purpose

The order timeline logs every state transition, user actions, system automations, and external courier triggers to guarantee audit compliance.

## Schema

- `timestamp`: Date
- `eventType`: String (e.g., `order.status_changed`)
- `action`: String (e.g., `status_transition`)
- `summary`: Human readable explanation
- `actor`: ID, name, role of user initiating the change
- `changes`: Before and after diffs
- `correlationId`: For log aggregation tracing
