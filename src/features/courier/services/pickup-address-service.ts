import { PickupAddressRepository } from "../repositories/pickup-address-repository";
import type { PickupAddress } from "../domain/pickup-address-entity";
import type { CreatePickupAddressInput } from "../types/validation";

export class PickupAddressService {
  private readonly repository: PickupAddressRepository;

  constructor() {
    this.repository = new PickupAddressRepository();
  }

  async listAddresses(): Promise<PickupAddress[]> {
    return this.repository.listAddresses();
  }

  async createAddress(data: CreatePickupAddressInput): Promise<PickupAddress> {
    const address = await this.repository.create({
      ...data,
      status: "active",
    } as any);
    if (data.isDefault) {
      await this.repository.setDefaultAddress(address.id);
    }
    return address;
  }

  async setDefault(id: string): Promise<void> {
    await this.repository.setDefaultAddress(id);
  }
}

export default PickupAddressService;
