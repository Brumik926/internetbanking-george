import { validateIban } from "@/lib/iban-validator";
import { parseMoneyInput, toCents } from "@/lib/money";

export type PaymentDraft = {
  amountInput: string;
  counterparty: string;
  iban?: string | null;
  vs?: string | null;
  note?: string | null;
  userId?: string | null;
};

export type PaymentValidationResult = {
  ok: boolean;
  amountCents?: number;
  amount?: number;
  idempotencyKey?: string;
  error?: string;
};

export function createPaymentIdempotencyKey(
  userId: string | null | undefined,
  counterparty: string,
  amountCents: number,
  iban?: string | null,
  vs?: string | null,
): string {
  const payload = JSON.stringify({
    userId: userId ?? "anonymous",
    counterparty: counterparty.trim(),
    amountCents,
    iban: (iban ?? "").replace(/\s+/g, "").toUpperCase(),
    vs: (vs ?? "").trim(),
  });
  return `pay:${btoa(unescape(encodeURIComponent(payload)))}`;
}

export function validatePaymentDraft(draft: PaymentDraft): PaymentValidationResult {
  const counterparty = draft.counterparty.trim();
  if (!counterparty) {
    return { ok: false, error: "Zadajte meno príjemcu." };
  }

  const parsed = parseMoneyInput(draft.amountInput);
  if (parsed === null) {
    return { ok: false, error: "Zadajte platnú sumu." };
  }

  if (parsed <= 0) {
    return { ok: false, error: "Suma musí byť väčšia ako nula." };
  }

  try {
    const amountCents = toCents(parsed);
    const iban = draft.iban?.trim();
    if (iban && iban.length > 0) {
      const ibanCheck = validateIban(iban);
      if (!ibanCheck.valid) {
        return { ok: false, error: ibanCheck.error ?? "Neplatný IBAN príjemcu." };
      }
    }

    const idempotencyKey = createPaymentIdempotencyKey(
      draft.userId,
      counterparty,
      amountCents,
      draft.iban,
      draft.vs,
    );

    return {
      ok: true,
      amount: parsed,
      amountCents,
      idempotencyKey,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Nastala chyba pri validácii platby.",
    };
  }
}

export function buildSecurePaymentPayload(draft: PaymentDraft) {
  const validation = validatePaymentDraft(draft);
  if (!validation.ok) {
    return validation;
  }

  return {
    ...validation,
    counterparty: draft.counterparty.trim(),
    iban: draft.iban?.trim().toUpperCase() ?? null,
    vs: draft.vs?.trim() || null,
    note: draft.note?.trim() || null,
  };
}
