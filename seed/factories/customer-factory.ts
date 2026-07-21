import { CustomerRepository } from "@/features/customer/repositories/customer-repository";
import { UserAddressRepository } from "@/features/identity/repositories/user-address-repository";
import { generateBDAddress, generateBDPhone, getRandomElement } from "../helpers/random";
import { SeedLogger } from "../helpers/logger";
import { User } from "@/features/auth/domain/user-entity";
import { Customer } from "@/features/customer/domain/customer-entity";

export async function seedCustomers(customerUsers: User[]): Promise<Customer[]> {
  const customerRepo = new CustomerRepository();
  const addressRepo = new UserAddressRepository();
  const customers: Customer[] = [];

  for (let i = 0; i < customerUsers.length; i++) {
    const user = customerUsers[i];
    const bdAddr = generateBDAddress();

    let customer = await customerRepo.findByPhone(user.phone, "default");
    if (!customer) {
      customer = await customerRepo.create({
        workspaceId: "default",
        name: user.fullName,
        phone: user.phone,
        email: user.email,
        status: user.status === "active" ? "active" : "inactive",
        source: "website",
        addresses: [
          {
            id: `addr_${i}_1`,
            type: "home",
            division: bdAddr.division,
            district: bdAddr.district,
            upazila: bdAddr.upazila,
            area: bdAddr.street,
            postalCode: bdAddr.postalCode,
            isDefault: true,
          },
        ],
        tags: i % 2 === 0 ? ["frequent-buyer", "verified"] : ["new-user"],
        statistics: {
          totalOrders: Math.floor((i % 10) + 1),
          completedOrders: Math.floor((i % 8) + 1),
          cancelledOrders: i % 15 === 0 ? 1 : 0,
          totalSpend: (i + 1) * 450000,
          averageOrderValue: 450000,
          lastOrderDate: new Date(),
        },
      });

      // Seed UserAddress record for Account module
      await addressRepo.create({
        userId: user.id,
        type: "home",
        fullName: user.fullName,
        phone: user.phone,
        division: bdAddr.division,
        district: bdAddr.district,
        upazila: bdAddr.upazila,
        area: bdAddr.street,
        postalCode: bdAddr.postalCode,
        isDefault: true,
      });
    }
    customers.push(customer);
  }

  SeedLogger.success("Customers & Address profiles seeded", customers.length);
  return customers;
}
