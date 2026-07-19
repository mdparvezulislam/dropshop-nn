import { SupplierRepository } from "../repositories/supplier-repository";
import { logger } from "@/shared/utils/logger";

export interface SupplierStats {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  returnRate: number;
  performanceScore: number;
}

export class StatisticsService {
  private readonly supplierRepository: SupplierRepository;

  constructor() {
    this.supplierRepository = new SupplierRepository();
  }

  async getSupplierStats(supplierId: string): Promise<SupplierStats> {
    logger.info("StatisticsService: fetching metrics summary", { supplierId });

    // Stubs ready to bind to future Product, Order and Settlement modules
    return {
      totalProducts: 120,
      activeProducts: 98,
      outOfStockProducts: 22,
      pendingOrders: 5,
      completedOrders: 450,
      cancelledOrders: 15,
      returnRate: 2.5, // 2.5%
      performanceScore: 92, // Score 92/100
    };
  }
}
export default StatisticsService;
