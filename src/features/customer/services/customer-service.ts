import { CustomerRepository } from "../repositories/customer-repository";
import type { Customer, CustomerAddress, CustomerNote, CustomerStatus, AddressType } from "../domain/customer-entity";
import { OrderRepository } from "@/features/order/repositories/order-repository";
import { logger } from "@/lib/utils/logger";
import { EventBus } from "@/lib/event-bus/event-bus";
import { runInTransaction } from "@/lib/database/query-builder";

export interface CreateCustomerInput {
  workspaceId: string;
  name: string;
  phone: string;
  alternativePhone?: string;
  email?: string;
  gender?: "male" | "female" | "other";
  birthDate?: Date;
  profileImage?: string;
  source: string;
}

export class CustomerService {
  private readonly customerRepository: CustomerRepository;
  private readonly orderRepository: OrderRepository;

  constructor() {
    this.customerRepository = new CustomerRepository();
    this.orderRepository = new OrderRepository();
  }

  async createCustomer(input: CreateCustomerInput, actorId?: string, options?: { session?: any }): Promise<Customer> {
    const execute = async (session: any) => {
      // Check duplicate phone in the same workspace
      const existing = await this.customerRepository.findByPhone(input.phone, input.workspaceId, { session });
      if (existing) {
        throw new Error(`Customer with phone number ${input.phone} already exists in this workspace`);
      }

      const customer = await this.customerRepository.create({
        workspaceId: input.workspaceId,
        name: input.name,
        phone: input.phone,
        alternativePhone: input.alternativePhone,
        email: input.email,
        gender: input.gender,
        birthDate: input.birthDate,
        profileImage: input.profileImage,
        status: "active",
        source: input.source,
        addresses: [],
        notes: [],
        tags: ["Regular"],
        timeline: [
          {
            eventType: "customer.created",
            timestamp: new Date(),
            message: `Customer profile initialized via ${input.source}`,
            actorId,
          },
        ],
        statistics: {
          totalOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          totalSpend: 0,
          averageOrderValue: 0,
        },
      }, { session });

      await EventBus.publish(
        "customer.created",
        {
          customerId: customer.id,
          workspaceId: customer.workspaceId,
          name: customer.name,
          phone: customer.phone,
          source: customer.source,
        },
        { source: "customer" },
      );

      logger.info("CustomerService: customer registered successfully", {
        customerId: customer.id,
        phone: customer.phone,
      });

      return customer;
    };

    if (options?.session) {
      return execute(options.session);
    }
    return runInTransaction(execute);
  }

  async updateCustomer(
    customerId: string,
    data: Partial<Omit<Customer, "id" | "statistics" | "notes" | "addresses" | "timeline">>,
    actorId?: string,
  ): Promise<Customer> {
    return runInTransaction(async (session) => {
      const customer = await this.customerRepository.findById(customerId, { session });
      if (!customer) {
        throw new Error("Customer not found");
      }

      // Check unique constraint if phone changes
      if (data.phone && data.phone !== customer.phone) {
        const dup = await this.customerRepository.findByPhone(data.phone, customer.workspaceId, { session });
        if (dup) {
          throw new Error(`Phone number ${data.phone} already linked to another client in this workspace`);
        }
      }

      const changedFields: string[] = [];
      const updatePayload: any = { ...data };

      // Identify changes for timeline logging
      for (const key of Object.keys(data)) {
        if ((data as any)[key] !== (customer as any)[key]) {
          changedFields.push(key);
        }
      }

      if (changedFields.length > 0) {
        updatePayload.timeline = [
          ...customer.timeline,
          {
            eventType: "customer.updated",
            timestamp: new Date(),
            message: `Updated profile details: ${changedFields.join(", ")}`,
            actorId,
          },
        ];
      }

      const updated = await this.customerRepository.update(customerId, updatePayload, { session });

      await EventBus.publish(
        "customer.updated",
        {
          customerId: updated.id,
          workspaceId: updated.workspaceId,
          name: updated.name,
          phone: updated.phone,
          fieldsChanged: changedFields,
        },
        { source: "customer" },
      );

      logger.info("CustomerService: updated customer profile details", { customerId });
      return updated;
    });
  }

