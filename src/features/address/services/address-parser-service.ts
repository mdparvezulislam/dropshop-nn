import { STEADFAST_LOCATIONS, type SteadfastDistrict } from "@/shared/config/steadfast-locations";

export interface AddressParsingResult {
  originalAddress: string;
  normalizedAddress: string;
  detectedDistrict?: string;
  detectedDistrictId?: string;
  detectedDistrictBn?: string;
  detectedUpazila?: string;
  isDhaka: boolean;
  deliveryFee: number;
  confidenceScore: number; // 0 to 100
  verificationStatus: "VERIFIED" | "PARTIAL" | "PENDING";
}

export class AddressParserService {
  /**
   * Automatically parses raw delivery address text to extract structured district, upazila,
   * delivery zone, delivery charge, confidence score, and verification status.
   */
  static parseAddress(fullAddress: string): AddressParsingResult {
    const raw = fullAddress || "";
    const cleaned = this.normalizeText(raw);

    if (!cleaned) {
      return {
        originalAddress: raw,
        normalizedAddress: "",
        isDhaka: false,
        deliveryFee: 120,
        confidenceScore: 0,
        verificationStatus: "PENDING",
      };
    }

    const lowerCleaned = cleaned.toLowerCase();

    // 1. Detect District
    let matchedDistrict: SteadfastDistrict | undefined = undefined;
    let districtScore = 0;

    for (const dist of STEADFAST_LOCATIONS) {
      const nameLower = dist.name.toLowerCase();
      const bnLower = dist.bnName.toLowerCase();
      const idLower = dist.id.toLowerCase();

      if (
        lowerCleaned.includes(nameLower) ||
        lowerCleaned.includes(bnLower) ||
        lowerCleaned.includes(idLower)
      ) {
        matchedDistrict = dist;
        districtScore = 60;
        break;
      }
    }

    // Default to Dhaka detection if address explicitly mentions dhaka
    if (!matchedDistrict && lowerCleaned.includes("dhaka")) {
      matchedDistrict = STEADFAST_LOCATIONS.find((d) => d.id === "dhaka");
      districtScore = 50;
    }

    // 2. Detect Upazila / Thana
    let matchedUpazila: string | undefined = undefined;
    let upazilaScore = 0;

    if (matchedDistrict) {
      for (const uName of matchedDistrict.upazilas) {
        // Strip bracketed text from upazila string for matching
        const cleanUName = uName.replace(/\(.*?\)/g, "").trim();
        const cleanUNameLower = cleanUName.toLowerCase();

        // Extract Bengali part inside brackets if exists
        const bnMatch = uName.match(/\((.*?)\)/);
        const bnUNameLower = bnMatch ? bnMatch[1].trim().toLowerCase() : "";

        if (
          lowerCleaned.includes(cleanUNameLower) ||
          (bnUNameLower && lowerCleaned.includes(bnUNameLower))
        ) {
          matchedUpazila = cleanUName;
          upazilaScore = 40;
          break;
        }
      }
    } else {
      // Search all upazilas across all districts to infer district
      for (const dist of STEADFAST_LOCATIONS) {
        for (const uName of dist.upazilas) {
          const cleanUName = uName.replace(/\(.*?\)/g, "").trim();
          const cleanUNameLower = cleanUName.toLowerCase();
          const bnMatch = uName.match(/\((.*?)\)/);
          const bnUNameLower = bnMatch ? bnMatch[1].trim().toLowerCase() : "";

          if (
            lowerCleaned.includes(cleanUNameLower) ||
            (bnUNameLower && lowerCleaned.includes(bnUNameLower))
          ) {
            matchedDistrict = dist;
            matchedUpazila = cleanUName;
            districtScore = 50;
            upazilaScore = 40;
            break;
          }
        }
        if (matchedDistrict) break;
      }
    }

    // 3. Compute Confidence & Verification Status
    const totalScore = Math.min(100, districtScore + upazilaScore);
    let verificationStatus: "VERIFIED" | "PARTIAL" | "PENDING" = "PENDING";

    if (totalScore >= 80) {
      verificationStatus = "VERIFIED";
    } else if (totalScore >= 40) {
      verificationStatus = "PARTIAL";
    } else {
      verificationStatus = "PENDING";
    }

    const isDhaka = matchedDistrict ? matchedDistrict.isDhaka : lowerCleaned.includes("dhaka");
    const deliveryFee = isDhaka ? 60 : 120;

    return {
      originalAddress: raw,
      normalizedAddress: cleaned,
      detectedDistrict: matchedDistrict?.name,
      detectedDistrictId: matchedDistrict?.id,
      detectedDistrictBn: matchedDistrict?.bnName,
      detectedUpazila: matchedUpazila,
      isDhaka,
      deliveryFee,
      confidenceScore: totalScore,
      verificationStatus,
    };
  }

  private static normalizeText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, " ")
      .replace(/,+/g, ",")
      .replace(/\.+/g, ".");
  }
}
