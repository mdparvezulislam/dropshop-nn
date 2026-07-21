import fs from "fs";
import path from "path";

// Load .env file into process.env if present
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  for (const line of envConfig.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

import { SeedRunner } from "./runner";
import { SeedLogger } from "./helpers/logger";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || "--all";

  try {
    await SeedRunner.connect();

    switch (command) {
      case "--all":
        await SeedRunner.seedAll();
        break;
      case "--users":
        await SeedRunner.seedUsersOnly();
        break;
      case "--products":
        await SeedRunner.seedProductsOnly();
        break;
      case "--orders":
        await SeedRunner.seedOrdersOnly();
        break;
      case "--blog":
        await SeedRunner.seedBlogOnly();
        break;
      case "--cms":
        await SeedRunner.seedCmsOnly();
        break;
      case "--finance":
        await SeedRunner.seedFinanceOnly();
        break;
      case "--reset":
        await SeedRunner.resetDatabase();
        break;
      case "--fresh":
        await SeedRunner.freshDatabase();
        break;
      default:
        SeedLogger.error(`Unknown seed command: ${command}`);
        console.log(`
Available commands:
  --all       Seed all platform datasets (default)
  --users     Seed users and system roles only
  --products  Seed categories, brands, suppliers, products, pricing & inventory
  --orders    Seed customers, orders, timelines & logistics
  --blog      Seed blog articles
  --cms       Seed CMS pages, banners & navigation
  --finance   Seed wallets, transaction ledgers & invoices
  --reset     Reset all database collections
  --fresh     Reset database and run full seed pipeline
        `);
        process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    SeedLogger.error("Seed execution failed", error);
    process.exit(1);
  }
}

main();
