import { startCheckoutAction, getCheckoutSessionAction } from "@/features/checkout/actions/checkout-actions";
import { redirect } from "next/navigation";
import { CheckoutPageContent } from "@/components/website/checkout-page-content";
import { CartService } from "@/features/checkout/services/cart-service";

interface CheckoutPageProps {
  params: Promise<{ id: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { id } = await params;

  const session = await getCheckoutSessionAction(id);
  if (!session.success || !session.data) {
    redirect("/cart");
  }

  const checkoutSession = session.data;
  const cartService = new CartService();
  const cart = await cartService.getCart(checkoutSession.cartId);
  if (!cart) redirect("/cart");

  const items = cart.items.map((item) => ({
    productId: item.productId,
    name: item.productId,
    quantity: item.quantity,
    resolvedPrice: item.resolvedPrice,
    variantSku: item.variantSku,
  }));

  return (
    <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-8">
        Checkout
      </h1>

      <CheckoutPageContent
        checkoutId={id}
        initialItems={items}
        subtotal={cart.subtotal}
        currency={cart.currency}
        sessionId={checkoutSession.type === "guest" ? checkoutSession.id : undefined}
      />
    </div>
  );
}
