import { describe, it, expect } from "vitest";
import {
  initialState,
  getBalances,
  simulateCardPurchase,
  transitionTransfer,
  statementRows,
} from "./banking";
describe("card transactions share the account ledger", () => {
  const now = "2026-09-12T12:00:00Z";
  it("reserves a sub-$50 purchase, posts once, and refunds without losing the merchant", () => {
    const start = initialState(),
      before = getBalances(start),
      pending = simulateCardPurchase(start, now),
      id = "demo-card-new-purchase";
    expect(getBalances(pending).available).toBe(before.available - 2499);
    expect(getBalances(pending).posted).toBe(before.posted);
    expect(simulateCardPurchase(pending, now)).toEqual(pending);
    const posted = transitionTransfer(pending, id, "completed", now);
    expect(getBalances(posted).posted).toBe(before.posted - 2499);
    const refunded = transitionTransfer(posted, id, "returned", now);
    expect(getBalances(refunded).available).toBe(before.available);
    expect(refunded.transfers.find((t) => t.id === id)?.card?.last4).toBe(
      "4242",
    );
    expect(
      statementRows(refunded, "2026-09-12", "2026-09-12").filter(
        (r) => r.transferId === id,
      ),
    ).toHaveLength(2);
  });
  it("honours freeze, online switch, daily limit and available balance", () => {
    const start = initialState();
    expect(() =>
      simulateCardPurchase(
        { ...start, card: { ...start.card, frozen: true } },
        now,
      ),
    ).toThrow(/Unfreeze/);
    expect(() =>
      simulateCardPurchase(
        { ...start, card: { ...start.card, onlineEnabled: false } },
        now,
      ),
    ).toThrow(/online/);
    expect(() =>
      simulateCardPurchase(
        { ...start, card: { ...start.card, dailyLimitMinor: 100 } },
        now,
      ),
    ).toThrow(/limit/);
    expect(() =>
      simulateCardPurchase({ ...start, openingMinor: 0, transfers: [] }, now),
    ).toThrow(/balance/);
  });
});
