import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { UserRepository } from "@/features/auth/repositories/user-repository";
import { ProfilePageContent } from "./profile-content";
import { BRAND } from "@/config/brand";

export const metadata: Metadata = {
  title: `Profile - ${BRAND.publicName}`,
  robots: { index: false },
};

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) redirect("/auth/login");

  const profile = await new UserRepository().findById(user.id);
  if (!profile) redirect("/auth/login");

  // SECURITY: explicit allow-list. Passing the entity object here previously
  // serialized passwordHash, login history (IPs/UAs), and trusted devices
  // into the client payload — structural typing does not strip fields.
  return (
    <ProfilePageContent
      user={{
        id: profile.id,
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        role: profile.role,
        username: profile.username,
        profileImage: profile.profileImage,
      }}
    />
  );
}
