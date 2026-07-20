# 01 - Order Engine Overview

## Purpose

The Order Management Engine is the central orchestrator of order transactions inside DropshopNN. It manages order lifecycle state transitions, timelines, snapshots, events, and audits. It serves as the single source of truth for the status and progress of orders for customers, resellers, wholesalers, and staff.

## Core Scope

- **Order Identity**: Tracks internal, public order IDs, order numbers, and channel sources.
- **Order Snapshotting**: Resolves immutable customer snapshots, shipping information snapshots, and resolved pricing parameters.
- **Integration boundaries**: Requesting inventory reservations, consuming pricing resolutions, and recording event timelines without owning those subsystems directly.
