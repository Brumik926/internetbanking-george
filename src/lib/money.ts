export function toCents(value: number): number {
  const safeValue = Number.isFinite(value) ? value : 0;
  return Math.round(safeValue * 100);
}

export function fromCents(value: number): number {
  const safeValue = Number.isFinite(value) ? value : 0;
  return Number((Math.round(safeValue) / 100).toFixed(2));
}

export function parseMoneyInput(raw: string): number | null {
  const normalized = raw.trim().replace(/\s+/g, "").replace(",", ".");
  if (!normalized || Number.isNaN(Number(normalized))) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function sumMoney(values: number[]): number {
  return fromCents(values.reduce((sum, value) => sum + toCents(value), 0));
}

export function moneyStringFromCents(cents: number): string {
  return fromCents(cents).toFixed(2);
}
