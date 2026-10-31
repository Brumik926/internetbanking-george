/**
 * Bezpečná správa George PIN kódu pre autorizáciu platieb.
 * Využíva SHA-256 heshovanie naviazané na ID používateľa.
 */

const PIN_STORAGE_KEY_PREFIX = "george-pin-hash:";
const DEFAULT_INITIAL_PIN = "1234";

async function hashPin(pin: string, userId: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${userId}:${pin}:george-bank-salt-2026`);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hasUserPin(userId: string): Promise<boolean> {
  const key = `${PIN_STORAGE_KEY_PREFIX}${userId}`;
  return window.localStorage.getItem(key) !== null;
}

export async function setUserPin(userId: string, newPin: string): Promise<{ success: boolean; error?: string }> {
  const cleaned = newPin.trim();
  if (!/^\d{4,6}$/.test(cleaned)) {
    return { success: false, error: "PIN musí obsahovať 4 až 6 číslic." };
  }

  const hash = await hashPin(cleaned, userId);
  window.localStorage.setItem(`${PIN_STORAGE_KEY_PREFIX}${userId}`, hash);
  return { success: true };
}

export async function verifyUserPin(userId: string, inputPin: string): Promise<{ valid: boolean; error?: string }> {
  const cleaned = inputPin.trim();
  if (!/^\d{4,6}$/.test(cleaned)) {
    return { valid: false, error: "Zadajte 4 až 6-miestny číselný PIN kód." };
  }

  const key = `${PIN_STORAGE_KEY_PREFIX}${userId}`;
  let storedHash = window.localStorage.getItem(key);

  if (!storedHash) {
    storedHash = await hashPin(DEFAULT_INITIAL_PIN, userId);
    window.localStorage.setItem(key, storedHash);
  }

  const inputHash = await hashPin(cleaned, userId);
  if (inputHash !== storedHash) {
    return { valid: false, error: "Zadaný George PIN kód nie je správny." };
  }

  return { valid: true };
}
