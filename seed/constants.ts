/**
 * DATA-001 — Bangladesh Localized Constants & Master Reference Data
 */

export const BD_LOCATIONS = [
  { division: "Dhaka", district: "Dhaka", upazilas: ["Gulshan", "Dhanmondi", "Uttara", "Mirpur", "Motijheel", "Banani", "Mohammadpur", "Badda", "Khilgaon"] },
  { division: "Dhaka", district: "Gazipur", upazilas: ["Gazipur Sadar", "Kaliakair", "Sreepur", "Kapasia"] },
  { division: "Dhaka", district: "Narayanganj", upazilas: ["Narayanganj Sadar", "Siddhirganj", "Sonargaon", "Rupganj"] },
  { division: "Chattogram", district: "Chattogram", upazilas: ["Agrabad", "GEC", "Panchlaish", "Halishahar", "Kotwali", "Double Mooring"] },
  { division: "Chattogram", district: "Cox's Bazar", upazilas: ["Cox's Bazar Sadar", "Teknaf", "Ukhia"] },
  { division: "Sylhet", district: "Sylhet", upazilas: ["Sylhet Sadar", "Beanibazar", "Golapganj", "Sreemangal"] },
  { division: "Rajshahi", district: "Rajshahi", upazilas: ["Boalia", "Rajpara", "Motihar", "Paba"] },
  { division: "Khulna", district: "Khulna", upazilas: ["Khulna Sadar", "Sonadanga", "Khalishpur", "Daulatpur"] },
  { division: "Barishal", district: "Barishal", upazilas: ["Barishal Sadar", "Babuganj", "Bakerganj"] },
  { division: "Rangpur", district: "Rangpur", upazilas: ["Rangpur Sadar", "Kotwali", "Mithapukur"] },
  { division: "Mymensingh", district: "Mymensingh", upazilas: ["Mymensingh Sadar", "Muktagacha", "Bhaluka"] },
];

export const PHONE_PREFIXES = ["013", "014", "017", "018", "019", "016", "015"];

export const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
];

export const SYSTEM_ROLES = [
  "Super Admin",
  "Admin",
  "Manager",
  "Content Manager",
  "Support Staff",
  "Customer",
  "Reseller",
  "Wholesale Buyer",
  "Supplier",
] as const;

export const DEFAULT_PASSWORD_PLAIN = "Secret123!";
