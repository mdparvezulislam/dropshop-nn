export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatCentsToCurrency(
  cents: number,
  currency: string = "USD",
  locale: string = "en-US",
): string {
  return formatCurrency(cents / 100, currency, locale);
}

export function currencyToCents(amount: number): number {
  return Math.round(amount * 100);
}
