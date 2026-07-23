import { BaseDBEntity } from "@/lib/database/types";

export interface StoreSocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  whatsapp?: string;
  telegram?: string;
}

export interface StoreProfile extends BaseDBEntity {
  businessProfileId: string;
  userId: string;
  storeName: string;
  storeSlug: string;
  storeLogo?: string;
  storeBanner?: string;
  theme?: string;
  color?: string;
  description?: string;
  contactPhone?: string;
  contactEmail?: string;
  socialLinks?: StoreSocialLinks;
}

export default StoreProfile;
