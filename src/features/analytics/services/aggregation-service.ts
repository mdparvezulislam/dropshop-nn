import { logger } from "@/shared/utils/logger";
import { EventFactRepository } from "../repositories/event-fact-repository";
import { AnalyticsSnapshotRepository } from "../repositories/analytics-snapshot-repository";
import { AnalyticsCacheService } from "./analytics-cache-service";
import { ANALYTICS_EVENT_NAMES, type AnalyticsSnapshot } from "../domain/analytics-entity";
import { EventBus } from "@/shared/lib/event-bus";
import { ANALYTICS_DOMAIN_EVENTS } from "../domain/analytics-events";

export class AggregationService {
  private readonly facts = new EventFactRepository();
  private readonly snapshotRepo = new AnalyticsSnapshotRepository();
  private readonly cache = AnalyticsCacheService.getInstance();

  async generateDailySnapshot(snapshotDate?: Date): Promise<AnalyticsSnapshot> {
    const date = snapshotDate ?? new Date();
    const from = new Date(date);
    from.setUTCHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setUTCHours(23, 59, 59, 999);

    const [revenue, orders, sessions, productViews] = await Promise.all([
      this.facts.sumValueInRange(from, to, [
        ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID,
      ]),
      this.facts.countInRange(from, to, {
        eventName: [ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID],
      }),
      this.facts.distinctSessions(from, to),
      this.facts.countInRange(from, to, { eventName: ANALYTICS_EVENT_NAMES.PRODUCT_VIEWED }),
    ]);

    const snapshot: AnalyticsSnapshot = {
      id: "",
      snapshotDate: from,
      type: "daily",
      data: { from: from.toISOString(), to: to.toISOString() },
      metrics: { revenue, orders, sessions, productViews },
      dimensions: {},
      immutable: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      status: "active",
    };

    const saved = await this.snapshotRepo.create(snapshot as any);
    await this.snapshotRepo.markImmutable(saved.id);

    await this.cache.invalidateAll([
      "executive", "order", "finance", "product",
    ]);

    await EventBus.publish(ANALYTICS_DOMAIN_EVENTS.SNAPSHOT_CREATED, {
      snapshotId: saved.id,
      type: "daily",
      date: from.toISOString(),
    }, { source: "aggregation-service" });

    logger.info(`Daily snapshot created: ${from.toISOString().slice(0, 10)}`, saved.metrics);
    return saved;
  }

  async generateMonthlySnapshot(snapshotDate?: Date): Promise<AnalyticsSnapshot> {
    const date = snapshotDate ?? new Date();
    const from = new Date(date.getFullYear(), date.getMonth(), 1);
    from.setUTCHours(0, 0, 0, 0);
    const to = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    to.setUTCHours(23, 59, 59, 999);

    const [revenue, orders, sessions, productViews, topProducts] = await Promise.all([
      this.facts.sumValueInRange(from, to, [
        ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID,
      ]),
      this.facts.countInRange(from, to, {
        eventName: [ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID],
      }),
      this.facts.distinctSessions(from, to),
      this.facts.countInRange(from, to, { eventName: ANALYTICS_EVENT_NAMES.PRODUCT_VIEWED }),
      this.facts.topByField(from, to, ANALYTICS_EVENT_NAMES.PRODUCT_VIEWED, "entityId", 10),
    ]);

    const snapshot: AnalyticsSnapshot = {
      id: "",
      snapshotDate: from,
      type: "monthly",
      data: {
        from: from.toISOString(),
        to: to.toISOString(),
        topProducts: topProducts.map((r) => ({ id: r.key, count: r.count })),
      },
      metrics: {
        revenue, orders, sessions, productViews,
        totalEvents: 0,
        conversionRate: sessions > 0 ? Math.round((orders / sessions) * 1000) : 0,
        aov: orders > 0 ? Math.round(revenue / orders) : 0,
      },
      dimensions: {},
      immutable: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      status: "active",
    };

    const saved = await this.snapshotRepo.create(snapshot as any);
    await this.snapshotRepo.markImmutable(saved.id);

    await EventBus.publish(ANALYTICS_DOMAIN_EVENTS.SNAPSHOT_CREATED, {
      snapshotId: saved.id,
      type: "monthly",
      date: from.toISOString().slice(0, 7),
    }, { source: "aggregation-service" });

    logger.info(`Monthly snapshot created: ${from.toISOString().slice(0, 7)}`, saved.metrics);
    return saved;
  }

  async generateYearlySnapshot(year?: number): Promise<AnalyticsSnapshot> {
    const y = year ?? new Date().getFullYear();
    const from = new Date(y, 0, 1);
    from.setUTCHours(0, 0, 0, 0);
    const to = new Date(y, 11, 31);
    to.setUTCHours(23, 59, 59, 999);

    const monthlySnapshots = await this.snapshotRepo.findByDateRange("monthly", from, to);
    const totalRevenue = monthlySnapshots.reduce((sum, s) => sum + (s.metrics.revenue ?? 0), 0);
    const totalOrders = monthlySnapshots.reduce((sum, s) => sum + (s.metrics.orders ?? 0), 0);
    const totalSessions = monthlySnapshots.reduce((sum, s) => sum + (s.metrics.sessions ?? 0), 0);

    const snapshot: AnalyticsSnapshot = {
      id: "",
      snapshotDate: from,
      type: "yearly",
      data: { year: y, monthlySnapshots: monthlySnapshots.map((s) => s.id) },
      metrics: {
        revenue: totalRevenue,
        orders: totalOrders,
        sessions: totalSessions,
        aov: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        monthsIncluded: monthlySnapshots.length,
      },
      dimensions: {},
      immutable: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      status: "active",
    };

    const saved = await this.snapshotRepo.create(snapshot as any);
    await this.snapshotRepo.markImmutable(saved.id);

    await EventBus.publish(ANALYTICS_DOMAIN_EVENTS.SNAPSHOT_CREATED, {
      snapshotId: saved.id,
      type: "yearly",
      year: y,
    }, { source: "aggregation-service" });

    return saved;
  }

  async refreshSnapshot(id: string): Promise<AnalyticsSnapshot | null> {
    const snapshot = await this.snapshotRepo.findById(id);
    if (!snapshot) return null;

    if (snapshot.immutable) {
      logger.warn(`Cannot refresh immutable snapshot: ${id}`);
      return snapshot;
    }

    const { type, snapshotDate } = snapshot;
    if (type === "daily") return this.generateDailySnapshot(snapshotDate);
    if (type === "monthly") return this.generateMonthlySnapshot(snapshotDate);
    return this.generateYearlySnapshot(snapshotDate.getFullYear());
  }

  async getLatestSnapshot(type: "daily" | "monthly" | "yearly"): Promise<AnalyticsSnapshot | null> {
    return this.snapshotRepo.findLatestByType(type);
  }
}

export default AggregationService;
