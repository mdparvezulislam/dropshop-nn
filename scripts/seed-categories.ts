import { DatabaseConnectionManager } from "@/lib/database/connection-manager";
import { CategoryRepository } from "@/features/catalog/repositories/classification-repository";
import { logger } from "@/lib/utils/logger";

export const DEFAULT_CATEGORIES = [
  {
    name: "ইলেকট্রনিক্স ও গ্যাজেট",
    slug: "electronics-gadgets",
    description: "স্মার্ট ইলেকট্রনিক্স, চার্জার, ব্লুটুথ ডিভাইস ও নিত্যপ্রয়োজনীয় গ্যাজেট কালেকশন।",
    image: "/images/categories/electronics-gadgets.webp",
    sortOrder: 1,
  },
  {
    name: "হোম ও কিচেন অ্যাপ্লায়েন্স",
    slug: "home-kitchen",
    description: "রান্নাঘর ও গৃহস্থালি কাজের জন্য আধুনিক ও টেকসই হোম অ্যাপ্লায়েন্স।",
    image: "/images/categories/home-kitchen.webp",
    sortOrder: 2,
  },
  {
    name: "স্মার্ট ওয়াচ ও ফিটনেস ট্র্যাকার",
    slug: "smartwatches-fitness",
    description: "ওয়াটারপ্রুফ স্মার্ট ওয়াচ, হার্ট রেট মনিটর ও হেলথ ফিটনেস ট্র্যাকার।",
    image: "/images/categories/smartwatches-fitness.webp",
    sortOrder: 3,
  },
  {
    name: "মোবাইল অ্যাক্সেসরিজ",
    slug: "mobile-accessories",
    description: "মোবাইল কেস, গ্লাস প্রোটেক্টর, ফাস্ট পাওয়ার ব্যাংক ও পাওয়ার কেবল।",
    image: "/images/categories/mobile-accessories.webp",
    sortOrder: 4,
  },
  {
    name: "ফ্যাশন ও লাইফস্টাইল",
    slug: "fashion-lifestyle",
    description: "ট্রেন্ডি ব্যাগ, ওয়ালেট, সানগ্লাস ও দৈনন্দিন লাইফস্টাইল অ্যাক্সেসরিজ।",
    image: "/images/categories/fashion-lifestyle.webp",
    sortOrder: 5,
  },
  {
    name: "বিউটি ও পার্সোনাল কেয়ার",
    slug: "beauty-personal-care",
    description: "স্কিন কেয়ার, হেয়ার ট্রিমার, শেভার ও ব্যক্তিগত যত্ন সামগ্রী।",
    image: "/images/categories/beauty-personal-care.webp",
    sortOrder: 6,
  },
  {
    name: "বেবি ও কিডস প্রোডাক্ট",
    slug: "baby-kids",
    description: "শিশুদের খেলনা, শিক্ষণীয় গ্যাজেট ও বেবি কেয়ার সামগ্রী।",
    image: "/images/categories/baby-kids.webp",
    sortOrder: 7,
  },
  {
    name: "স্পোর্টস ও আউটডোর",
    slug: "sports-outdoors",
    description: "খেলাধুলা, ট্রাভেল ব্যাগ ও আউটডোর অ্যাডভেঞ্চার গিয়ার।",
    image: "/images/categories/sports-outdoors.webp",
    sortOrder: 8,
  },
];

export async function seedCategories(): Promise<void> {
  await DatabaseConnectionManager.connect();
  const categoryRepo = new CategoryRepository();

  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await categoryRepo.findOne({ slug: cat.slug });
    if (!existing) {
      await categoryRepo.create({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        sortOrder: cat.sortOrder,
        isActive: true,
        isDeleted: false,
      });
      logger.info(`Created category: ${cat.name}`);
    } else {
      await categoryRepo.update(existing.id, {
        name: cat.name,
        description: cat.description,
        image: cat.image,
        sortOrder: cat.sortOrder,
      });
      logger.info(`Updated category: ${cat.name}`);
    }
  }

  logger.info("Category seeding completed successfully.");
}

if (require.main === module) {
  seedCategories()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error("Category seeding failed", err);
      process.exit(1);
    });
}
