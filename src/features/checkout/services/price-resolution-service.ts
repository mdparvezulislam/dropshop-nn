import { PricingEngineService } from "@/features/pricing/services/pricing-engine-service";
import { logger } from "@/shared/utils/logger";

export interface PriceResolveRequest {
  productId: string;
  variantSku?: string;
  quantity: number;
  role: "retail" | "reseller" | "wholesale" | "customer";
  campaignCode?: string;
  categoryId?: string;
  brandId?: string;
  supplierId?: string;
  profileId?: string;
}

export interface ResolvedPrice {
  productId: string;
  variantSku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  pricingSource: "retail" | "reseller" | "wholesale" | "campaign" | "flash_sale";
  campaignId?: string;
  appliedRules?: string[];
  profitPreview: {
    costBasis: number;
    profitAmount: number;
    profitMargin: number;
  };
}

function mapRole(requestRole: string): "customer" | "reseller" | "wholesaler" | "distributor" {
  if (requestRole === "reseller") return "reseller";
  if (requestRole === "wholesale") return "wholesaler";
  return "customer";
}

function mapPricingSource(role: string, isCampaign: boolean): ResolvedPrice["pricingSource"] {
  if (isCampaign) return "campaign";
  if (role === "reseller") return "reseller";
  if (role === "wholesale") return "wholesale";
  return "retail";
}

export class PriceResolutionService {
  private readonly engine: PricingEngineService;

  constructor() {
    this.engine = new PricingEngineService();
  }

  async resolveSingle(request: PriceResolveRequest): Promise<ResolvedPrice> {
    logger.info("PriceResolutionService: resolving price via engine", {
      productId: request.productId,
      role: request.role,
      quantity: request.quantity,
    });

    const result = await this.engine.calculatePrice({
      productId: request.productId,
      variantSku: request.variantSku,
      quantity: request.quantity,
      role: mapRole(request.role),
      categoryId: request.categoryId,
      brandId: request.brandId,
      supplierId: request.supplierId,
      profileId: request.profileId,
      campaignCode: request.campaignCode,
    });

    const isCampaign = result.source === "campaign";

    return {
      productId: request.productId,
      variantSku: request.variantSku,
      quantity: request.quantity,
      unitPrice: result.unitPrice,
      totalPrice: result.totalPrice,
      currency: "BDT",
      pricingSource: mapPricingSource(request.role, isCampaign),
      campaignId: result.campaign?.id,
      appliedRules: result.appliedRules,
      profitPreview: {
        costBasis: result.costBasis,
        profitAmount: result.profitAmount,
        profitMargin: result.profitMargin,
      },
    };
  }

  async resolveBatch(requests: PriceResolveRequest[]): Promise<ResolvedPrice[]> {
    return Promise.all(requests.map((req) => this.resolveSingle(req)));
  }
}

export default PriceResolutionService;
