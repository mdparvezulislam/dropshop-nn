/**
 * All 64 districts of Bangladesh, grouped by their division.
 *
 * Picking a district fills in the division too, so checkout asks one question
 * instead of two. `insideDhakaCity` marks the districts that fall inside the
 * cheaper Dhaka-city delivery zone — it seeds the delivery-area choice, which
 * the customer can still override (a Savar address is Dhaka district but
 * outside-city for most couriers).
 */
export interface BdDistrict {
  /** Stable id — English name, lowercased. Stored on the order. */
  id: string;
  /** Bangla name — what the customer sees. */
  name: string;
  /** English name — makes the search box work for latin typists too. */
  nameEn: string;
  division: string;
  divisionEn: string;
  insideDhakaCity?: boolean;
}

export const BD_DISTRICTS: readonly BdDistrict[] = [
  // ── ঢাকা বিভাগ ─────────────────────────────────────────────────────
  {
    id: "dhaka",
    name: "ঢাকা",
    nameEn: "Dhaka",
    division: "ঢাকা",
    divisionEn: "Dhaka",
    insideDhakaCity: true,
  },
  { id: "gazipur", name: "গাজীপুর", nameEn: "Gazipur", division: "ঢাকা", divisionEn: "Dhaka" },
  {
    id: "narayanganj",
    name: "নারায়ণগঞ্জ",
    nameEn: "Narayanganj",
    division: "ঢাকা",
    divisionEn: "Dhaka",
  },
  { id: "narsingdi", name: "নরসিংদী", nameEn: "Narsingdi", division: "ঢাকা", divisionEn: "Dhaka" },
  {
    id: "munshiganj",
    name: "মুন্সিগঞ্জ",
    nameEn: "Munshiganj",
    division: "ঢাকা",
    divisionEn: "Dhaka",
  },
  {
    id: "manikganj",
    name: "মানিকগঞ্জ",
    nameEn: "Manikganj",
    division: "ঢাকা",
    divisionEn: "Dhaka",
  },
  { id: "tangail", name: "টাঙ্গাইল", nameEn: "Tangail", division: "ঢাকা", divisionEn: "Dhaka" },
  {
    id: "kishoreganj",
    name: "কিশোরগঞ্জ",
    nameEn: "Kishoreganj",
    division: "ঢাকা",
    divisionEn: "Dhaka",
  },
  { id: "faridpur", name: "ফরিদপুর", nameEn: "Faridpur", division: "ঢাকা", divisionEn: "Dhaka" },
  {
    id: "gopalganj",
    name: "গোপালগঞ্জ",
    nameEn: "Gopalganj",
    division: "ঢাকা",
    divisionEn: "Dhaka",
  },
  {
    id: "madaripur",
    name: "মাদারীপুর",
    nameEn: "Madaripur",
    division: "ঢাকা",
    divisionEn: "Dhaka",
  },
  { id: "rajbari", name: "রাজবাড়ী", nameEn: "Rajbari", division: "ঢাকা", divisionEn: "Dhaka" },
  {
    id: "shariatpur",
    name: "শরীয়তপুর",
    nameEn: "Shariatpur",
    division: "ঢাকা",
    divisionEn: "Dhaka",
  },

  // ── চট্টগ্রাম বিভাগ ────────────────────────────────────────────────
  {
    id: "chattogram",
    name: "চট্টগ্রাম",
    nameEn: "Chattogram",
    division: "চট্টগ্রাম",
    divisionEn: "Chattogram",
  },
  {
    id: "coxs-bazar",
    name: "কক্সবাজার",
    nameEn: "Cox's Bazar",
    division: "চট্টগ্রাম",
    divisionEn: "Chattogram",
  },
  {
    id: "cumilla",
    name: "কুমিল্লা",
    nameEn: "Cumilla",
    division: "চট্টগ্রাম",
    divisionEn: "Chattogram",
  },
  {
    id: "brahmanbaria",
    name: "ব্রাহ্মণবাড়িয়া",
    nameEn: "Brahmanbaria",
    division: "চট্টগ্রাম",
    divisionEn: "Chattogram",
  },
  {
    id: "chandpur",
    name: "চাঁদপুর",
    nameEn: "Chandpur",
    division: "চট্টগ্রাম",
    divisionEn: "Chattogram",
  },
  { id: "feni", name: "ফেনী", nameEn: "Feni", division: "চট্টগ্রাম", divisionEn: "Chattogram" },
  {
    id: "lakshmipur",
    name: "লক্ষ্মীপুর",
    nameEn: "Lakshmipur",
    division: "চট্টগ্রাম",
    divisionEn: "Chattogram",
  },
  {
    id: "noakhali",
    name: "নোয়াখালী",
    nameEn: "Noakhali",
    division: "চট্টগ্রাম",
    divisionEn: "Chattogram",
  },
  {
    id: "bandarban",
    name: "বান্দরবান",
    nameEn: "Bandarban",
    division: "চট্টগ্রাম",
    divisionEn: "Chattogram",
  },
  {
    id: "khagrachhari",
    name: "খাগড়াছড়ি",
    nameEn: "Khagrachhari",
    division: "চট্টগ্রাম",
    divisionEn: "Chattogram",
  },
  {
    id: "rangamati",
    name: "রাঙ্গামাটি",
    nameEn: "Rangamati",
    division: "চট্টগ্রাম",
    divisionEn: "Chattogram",
  },

  // ── রাজশাহী বিভাগ ──────────────────────────────────────────────────
  {
    id: "rajshahi",
    name: "রাজশাহী",
    nameEn: "Rajshahi",
    division: "রাজশাহী",
    divisionEn: "Rajshahi",
  },
  { id: "bogura", name: "বগুড়া", nameEn: "Bogura", division: "রাজশাহী", divisionEn: "Rajshahi" },
  { id: "pabna", name: "পাবনা", nameEn: "Pabna", division: "রাজশাহী", divisionEn: "Rajshahi" },
  {
    id: "sirajganj",
    name: "সিরাজগঞ্জ",
    nameEn: "Sirajganj",
    division: "রাজশাহী",
    divisionEn: "Rajshahi",
  },
  { id: "natore", name: "নাটোর", nameEn: "Natore", division: "রাজশাহী", divisionEn: "Rajshahi" },
  { id: "naogaon", name: "নওগাঁ", nameEn: "Naogaon", division: "রাজশাহী", divisionEn: "Rajshahi" },
  {
    id: "joypurhat",
    name: "জয়পুরহাট",
    nameEn: "Joypurhat",
    division: "রাজশাহী",
    divisionEn: "Rajshahi",
  },
  {
    id: "chapainawabganj",
    name: "চাঁপাইনবাবগঞ্জ",
    nameEn: "Chapainawabganj",
    division: "রাজশাহী",
    divisionEn: "Rajshahi",
  },

  // ── খুলনা বিভাগ ────────────────────────────────────────────────────
  { id: "khulna", name: "খুলনা", nameEn: "Khulna", division: "খুলনা", divisionEn: "Khulna" },
  { id: "jashore", name: "যশোর", nameEn: "Jashore", division: "খুলনা", divisionEn: "Khulna" },
  { id: "kushtia", name: "কুষ্টিয়া", nameEn: "Kushtia", division: "খুলনা", divisionEn: "Khulna" },
  {
    id: "satkhira",
    name: "সাতক্ষীরা",
    nameEn: "Satkhira",
    division: "খুলনা",
    divisionEn: "Khulna",
  },
  { id: "bagerhat", name: "বাগেরহাট", nameEn: "Bagerhat", division: "খুলনা", divisionEn: "Khulna" },
  {
    id: "chuadanga",
    name: "চুয়াডাঙ্গা",
    nameEn: "Chuadanga",
    division: "খুলনা",
    divisionEn: "Khulna",
  },
  {
    id: "jhenaidah",
    name: "ঝিনাইদহ",
    nameEn: "Jhenaidah",
    division: "খুলনা",
    divisionEn: "Khulna",
  },
  { id: "magura", name: "মাগুরা", nameEn: "Magura", division: "খুলনা", divisionEn: "Khulna" },
  { id: "meherpur", name: "মেহেরপুর", nameEn: "Meherpur", division: "খুলনা", divisionEn: "Khulna" },
  { id: "narail", name: "নড়াইল", nameEn: "Narail", division: "খুলনা", divisionEn: "Khulna" },

  // ── বরিশাল বিভাগ ───────────────────────────────────────────────────
  {
    id: "barishal",
    name: "বরিশাল",
    nameEn: "Barishal",
    division: "বরিশাল",
    divisionEn: "Barishal",
  },
  { id: "bhola", name: "ভোলা", nameEn: "Bhola", division: "বরিশাল", divisionEn: "Barishal" },
  {
    id: "patuakhali",
    name: "পটুয়াখালী",
    nameEn: "Patuakhali",
    division: "বরিশাল",
    divisionEn: "Barishal",
  },
  {
    id: "pirojpur",
    name: "পিরোজপুর",
    nameEn: "Pirojpur",
    division: "বরিশাল",
    divisionEn: "Barishal",
  },
  { id: "barguna", name: "বরগুনা", nameEn: "Barguna", division: "বরিশাল", divisionEn: "Barishal" },
  {
    id: "jhalokati",
    name: "ঝালকাঠি",
    nameEn: "Jhalokati",
    division: "বরিশাল",
    divisionEn: "Barishal",
  },

  // ── সিলেট বিভাগ ────────────────────────────────────────────────────
  { id: "sylhet", name: "সিলেট", nameEn: "Sylhet", division: "সিলেট", divisionEn: "Sylhet" },
  {
    id: "moulvibazar",
    name: "মৌলভীবাজার",
    nameEn: "Moulvibazar",
    division: "সিলেট",
    divisionEn: "Sylhet",
  },
  { id: "habiganj", name: "হবিগঞ্জ", nameEn: "Habiganj", division: "সিলেট", divisionEn: "Sylhet" },
  {
    id: "sunamganj",
    name: "সুনামগঞ্জ",
    nameEn: "Sunamganj",
    division: "সিলেট",
    divisionEn: "Sylhet",
  },

  // ── রংপুর বিভাগ ────────────────────────────────────────────────────
  { id: "rangpur", name: "রংপুর", nameEn: "Rangpur", division: "রংপুর", divisionEn: "Rangpur" },
  {
    id: "dinajpur",
    name: "দিনাজপুর",
    nameEn: "Dinajpur",
    division: "রংপুর",
    divisionEn: "Rangpur",
  },
  {
    id: "gaibandha",
    name: "গাইবান্ধা",
    nameEn: "Gaibandha",
    division: "রংপুর",
    divisionEn: "Rangpur",
  },
  {
    id: "kurigram",
    name: "কুড়িগ্রাম",
    nameEn: "Kurigram",
    division: "রংপুর",
    divisionEn: "Rangpur",
  },
  {
    id: "lalmonirhat",
    name: "লালমনিরহাট",
    nameEn: "Lalmonirhat",
    division: "রংপুর",
    divisionEn: "Rangpur",
  },
  {
    id: "nilphamari",
    name: "নীলফামারী",
    nameEn: "Nilphamari",
    division: "রংপুর",
    divisionEn: "Rangpur",
  },
  {
    id: "panchagarh",
    name: "পঞ্চগড়",
    nameEn: "Panchagarh",
    division: "রংপুর",
    divisionEn: "Rangpur",
  },
  {
    id: "thakurgaon",
    name: "ঠাকুরগাঁও",
    nameEn: "Thakurgaon",
    division: "রংপুর",
    divisionEn: "Rangpur",
  },

  // ── ময়মনসিংহ বিভাগ ─────────────────────────────────────────────────
  {
    id: "mymensingh",
    name: "ময়মনসিংহ",
    nameEn: "Mymensingh",
    division: "ময়মনসিংহ",
    divisionEn: "Mymensingh",
  },
  {
    id: "jamalpur",
    name: "জামালপুর",
    nameEn: "Jamalpur",
    division: "ময়মনসিংহ",
    divisionEn: "Mymensingh",
  },
  {
    id: "netrokona",
    name: "নেত্রকোণা",
    nameEn: "Netrokona",
    division: "ময়মনসিংহ",
    divisionEn: "Mymensingh",
  },
  {
    id: "sherpur",
    name: "শেরপুর",
    nameEn: "Sherpur",
    division: "ময়মনসিংহ",
    divisionEn: "Mymensingh",
  },
] as const;

const BY_ID = new Map(BD_DISTRICTS.map((d) => [d.id, d]));

export function getDistrict(id: string): BdDistrict | undefined {
  return BY_ID.get(id);
}

/**
 * Search across Bangla name, English name and division so both keyboards work.
 * Exact prefix matches rank first — typing "ঢা" should put ঢাকা at the top,
 * not bury it under every district whose division is ঢাকা.
 */
export function searchDistricts(query: string): BdDistrict[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...BD_DISTRICTS];

  const scored: Array<{ district: BdDistrict; score: number }> = [];
  for (const district of BD_DISTRICTS) {
    const name = district.name.toLowerCase();
    const nameEn = district.nameEn.toLowerCase();
    const division = `${district.division} ${district.divisionEn}`.toLowerCase();

    let score = -1;
    if (name === q || nameEn === q) score = 0;
    else if (name.startsWith(q) || nameEn.startsWith(q)) score = 1;
    else if (name.includes(q) || nameEn.includes(q)) score = 2;
    else if (division.includes(q)) score = 3;

    if (score >= 0) scored.push({ district, score });
  }

  return scored
    .sort((a, b) => a.score - b.score || a.district.nameEn.localeCompare(b.district.nameEn))
    .map((s) => s.district);
}
