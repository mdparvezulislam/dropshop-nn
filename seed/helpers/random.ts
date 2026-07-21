import { BD_LOCATIONS, PHONE_PREFIXES } from "../constants";

let seedState = 123456789;

/** Deterministic pseudo-random number generator [0, 1) */
export function seededRandom(): number {
  seedState = (seedState * 9301 + 49297) % 233280;
  return seedState / 233280;
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
}

export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(seededRandom() * array.length)];
}

export function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => seededRandom() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

export function getRandomDate(daysBack = 365): Date {
  const now = new Date();
  const pastMs = now.getTime() - Math.floor(seededRandom() * daysBack * 24 * 60 * 60 * 1000);
  return new Date(pastMs);
}

export function generateBDPhone(sequenceIndex?: number): string {
  const prefix = getRandomElement(PHONE_PREFIXES);
  if (sequenceIndex !== undefined) {
    const seqStr = String(sequenceIndex).padStart(8, "0");
    return `${prefix}${seqStr.slice(-8)}`;
  }
  const digits = Array.from({ length: 8 }, () => getRandomInt(0, 9)).join("");
  return `${prefix}${digits}`;
}

export function generateBDAddress() {
  const loc = getRandomElement(BD_LOCATIONS);
  const upazila = getRandomElement(loc.upazilas);
  const houseNo = getRandomInt(1, 150);
  const roadNo = getRandomInt(1, 25);
  const block = getRandomElement(["A", "B", "C", "D", "E", "F", "G"]);
  
  return {
    street: `House ${houseNo}, Road ${roadNo}, Block ${block}`,
    upazila,
    district: loc.district,
    division: loc.division,
    postalCode: String(getRandomInt(1200, 1400)),
    country: "Bangladesh",
  };
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}
