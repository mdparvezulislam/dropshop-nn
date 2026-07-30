import { BRAND } from "@/config/brand";
import { formatAmount, getOrderPaymentDetails } from "./payment-utils";

/**
 * Generates and prints a clean, professional Tax Invoice for an order in a dedicated print window.
 */
export function printOrderInvoice(order: any): void {
  if (!order) return;

  const orderId = order.id || order._id;
  const orderNumber = order.orderNumber || `#${orderId.slice(-6)}`;
  const customerName = order.customerName || order.customer?.name || order.shipping?.receiverName || "Customer";
  const phone = order.customerPhone || order.customer?.phone || order.shipping?.phone || "";
  const address =
    order.fullAddress ||
    order.shipping?.address ||
    `${order.shipping?.district || order.district || ""}, ${order.shipping?.division || ""}`.trim();

  const resellerShopName =
    order.resellerShopName ||
    order.resellerStoreName ||
    order.storeName ||
    order.shopName ||
    (order.resellerName ? `${order.resellerName} Store` : undefined) ||
    "Unique Store Bd";

  const resellerPhone =
    order.resellerPhone ||
    order.resellerContact ||
    "01608257877";

  const isResellerOrder = order.type === "reseller" || order.resellerId || order.resellerName || order.resellerShopName;
  const channelText = isResellerOrder ? "Online Store" : (order.source || "Website");

  const payDetails = getOrderPaymentDetails(order);
  const grandTotalTaka = payDetails.grandTotal;
  const advancePaidTaka = payDetails.advancePaid;
  const dueAmountTaka = payDetails.dueAmount;

  const rawDeliv =
    order.deliveryChargeCents ??
    (order.pricing?.grandTotal && order.pricing?.subtotal && order.pricing.grandTotal > order.pricing.subtotal
      ? order.pricing.grandTotal - order.pricing.subtotal
      : undefined) ??
    order.shipping?.deliveryFee ??
    order.shipping?.deliveryCharge ??
    order.shippingCost ??
    6000;

  const deliveryTaka = rawDeliv > 1000 ? Math.round(rawDeliv / 100) : rawDeliv;

  const itemsList = (order.items || order.pricing?.items || []).map((item: any) => {
    const rawPrice = item.unitSellingPrice ?? item.unitPrice ?? item.price ?? 0;
    const priceTaka = rawPrice > 5000 ? Math.round(rawPrice / 100) : rawPrice;
    const qty = item.quantity || item.qty || 1;
    return {
      name: item.productName || item.name || "Product Item",
      quantity: qty,
      unitPriceTaka: priceTaka,
      totalTaka: priceTaka * qty,
    };
  });

  const subtotalTaka = itemsList.reduce((sum: number, i: any) => sum + i.totalTaka, 0);

  const dateStr = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString();

  const printWindow = window.open("", "_blank", "width=800,height=900");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - ${orderNumber}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
          .brand-title { font-size: 24px; font-weight: 900; color: #e11d48; letter-spacing: -0.5px; }
          .invoice-badge { font-size: 14px; font-weight: 800; background: #fff1f2; color: #be123c; padding: 4px 12px; border-radius: 8px; border: 1px solid #fecdd3; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 24px 0; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; font-size: 13px; line-height: 1.6; }
          .box-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
          th { background: #f1f5f9; text-align: left; padding: 10px; font-weight: 800; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
          td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; }
          .totals { margin-left: auto; width: 300px; font-size: 13px; margin-top: 20px; }
          .totals-row { display: flex; justify-content: space-between; padding: 6px 0; }
          .totals-grand { font-size: 16px; font-weight: 900; border-top: 2px solid #0f172a; padding-top: 10px; margin-top: 6px; }
          .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand-title">${resellerShopName}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Phone: ${resellerPhone} | Official Customer Invoice</div>
          </div>
          <div style="text-align: right;">
            <div class="invoice-badge">TAX INVOICE / মেমো</div>
            <div style="font-size: 14px; font-weight: 900; margin-top: 8px;">${orderNumber}</div>
            <div style="font-size: 11px; color: #64748b;">${dateStr}</div>
          </div>
        </div>

        <div class="details-grid">
          <div class="box">
            <div class="box-title">Customer Information</div>
            <strong>${customerName}</strong><br/>
            Phone: ${phone}<br/>
            Address: ${address}
          </div>
          <div class="box">
            <div class="box-title">Payment & Fulfillment</div>
            Payment Status: <strong>${payDetails.paymentStatus.toUpperCase()}</strong><br/>
            Channel: <strong>${channelText}</strong>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList
              .map(
                (item: any) => `
              <tr>
                <td><strong>${item.name}</strong></td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">৳ ${formatAmount(item.unitPriceTaka)}</td>
                <td style="text-align: right;">৳ ${formatAmount(item.totalTaka)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row"><span>Subtotal:</span> <span>৳ ${formatAmount(subtotalTaka)}</span></div>
          <div class="totals-row"><span>Delivery Charge:</span> <span>৳ ${formatAmount(deliveryTaka)}</span></div>
          <div class="totals-row totals-grand"><span>Grand Total:</span> <span>৳ ${formatAmount(grandTotalTaka)}</span></div>
          ${advancePaidTaka > 0 ? `<div class="totals-row"><span>Advance Paid:</span> <span style="color:#059669; font-weight:bold;">৳ ${formatAmount(advancePaidTaka)}</span></div>` : ""}
          <div class="totals-row" style="font-weight: 800; color: #dc2626;"><span>Net Due (COD):</span> <span>৳ ${formatAmount(dueAmountTaka)}</span></div>
        </div>

        <div class="footer">
          Thank you for shopping with ${resellerShopName}! For support, contact ${resellerPhone}
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Generates and prints a standard 4"x6" Courier Shipping Label / Parcel Slip.
 */
export function printShippingLabel(order: any): void {
  if (!order) return;

  const orderId = order.id || order._id;
  const orderNumber = order.orderNumber || `#${orderId.slice(-6)}`;
  const customerName = order.customerName || order.customer?.name || order.shipping?.receiverName || "Customer";
  const phone = order.customerPhone || order.customer?.phone || order.shipping?.phone || "";
  const address =
    order.fullAddress ||
    order.shipping?.address ||
    `${order.shipping?.district || order.district || ""}, ${order.shipping?.division || ""}`.trim();
  const district = order.district || order.shipping?.district || "Dhaka";
  const upazila = order.upazila || order.shipping?.upazila || "";

  const resellerShopName =
    order.resellerShopName ||
    order.resellerStoreName ||
    order.storeName ||
    order.shopName ||
    (order.resellerName ? `${order.resellerName} Store` : undefined) ||
    "Unique Store Bd";

  const resellerPhone =
    order.resellerPhone ||
    order.resellerContact ||
    "01608257877";

  const payDetails = getOrderPaymentDetails(order);
  const dueAmount = payDetails.dueAmount;

  const courierName = order.courierInfo?.courierName || order.courierName || "Steadfast Courier";
  const trackingNumber = order.courierInfo?.trackingNumber || order.trackingNumber || `TRK-${orderNumber.replace('#', '')}`;
  const items = order.items || order.pricing?.items || [];
  const itemCount = items.reduce((acc: number, i: any) => acc + (i.quantity || 1), 0);

  const printWindow = window.open("", "_blank", "width=600,height=800");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Shipping Label - ${orderNumber}</title>
        <style>
          @page { size: 4in 6in; margin: 0; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 16px; color: #000; width: 3.8in; height: 5.8in; box-sizing: border-box; border: 2px dashed #000; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 10px; }
          .courier-title { font-size: 18px; font-weight: 900; text-transform: uppercase; }
          .tracking { font-family: monospace; font-size: 14px; font-weight: bold; margin-top: 4px; }
          .section { margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #ccc; }
          .section-title { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #555; }
          .recipient-name { font-size: 16px; font-weight: 900; }
          .phone { font-size: 15px; font-weight: bold; font-family: monospace; }
          .cod-box { background: #000; color: #fff; text-align: center; padding: 8px; font-size: 18px; font-weight: 900; border-radius: 6px; margin: 10px 0; }
          .items-list { font-size: 11px; margin-top: 6px; }
          .merchant { font-size: 10px; color: #444; margin-top: 10px; border-top: 1px solid #000; padding-top: 6px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="courier-title">${courierName}</div>
          <div class="tracking">TRACKING: ${trackingNumber}</div>
        </div>

        <div class="section">
          <div class="section-title">Deliver To:</div>
          <div class="recipient-name">${customerName}</div>
          <div class="phone">📞 ${phone}</div>
          <div style="font-size: 12px; margin-top: 4px;"><strong>${address}</strong></div>
          <div style="font-size: 12px; font-weight: bold; margin-top: 2px;">${upazila ? upazila + ", " : ""}${district}</div>
        </div>

        <div class="cod-box">
          CASH TO COLLECT (COD): ৳ ${formatAmount(dueAmount)}
        </div>

        <div class="section">
          <div class="section-title">Package Contents (${itemCount} Item/s):</div>
          <div class="items-list">
            ${items.map((i: any) => `• ${i.productName || i.name} (x${i.quantity || 1})`).join("<br/>")}
          </div>
        </div>

        <div class="merchant">
          <strong>Merchant / Sender:</strong> ${resellerShopName} (Helpline: ${resellerPhone})
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
