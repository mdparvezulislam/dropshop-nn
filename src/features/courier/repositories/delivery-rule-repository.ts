import { BaseRepository } from "@/lib/database/generic-repository";
import { DeliveryZoneModel, ShippingRuleModel, DeliveryCostRuleModel } from "./delivery-rule-model";
import type { DeliveryZone, ShippingRule, DeliveryCostRule } from "../domain/delivery-rule-entity";
import type { BaseDocument } from "@/lib/database/types";

interface DeliveryZoneDocument extends BaseDocument {
  name: string;
  country: string;
  division: string;
  district: string;
  area: string;
  zoneCode: string;
  shippingCategory: any;
}

function mapToZone(doc: any): DeliveryZone {
  return {
    id: doc.id ?? doc._id?.toString(),
    name: doc.name,
    country: doc.country,
    division: doc.division,
    district: doc.district,
    area: doc.area,
    zoneCode: doc.zoneCode,
    shippingCategory: doc.shippingCategory,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    status: doc.status || "active",
    metadata: doc.metadata,
  };
}

function mapToShippingRule(doc: any): ShippingRule {
  return {
    id: doc.id ?? doc._id?.toString(),
    ruleName: doc.ruleName,
    preferredCourier: doc.preferredCourier,
    zoneCode: doc.zoneCode,
    maxCodLimitCents: doc.maxCodLimitCents,
    maxWeightGrams: doc.maxWeightGrams,
    packageType: doc.packageType,
    isPriority: doc.isPriority ?? false,
    active: doc.active ?? true,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    status: doc.status || "active",
    metadata: doc.metadata,
  };
}

function mapToCostRule(doc: any): DeliveryCostRule {
  return {
    id: doc.id ?? doc._id?.toString(),
    ruleName: doc.ruleName,
    ruleType: doc.ruleType,
    baseCostCents: doc.baseCostCents,
    extraWeightUnitGrams: doc.extraWeightUnitGrams,
    extraWeightCostCents: doc.extraWeightCostCents,
    courierProvider: doc.courierProvider,
    zoneCode: doc.zoneCode,
    active: doc.active ?? true,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    status: doc.status || "active",
    metadata: doc.metadata,
  };
}

export class DeliveryRuleRepository extends BaseRepository<DeliveryZoneDocument, DeliveryZone> {
  constructor() {
    super(DeliveryZoneModel as any, mapToZone);
  }

  async listZones(): Promise<DeliveryZone[]> {
    await this.ensureConnected();
    const docs = await DeliveryZoneModel.find({ isDeleted: { $ne: true } }).lean();
    return docs.map((d: any) => mapToZone({ ...d, id: d._id.toString() }));
  }

  async listShippingRules(): Promise<ShippingRule[]> {
    await this.ensureConnected();
    const docs = await ShippingRuleModel.find({ isDeleted: { $ne: true } }).lean();
    return docs.map((d: any) => mapToShippingRule({ ...d, id: d._id.toString() }));
  }

  async createShippingRule(data: any): Promise<ShippingRule> {
    await this.ensureConnected();
    const doc = await ShippingRuleModel.create(data);
    return mapToShippingRule({ ...doc.toObject(), id: doc._id.toString() });
  }

  async listCostRules(): Promise<DeliveryCostRule[]> {
    await this.ensureConnected();
    const docs = await DeliveryCostRuleModel.find({ isDeleted: { $ne: true } }).lean();
    return docs.map((d: any) => mapToCostRule({ ...d, id: d._id.toString() }));
  }

  async createCostRule(data: any): Promise<DeliveryCostRule> {
    await this.ensureConnected();
    const doc = await DeliveryCostRuleModel.create(data);
    return mapToCostRule({ ...doc.toObject(), id: doc._id.toString() });
  }
}

export default DeliveryRuleRepository;
