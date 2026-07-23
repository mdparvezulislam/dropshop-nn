import crypto from "crypto";

export function generateUUID(): string {
  return crypto.randomUUID();
}

export function generateNanoID(size: number = 21): string {
  const alphabet = "useandom-26T198340PX75pxJACKYObvcsgqdwyFghjklert_34";
  let id = "";
  const bytes = crypto.randomBytes(size);
  for (let i = 0; i < size; i++) {
    id += alphabet[bytes[i] % alphabet.length];
  }
  return id;
}
