import { redirect } from "next/navigation";

export default function PricingRulesRedirectPage(): void {
  redirect("/dashboard/pricing?tab=rules");
}
