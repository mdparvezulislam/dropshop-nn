import { getAccountOverviewAction } from "@/features/identity/actions/account-actions";
import { AccountOverviewContent } from "./overview-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Overview - DropshopNN",
  robots: { index: false },
};

export default async function AccountOverviewPage() {
  const result = await getAccountOverviewAction();

  if (!result.success || !result.data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Account Overview</h1>
        <p className="text-muted-foreground">{result.error || "Could not load account data."}</p>
      </div>
    );
  }

  return <AccountOverviewContent data={result.data} />;
}
