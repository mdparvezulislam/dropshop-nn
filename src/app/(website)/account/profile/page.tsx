import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { UserRepository } from "@/features/auth/repositories/user-repository";
import { UserAddressRepository } from "@/features/identity/repositories/user-address-repository";
import { ProfilePageContent } from "./profile-content";

export const metadata: Metadata = {
  title: "Profile - DropshopNN",
  robots: { index: false },
};

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user as { id?: string; name?: string } | undefined;
  if (!user?.id) return null;

  const userRepo = new UserRepository();
  const profile = await userRepo.findById(user.id);

  return <ProfilePageContent user={profile!} />;
}
