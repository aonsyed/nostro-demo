import { describe, expect, it } from "vitest";
import { initialState, ledgerEntries } from "./banking";
import {
  receiptDocument,
  statementDocument,
  statementSummary,
} from "./pdf-documents";

describe("document financial records", () => {
  it("uses period opening and closing balances even with no activity", () => {
    const state = initialState();
    const s = statementSummary(state, "2026-09-05", "2026-09-08");
    expect(s.closing).toBe(s.opening + s.credits - s.debits);
    expect(s.closing).toBe(s.rows.at(-1)?.balanceMinor);
    const quiet = statementSummary(state, "2026-10-01", "2026-10-02");
    expect(quiet.rows).toHaveLength(0);
    expect(quiet.closing).toBe(
      state.openingMinor +
        ledgerEntries(state).reduce((n, e) => n + e.amountMinor, 0),
    );
    expect(quiet.opening).toBe(quiet.closing);
    expect(
      JSON.stringify(statementDocument(state, "2026-10-01", "2026-10-02")),
    ).toContain("No posted activity");
  });
  it("retains merchant and refund status without claiming a refund is a debit", () => {
    const state = initialState();
    const card = state.transfers.find((t) => t.id === "demo-card-stay")!;
    const document = JSON.stringify(receiptDocument(state, card));
    expect(document).toContain("Refunded");
    expect(document).toContain("Parkside Hotel");
    expect(document).toContain("4242");
    expect(document).toContain("Net posted amount: $0.00");
  });
});
