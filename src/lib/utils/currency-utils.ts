export function formatCurrency(
  amount: number,
  currency: string = "BDT",
  locale: string = "bn-BD",
): string {
  if (currency.toUpperCase() === "BDT") {
    return `৳ ${Math.round(amount).toLocaleString("bn-BD")}`;
  }
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatCentsToCurrency(
  cents: number,
  currency: string = "BDT",
  locale: string = "bn-BD",
): string {
  return formatCurrency(cents / 100, currency, locale);
}

export function currencyToCents(amount: number): number {
  return Math.round(amount * 100);
}
