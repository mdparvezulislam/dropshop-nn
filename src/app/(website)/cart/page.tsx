"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { CartItemRow } from "@/shared/components/website/cart-item-row";
import { CartSummary } from "@/shared/components/website/cart-summary";
import { EmptyCart } from "@/shared/components/website/empty-cart";
import type { CartItemData } from "@/shared/components/website/cart-item-row";

function generateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("cart_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("cart_session_id", id);
  }
  return id;
}

export default function CartPage() {
  const { userRole } = usePermissions();
  const [sessionId, setSessionId] = useState("");
  const [cartId, setCartId] = useState<string | null>(null);
  const [items, setItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    setSessionId(generateSessionId());
  }, []);

  const loadCart = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const { getOrCreateCartAction } = await import(
        "@/features/checkout/actions/checkout-actions"
      );
      const result = await getOrCreateCartAction({
        sessionId,
        type: userRole === "reseller" ? "reseller" : userRole === "wholesaler" ? "wholesaler" : "guest",
      });

      if (result.success && result.data) {
        setCartId(result.data.id);
        setItems(
          result.data.items.map((item: any, index: number) => ({
            index,
            productId: item.productId,
            name: item.productId,
            slug: item.productId,
            image: "",
            variant: item.variantSku,
            sku: item.variantSku,
            quantity: item.quantity,
            resolvedPrice: item.resolvedPrice,
            retailPrice: item.resolvedPrice,
            resellerPrice: item.profitPreview ? undefined : undefined,
            currency: item.currency ?? "BDT",
          })),
        );
      }
    } catch {
      // Cart not available
    } finally {
      setLoading(false);
    }
  }, [sessionId, userRole]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleQuantityChange = async (index: number, quantity: number) => {
    if (!cartId) return;
    if (quantity === 0) {
      handleRemove(index);
      return;
    }

    const prev = [...items];
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity } : item)),
    );

    try {
      const { updateCartItemAction } = await import(
        "@/features/checkout/actions/checkout-actions"
      );
      await updateCartItemAction({ cartId, itemIndex: index, quantity });
    } catch {
      setItems(prev);
    }
  };

  const handleRemove = async (index: number) => {
    if (!cartId) return;
    const prev = [...items];
    setItems((prev) => prev.filter((_, i) => i !== index));

    try {
      const { removeCartItemAction } = await import(
        "@/features/checkout/actions/checkout-actions"
      );
      await removeCartItemAction({ cartId, itemIndex: index });
    } catch {
      setItems(prev);
    }
  };

  const handleClearCart = async () => {
    if (!cartId) return;
    const prev = [...items];
    setItems([]);

    try {
      const { clearCartAction } = await import(
        "@/features/checkout/actions/checkout-actions"
      );
      await clearCartAction(cartId);
    } catch {
      setItems(prev);
    }
  };

  const handleCheckout = async () => {
    if (!cartId) return;
    setCheckoutLoading(true);
    try {
      const { startCheckoutAction } = await import(
        "@/features/checkout/actions/checkout-actions"
      );
      const result = await startCheckoutAction({ cartId, sessionId });
      if (result.success && result.data) {
        window.location.href = `/checkout/${result.data.id}`;
      }
    } catch {
      setCheckoutLoading(false);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.resolvedPrice * item.quantity, 0);

  if (loading) {
    return (
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-lg bg-muted" />
          <div className="h-32 rounded-xl bg-muted" />
          <div className="h-32 rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8 py-8">
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Shopping Cart
          </h1>
          <p className="text-sm text-foreground/50 mt-1">{items.length} items</p>
        </div>
        <button
          type="button"
          onClick={handleClearCart}
          className="flex items-center gap-1.5 text-sm text-foreground/40 hover:text-destructive transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <CartItemRow
              key={`${item.productId}-${item.variant}`}
              item={item}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemove}
            />
          ))}

          <div className="pt-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </div>

        <div>
          <CartSummary
            subtotal={subtotal}
            currency="BDT"
            itemCount={items.reduce((sum, item) => sum + item.quantity, 0)}
            onCheckout={handleCheckout}
            loading={checkoutLoading}
          />
        </div>
      </div>
    </div>
  );
}
