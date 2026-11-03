export function toCents(value: number): number {
  return Math.round(Number(value || 0) * 100);
}

export function fromCents(value: number): number {
  return Number((Math.round(value || 0) / 100).toFixed(2));
}

export function parseMoneyInput(raw: string): number | null {
  const normalized = raw.trim().replace(/\s+/g, "").replace(",", ".");
  if (!normalized) return null;

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;

  return parsed;
}

export function formatMoneyFromCents(cents: number): string {
  return `${fromCents(cents).toFixed(2)} €`;
}