import { SupplierRepository } from "../repositories/supplier-repository";
import { logger } from "@/lib/utils/logger";
import { NotFoundError } from "@/lib/errors/app-error";

export interface SupplierStats {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  returnRate: number;
  averageDeliveryDays: number;
  responseTimeHours: number;
  performanceScore: number;
}

export class StatisticsService {
  private readonly supplierRepository: SupplierRepository;

  constructor() {
    this.supplierRepository = new SupplierRepository();
  }

  async getSupplierStats(supplierId: string): Promise<SupplierStats> {
    logger.info("StatisticsService: fetching metrics summary", { supplierId });

    const supplier = await this.supplierRepository.findById(supplierId);
    if (!supplier) {
      throw new NotFoundError("Supplier not found");
    }

    const perf = supplier.performance;

    return {
      totalProducts: 0,
      activeProducts: 0,
      outOfStockProducts: 0,
      pendingOrders: 0,
      completedOrders: perf?.completedOrders ?? 0,
      cancelledOrders: perf?.cancelledOrders ?? 0,
      returnRate: perf?.returnRate ?? 0,
      averageDeliveryDays: perf?.averageDeliveryDays ?? 0,
      responseTimeHours: perf?.responseTimeHours ?? 0,
      performanceScore: perf?.performanceScore ?? 0,
    };
  }

  async getDashboardSummary(): Promise<{
    totalSuppliers: number;
    activeSuppliers: number;
    pendingSuppliers: number;
    averagePerformanceScore: number;
    totalProductsMapped: number;
  }> {
    const all = await this.supplierRepository.find({});
    const totalSuppliers = all.length;
    const activeSuppliers = all.filter((s) => s.status === "active").length;
    const pendingSuppliers = all.filter((s) => s.status === "pending").length;

    const scores = all
      .filter((s) => s.performance?.performanceScore)
      .map((s) => s.performance!.performanceScore);
    const averagePerformanceScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return {
      totalSuppliers,
      activeSuppliers,
      pendingSuppliers,
      averagePerformanceScore: Math.round(averagePerformanceScore * 100) / 100,
      totalProductsMapped: 0,
    };
  }
}

export default StatisticsService;
