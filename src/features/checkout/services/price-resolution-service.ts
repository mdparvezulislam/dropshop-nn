import { PricingService } from "@/features/pricing/services/pricing-service";
import { ProfitCalculationService } from "@/features/pricing/services/profit-calculation-service";
import { logger } from "@/shared/utils/logger";
import { NotFoundError } from "@/shared/errors/app-error";

export interface PriceResolveRequest {
  productId: string;
  variantSku?: string;
  quantity: number;
  role: "retail" | "reseller" | "wholesale" | "customer";
  campaignCode?: string;
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

export class PriceResolutionService {
  private readonly pricingService: PricingService;
  private readonly profitService: ProfitCalculationService;

  constructor() {
    this.pricingService = new PricingService();
    this.profitService = new ProfitCalculationService();
  }

  async resolveSingle(request: PriceResolveRequest): Promise<ResolvedPrice> {
    logger.info("PriceResolutionService: resolving price", {
      productId: request.productId,
      role: request.role,
      quantity: request.quantity,
    });

    const pricing = await this.pricingService.getPricingByProduct(
      request.productId,
      request.variantSku,
    );

    if (!pricing) {
      throw new NotFoundError(
        `Pricing not found for product ${request.productId}${request.variantSku ? ` / ${request.variantSku}` : ""}`,
      );
    }

    const currency = pricing.currency;

    let unitPrice: number;
    let pricingSource: ResolvedPrice["pricingSource"];
    let campaignId: string | undefined;

    if (request.role === "reseller") {
      unitPrice = pricing.resellerPrice;
      pricingSource = "reseller";
    } else if (request.role === "wholesale") {
      unitPrice = pricing.wholesalePrice;
      pricingSource = "wholesale";
    } else {
      unitPrice = pricing.sellingPrice;
      pricingSource = "retail";
    }

    if (
      pricing.promotionalPrice &&
      pricing.promotionalPrice > 0 &&
      pricing.promotionalPrice < unitPrice
    ) {
      unitPrice = pricing.promotionalPrice;
      pricingSource = pricing.promotionalPrice < pricing.sellingPrice ? "flash_sale" : "campaign";
    }

    const costBasis = pricing.baseCostPrice || pricing.purchasePrice || pricing.supplierPrice;
    const totalPrice = unitPrice * request.quantity;
    const profitAmount = this.profitService.calculateProfitAmount(unitPrice, costBasis) * request.quantity;
    const profitMargin = this.profitService.calculateProfitMargin(unitPrice, costBasis);

    return {
      productId: request.productId,
      variantSku: request.variantSku,
      quantity: request.quantity,
      unitPrice,
      totalPrice,
      currency,
      pricingSource,
      campaignId,
      appliedRules: pricing.pricingRule !== "fixed" ? [pricing.pricingRule] : undefined,
      profitPreview: {
        costBasis,
        profitAmount: Math.round(profitAmount),
        profitMargin: Math.round(profitMargin * 100) / 100,
      },
    };
  }

  async resolveBatch(requests: PriceResolveRequest[]): Promise<ResolvedPrice[]> {
    return Promise.all(requests.map((req) => this.resolveSingle(req)));
  }
}

export default PriceResolutionService;
