import { SupplierRepository } from "@/features/supplier/repositories/supplier-repository";
import { SUPPLIERS_DATA } from "../datasets/suppliers-data";
import { SeedLogger } from "../helpers/logger";
import { Supplier } from "@/features/supplier/domain/supplier-entity";
import { User } from "@/features/auth/domain/user-entity";

export async function seedSuppliers(supplierUsers: User[]): Promise<Supplier[]> {
  const repo = new SupplierRepository();
  const suppliers: Supplier[] = [];

  for (let i = 0; i < SUPPLIERS_DATA.length; i++) {
    const data = SUPPLIERS_DATA[i];
    const user = supplierUsers[i % supplierUsers.length];

    let existing = await repo.findByCode(data.code);
    if (!existing) {
      existing = await repo.create({
        code: data.code,
        businessName: data.companyName,
        ownerName: data.contactPerson,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        supplierCategory: "importer",
        businessType: "importer",
        tradeLicenseNumber: data.tradeLicense,
        binNumber: data.binNumber,
        nidVerified: true,
        businessVerificationStatus: "verified",
        address: {
          country: "Bangladesh",
          division: "Dhaka",
          district: "Dhaka",
          upazila: "Gulshan",
          area: "Gulshan 1",
          postalCode: "1212",
          fullAddress: data.address,
          pickupAddress: data.address,
          returnAddress: data.address,
        },
        contacts: [
          {
            name: data.contactPerson,
            role: "Managing Director",
            phone: data.phone,
            email: data.email,
            isPrimary: true,
            isEmergency: false,
          },
        ],
        banking: {
          accountName: data.companyName,
          accountNumber: "2050392817263",
          bankName: "Islami Bank Bangladesh Ltd",
          branch: "Gulshan Branch",
          routingNumber: "125272635",
        },
        documents: [],
        performance: {
          completedOrders: 450 + i * 20,
          cancelledOrders: 5,
          averageDeliveryDays: 1.5,
          returnRate: 1.2,
          responseTimeHours: 2,
          performanceScore: 98,
        },
        status: "active",
        metadata: { userId: user.id },
      });
    }
    suppliers.push(existing);
  }

  SeedLogger.success("Suppliers seeded", suppliers.length);
  return suppliers;
}
