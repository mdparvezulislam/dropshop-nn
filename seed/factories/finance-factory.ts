import { WalletRepository } from "@/features/finance/repositories/wallet-repository";
import { LedgerRepository } from "@/features/finance/repositories/ledger-repository";
import { WithdrawalRepository } from "@/features/finance/repositories/withdrawal-repository";
import { InvoiceRepository } from "@/features/finance/repositories/invoice-repository";
import { SeedLogger } from "../helpers/logger";
import { User } from "@/features/auth/domain/user-entity";
import { Supplier } from "@/features/supplier/domain/supplier-entity";

export async function seedFinance(
  resellers: User[],
  wholesalers: User[],
  suppliers: Supplier[],
): Promise<void> {
  const walletRepo = new WalletRepository();
  const ledgerRepo = new LedgerRepository();
  const withdrawRepo = new WithdrawalRepository();
  const invoiceRepo = new InvoiceRepository();

  let walletCount = 0;
  let ledgerCount = 0;

  // 1. Seed Reseller Wallets & Ledgers
  for (let i = 0; i < resellers.length; i++) {
    const user = resellers[i];
    let wallet = await walletRepo.findByWorkspaceId(user.id);
    if (!wallet) {
      wallet = await walletRepo.create({
        workspaceId: user.id,
        workspaceRole: "reseller",
        currency: "BDT",
        status: "active",
      });
    }
    walletCount++;

    // Seed Ledger Entries
    const existingLedger = await ledgerRepo.find({ walletId: wallet.id });
    if (existingLedger.length === 0) {
      const creditAmt = (i + 1) * 250000;
      await ledgerRepo.create({
        walletId: wallet.id,
        type: "profit_credit",
        amount: creditAmt,
        referenceType: "order",
        referenceId: `ORD-2026-${String(i + 1).padStart(5, "0")}`,
        status: "cleared",
      });
      ledgerCount++;

      // Seed Withdrawal Request for every 3rd reseller
      if (i % 3 === 0) {
        await withdrawRepo.create({
          walletId: wallet.id,
          amount: 150000,
          fee: 1000,
          method: "bkash",
          payoutDetails: {
            accountNumber: user.phone,
            accountName: user.fullName,
            bankName: "bKash Personal",
          },
          status: i % 6 === 0 ? "completed" : "pending",
          referenceNumber: i % 6 === 0 ? `TRX-BKASH-${i}9283` : undefined,
        });
      }
    }
  }

  // 2. Seed Wholesale Invoices & Wallets
  for (let i = 0; i < wholesalers.length; i++) {
    const user = wholesalers[i];
    let wallet = await walletRepo.findByWorkspaceId(user.id);
    if (!wallet) {
      wallet = await walletRepo.create({
        workspaceId: user.id,
        workspaceRole: "wholesaler",
        currency: "BDT",
        status: "active",
      });
    }
    walletCount++;

    const orderNum = `ORD-2026-${String(i + 1).padStart(5, "0")}`;
    const invNum = `INV-2026-${String(i + 1).padStart(5, "0")}`;
    const existingInv = await invoiceRepo.findByOrderNumber(orderNum);
    if (!existingInv) {
      await invoiceRepo.create({
        invoiceNumber: invNum,
        orderId: `ord_${i + 1}`,
        orderNumber: orderNum,
        customerSnapshot: {
          name: user.fullName,
          phone: user.phone,
          address: "Dhaka Commercial Zone",
        },
        businessSnapshot: {
          name: "DropshopNN Enterprise Commerce",
          phone: "01700000000",
          address: "Level 8, Westin Tower, Gulshan 2, Dhaka 1212",
        },
        items: [
          {
            description: "UGREEN Nexode 65W Charger Bulk Lot",
            quantity: 50,
            unitPrice: 275000,
            totalPrice: 13750000,
          },
        ],
        subtotal: 13750000,
        discountTotal: 0,
        taxTotal: 0,
        grandTotal: 13750000,
        currency: "BDT",
        status: i % 2 === 0 ? "paid" : "unpaid",
      });
    }
  }

  SeedLogger.success("Finance wallets, ledgers, withdrawals & invoices seeded", walletCount + ledgerCount);
}
