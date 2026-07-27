import { redirect } from "next/navigation";

/**
 * Legacy courier hub — the feature has been consolidated into
 * /dashboard/shipments (fulfillment console).
 * Redirecting to the new location preserves bookmarks and existing links.
 */
export default function CourierRedirectPage(): never {
  redirect("/dashboard/shipments");
}
