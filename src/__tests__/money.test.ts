import { describe, expect, it } from "vitest";
import { fromCents, parseMoneyInput, toCents } from "@/lib/money";

describe("cent-based money helpers", () => {
  it("converts euro amounts to integer cents without float accumulation", () => {
    expect(toCents(0.1) + toCents(0.2)).toBe(30);
    expect(fromCents(12345)).toBe(123.45);
  });

  it("parses comma and dot decimal inputs with at most two fraction digits", () => {
    expect(parseMoneyInput("12,30")).toBe(12.3);
    expect(parseMoneyInput("12.30")).toBe(12.3);
    expect(parseMoneyInput("12,300")).toBeNull();
    expect(parseMoneyInput("-1")).toBeNull();
    expect(parseMoneyInput("1,2,3")).toBeNull();
  });

  it("rejects unsafe integer cent amounts", () => {
    expect(() => toCents(Number.MAX_SAFE_INTEGER)).toThrow();
    expect(() => fromCents(1.5)).toThrow();
  });
});
