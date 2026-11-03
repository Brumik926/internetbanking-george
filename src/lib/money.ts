/** Convert a EUR amount to integer cents, rejecting values that cannot be represented safely. */
export function toCents(value: number): number {
  if (!Number.isFinite(value)) throw new Error("Suma musí byť konečné číslo.");
  const cents = Math.round((value + Number.EPSILON) * 100);
  if (!Number.isSafeInteger(cents)) throw new Error("Suma je mimo povoleného rozsahu.");
  return cents;
}

/** Convert integer cents to a display-compatible EUR number. */
export function fromCents(cents: number): number {
  if (!Number.isSafeInteger(cents)) throw new Error("Suma v centoch musí byť bezpečné celé číslo.");
  return cents / 100;
}

/** Parse Slovak/European decimal input into EUR; rejects ambiguous or over-precise values. */
export function parseMoneyInput(raw: string): number | null {
  const normalized = raw.trim().replace(/\s+/g, "").replace(",", ".");
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function formatCents(cents: number, currency = "EUR", locale = "sk-SK"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(fromCents(cents));
}
