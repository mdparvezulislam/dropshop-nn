import type { Metadata } from "next";
import { getAddressesAction } from "@/features/identity/actions/account-actions";
import { AddressBookContent } from "./address-book-content";
import { BRAND } from "@/config/brand";

export const metadata: Metadata = {
  title: `Addresses - ${BRAND.publicName}`,
  robots: { index: false },
};

export default async function AddressesPage() {
  const result = await getAddressesAction();
  return <AddressBookContent initialAddresses={result.success ? (result.data ?? []) : []} />;
}
