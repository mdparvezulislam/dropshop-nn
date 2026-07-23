import { DatabaseConnectionManager } from "@/lib/database/connection-manager";
import { env } from "@/config/env";
import { SeedLogger } from "./helpers/logger";
import { seedUsers } from "./factories/user-factory";
import { seedBrands } from "./factories/brand-factory";
import { seedCategories } from "./factories/category-factory";
import { seedSuppliers } from "./factories/supplier-factory";
import { seedProducts } from "./factories/product-factory";
import { seedCustomers } from "./factories/customer-factory";
import { seedOrders } from "./factories/order-factory";
import { seedFinance } from "./factories/finance-factory";
import { seedCoupons } from "./factories/coupon-factory";
import { seedBlogs } from "./factories/blog-factory";
import { seedCms } from "./factories/cms-factory";
import { seedReviews } from "./factories/review-factory";
import { seedNotifications } from "./factories/notification-factory";
import { seedCourierShipments } from "./factories/courier-factory";
import { seedAnalytics } from "./factories/analytics-factory";

export class SeedRunner {
  private static assertSafety(): void {
    if (env.NODE_ENV === "production") {
      SeedLogger.error("CRITICAL SAFETY GUARD: Cannot run database seed in production environment!");
      process.exit(1);
    }
  }

  static async connect(): Promise<void> {
    this.assertSafety();
    SeedLogger.info("Connecting to MongoDB database...");
    await DatabaseConnectionManager.connect();
    SeedLogger.info("MongoDB Connection Active");
  }

  static async seedAll(): Promise<void> {
    const startTime = Date.now();
    SeedLogger.info("Starting DATA-001 Enterprise Seed Pipeline...");

    SeedLogger.step(1, 9, "Seeding Users & System Roles");
    const { superAdmin, admins, resellers, wholesalers, suppliers: supplierUsers, customers: customerUsers } = await seedUsers();

    SeedLogger.step(2, 9, "Seeding Categories & Brands");
    const brands = await seedBrands();
    const categories = await seedCategories();

    SeedLogger.step(3, 9, "Seeding Supplier Profiles");
    const suppliers = await seedSuppliers(supplierUsers);

    SeedLogger.step(4, 9, "Seeding Products, Pricing & Inventory");
    const products = await seedProducts(categories, brands, suppliers);

    SeedLogger.step(5, 9, "Seeding Customer Accounts & Addresses");
    const customers = await seedCustomers(customerUsers);

    SeedLogger.step(6, 9, "Seeding Orders, Timelines & Logistics");
    await seedOrders(customers, products, resellers, wholesalers);

    SeedLogger.step(7, 9, "Seeding Finance Wallets, Ledgers & Invoices");
    await seedFinance(resellers, wholesalers, suppliers);

    SeedLogger.step(8, 9, "Seeding CMS, Blog & Marketing Content");
    await seedCoupons();
    await seedBlogs();
    await seedCms();

    SeedLogger.step(9, 9, "Seeding Reviews, Notifications, Logistics & Analytics");
    await seedReviews(products, customerUsers);
    await seedNotifications(customerUsers);
    await seedCourierShipments();
    await seedAnalytics(products, customerUsers);

    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
    SeedLogger.success(`🎉 COMPLETE DATA-001 SEED PIPELINE FINISHED IN ${elapsedSec}s!`);
  }

  static async seedUsersOnly(): Promise<void> {
    SeedLogger.info("Seeding Users only...");
    await seedUsers();
  }

  static async seedProductsOnly(): Promise<void> {
    SeedLogger.info("Seeding Products only...");
    const { suppliers: supplierUsers } = await seedUsers();
    const brands = await seedBrands();
    const categories = await seedCategories();
    const suppliers = await seedSuppliers(supplierUsers);
    await seedProducts(categories, brands, suppliers);
  }

  static async seedOrdersOnly(): Promise<void> {
    SeedLogger.info("Seeding Orders only...");
    const { resellers, wholesalers, suppliers: supplierUsers, customers: customerUsers } = await seedUsers();
    const brands = await seedBrands();
    const categories = await seedCategories();
    const suppliers = await seedSuppliers(supplierUsers);
    const products = await seedProducts(categories, brands, suppliers);
    const customers = await seedCustomers(customerUsers);
    await seedOrders(customers, products, resellers, wholesalers);
  }

  static async seedBlogOnly(): Promise<void> {
    SeedLogger.info("Seeding Blog Articles only...");
    await seedBlogs();
  }

  static async seedCmsOnly(): Promise<void> {
    SeedLogger.info("Seeding CMS Content & Banners only...");
    await seedCms();
  }

  static async seedFinanceOnly(): Promise<void> {
    SeedLogger.info("Seeding Finance Wallets & Ledgers only...");
    const { resellers, wholesalers, suppliers: supplierUsers } = await seedUsers();
    const suppliers = await seedSuppliers(supplierUsers);
    await seedFinance(resellers, wholesalers, suppliers);
  }

  static async resetDatabase(): Promise<void> {
    this.assertSafety();
    SeedLogger.warn("Resetting database collections...");
    const conn = await DatabaseConnectionManager.connect();
    const db = conn.connection.db;
    if (db) {
      const collections = await db.listCollections().toArray();
      for (const col of collections) {
        if (!col.name.startsWith("system.")) {
          await db.collection(col.name).deleteMany({});
          SeedLogger.info(`Cleared collection: ${col.name}`);
        }
      }
    }
    SeedLogger.success("Database Reset Completed!");
  }

  static async freshDatabase(): Promise<void> {
    await this.resetDatabase();
    await this.seedAll();
  }
}
