import type { ProductCardData } from "@/components/website/product-card";
import type { Category, Brand } from "@/features/catalog/domain/classification-entity";

export interface HeroSlideData {
  id: number;
  badge: string;
  title: string;
  highlightText: string;
  description: string;
  primaryCta: { text: string; href: string };
  secondaryCta: { text: string; href: string };
  tertiaryCta: { text: string; href: string };
  quaternaryCta: { text: string; href: string };
  bannerImage: string;
  metrics: { label: string; value: string }[];
  tag: string;
}

export interface TrustItemData {
  iconName: string;
  label: string;
  description: string;
}

export interface CollectionItemData {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  badge: string;
  badgeColor: string;
  iconName: string;
  gradient: string;
  itemCount: string;
}

export interface PartnerTrackData {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  cta: string;
  badge: string;
  benefits: string[];
}

export interface MegaMenuData {
  categories: Category[];
  featuredCollections: { title: string; slug: string; itemCount: number }[];
  popularBrands: Brand[];
}

export interface PublicStorefrontState {
  cartCount: number;
  wishlistCount: number;
  searchOpen: boolean;
  mobileMenuOpen: boolean;
}