  async addAddress(
    customerId: string,
    addressInput: Omit<CustomerAddress, "id">,
    actorId?: string,
  ): Promise<Customer> {
    return runInTransaction(async (session) => {
      const customer = await this.customerRepository.findById(customerId, { session });
      if (!customer) {
        throw new Error("Customer not found");
      }

      const addressId = `ADR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      const newAddress: CustomerAddress = {
        id: addressId,
        ...addressInput,
      };

      let addresses = [...customer.addresses];
      if (newAddress.isDefault) {
        // Clear previous default settings
        addresses = addresses.map((a) => ({ ...a, isDefault: false }));
      }
      addresses.push(newAddress);

      const timeline = [
        ...customer.timeline,
        {
          eventType: "customer.address_updated",
          timestamp: new Date(),
          message: `Registered new billing address: ${newAddress.type} (${newAddress.area})`,
          actorId,
        },
      ];

      const updated = await this.customerRepository.update(
        customerId,
        { addresses, timeline },
        { session },
      );

      await EventBus.publish(
        "customer.address_updated",
        {
          customerId: updated.id,
          addressId: newAddress.id,
          type: newAddress.type,
        },
        { source: "customer" },
      );

      return updated;
    });
  }

  async addNote(
    customerId: string,
    noteText: string,
    authorId: string,
    isPrivate: boolean,
  ): Promise<Customer> {
    return runInTransaction(async (session) => {
      const customer = await this.customerRepository.findById(customerId, { session });
      if (!customer) {
        throw new Error("Customer not found");
      }

      const newNote: CustomerNote = {
        id: `NTE-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        note: noteText,
        authorId,
        createdAt: new Date(),
        isPrivate,
      };

      const notes = [...customer.notes, newNote];
      const timeline = [
        ...customer.timeline,
        {
          eventType: "customer.note_added",
          timestamp: new Date(),
          message: `Added new ${isPrivate ? "private admin" : "reseller"} remark note`,
          actorId: authorId,
        },
      ];

      return this.customerRepository.update(
        customerId,
        { notes, timeline },
        { session },
      );
    });
  }

  async updateTags(customerId: string, tags: string[], actorId?: string): Promise<Customer> {
    return runInTransaction(async (session) => {
      const customer = await this.customerRepository.findById(customerId, { session });
      if (!customer) {
        throw new Error("Customer not found");
      }

      const oldTags = customer.tags || [];
      const addedTags = tags.filter((t) => !oldTags.includes(t));
      const removedTags = oldTags.filter((t) => !tags.includes(t));

      if (addedTags.length === 0 && removedTags.length === 0) {
        return customer;
      }

      const timeline = [
        ...customer.timeline,
        {
          eventType: "customer.tagged",
          timestamp: new Date(),
          message: `Tags adjusted. Added: [${addedTags.join(", ")}], Removed: [${removedTags.join(", ")}]`,
          actorId,
        },
      ];

      const updated = await this.customerRepository.update(
        customerId,
        { tags, timeline },
        { session },
      );

      await EventBus.publish(
        "customer.tagged",
        {
          customerId: updated.id,
          tags: updated.tags,
          addedTags,
          removedTags,
        },
        { source: "customer" },
      );

      return updated;
    });
  }

  /**
   * Order confirmations trigger: links customer details, creating a profile if they do not exist.
   */
  async createOrAttachCustomer(order: any, options?: { session?: any }): Promise<void> {
    const execute = async (session: any) => {
      const workspaceId = order.resellerId || "admin-platform";
      const phone = order.customer.phone;

      let customer = await this.customerRepository.findByPhone(phone, workspaceId, { session });
      if (!customer) {
        customer = await this.createCustomer(
          {
            workspaceId,
            name: order.customer.name,
            phone: order.customer.phone,
            email: order.customer.email || undefined,
            source: "guest_checkout",
          },
          "system",
          { session },
        );
      }

      const timeline = [
        ...customer.timeline,
        {
          eventType: "customer.order_created",
          timestamp: new Date(),
          message: `Order reference ${order.orderNumber} logged on guest checkout`,
          actorId: "system",
        },
      ];

      await this.customerRepository.update(
        customer.id,
        { timeline },
        { session },
      );

      // Re-trigger stats update to account for the new order count
      await this.refreshStatistics(order.id, { session });
    };

    if (options?.session) {
      return execute(options.session);
    }
    return runInTransaction(execute);
  }

  /**
   * Refreshes customer metrics (totalOrders, completedOrders, cancelledOrders, totalSpend).
   */
  async refreshStatistics(orderId: string, options?: { session?: any }): Promise<void> {
    const execute = async (session: any) => {
      const order = await this.orderRepository.findById(orderId, { session });
      if (!order) return;

      const workspaceId = order.resellerId || "admin-platform";
      const phone = order.customer.phone;

      const customer = await this.customerRepository.findByPhone(phone, workspaceId, { session });
      if (!customer) return;

      // Query all orders belonging to this customer phone in the target workspace
      const query: any = { "customer.phone": phone };
      if (order.resellerId) {
        query.resellerId = order.resellerId;
      } else {
        query.resellerId = { $exists: false };
      }

      const ordersList = await this.orderRepository.find(query, { session });

      let totalOrders = 0;
      let completedOrders = 0;
      let cancelledOrders = 0;
      let totalSpend = 0;
      let lastOrderDate: Date | undefined;

      for (const ord of ordersList) {
        totalOrders++;
        
        if (ord.status === "completed") {
          completedOrders++;
          totalSpend += ord.pricing.grandTotal;
        } else if (ord.status === "cancelled") {
          cancelledOrders++;
        }

        const date = ord.createdAt;
        if (!lastOrderDate || date > lastOrderDate) {
          lastOrderDate = date;
        }
      }

      const averageOrderValue = completedOrders > 0 ? Math.floor(totalSpend / completedOrders) : 0;

      const stats = {
        totalOrders,
        completedOrders,
        cancelledOrders,
        totalSpend,
        averageOrderValue,
        lastOrderDate,
      };

      const timeline = [
        ...customer.timeline,
        {
          eventType: "customer.statistics_refreshed",
          timestamp: new Date(),
          message: `Customer metrics updated. Completed Orders: ${completedOrders}, Total spend: ৳${(totalSpend / 100).toFixed(2)}`,
        },
      ];

      await this.customerRepository.update(
        customer.id,
        { statistics: stats, timeline },
        { session },
      );

      logger.info("CustomerService: refreshed customer metrics statistics", {
        customerId: customer.id,
        stats,
      });
    };

    if (options?.session) {
      return execute(options.session);
    }
    return runInTransaction(execute);
  }
}

export default CustomerService;
