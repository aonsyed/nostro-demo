import { describe, expect, it } from "vitest";
import {
  initialState,
  parseAmount,
  quoteTransfer,
  getBalances,
  submitTransfer,
  transitionTransfer,
  ledgerEntries,
  statementRows,
  createPaymentLink,
  payPaymentLink,
  activitySummary,
} from "./banking";

describe("money and shared transfer rules", () => {
  it("parses exact cents and rejects ambiguous or invalid monetary input", () => {
    expect(parseAmount("100.01")).toBe(10001);
    expect(parseAmount("0.10")).toBe(10);
    for (const value of ["-1", "1.001", "1e3", "", "NaN", "0"])
      expect(() => parseAmount(value)).toThrow();
  });
  it("uses corridor minimums and balance including fees at every quote entry", () => {
    expect(quoteTransfer("PK", 100, 10000).recipientMinor).toBe(27850);
    expect(() => quoteTransfer("PK", 99, 10000)).toThrow(/minimum/i);
    expect(() => quoteTransfer("US", 4999, 10000)).toThrow(/minimum/i);
    expect(quoteTransfer("US", 5000, 5000).debitMinor).toBe(5000);
    expect(() => quoteTransfer("US", 5001, 5000)).toThrow(/available/i);
  });
  it("rounds the recipient amount once in minor units", () => {
    expect(quoteTransfer("PK", 101, 10000).recipientMinor).toBe(28129);
  });
});

describe("a coherent local financial ledger", () => {
  it("reserves processing funds then posts exactly once", () => {
    const start = initialState();
    const before = getBalances(start);
    const quote = quoteTransfer(
      "PK",
      10000,
      before.available,
      "2026-09-12T10:00:00Z",
    );
    const after = submitTransfer(
      start,
      {
        key: "test-send",
        quote,
        recipient: start.recipients[0],
        purpose: "Family support",
      },
      "2026-09-12T10:01:00Z",
    );
    expect(getBalances(after).available).toBe(before.available - 10000);
    expect(getBalances(after).posted).toBe(before.posted);
    expect(getBalances(after).held).toBe(before.held + 10000);
    expect(
      submitTransfer(
        after,
        {
          key: "test-send",
          quote,
          recipient: start.recipients[0],
          purpose: "Family support",
        },
        "2026-09-12T10:01:01Z",
      ),
    ).toEqual(after);
    const complete = transitionTransfer(
      after,
      "test-send",
      "completed",
      "2026-09-12T10:02:00Z",
    );
    expect(getBalances(complete).available).toBe(before.available - 10000);
    expect(getBalances(complete).posted).toBe(before.posted - 10000);
    expect(getBalances(complete).held).toBe(before.held);
  });
  it("rejects expired quotes and never silently changes reviewed amounts", () => {
    const state = initialState();
    const quote = quoteTransfer(
      "PK",
      10000,
      getBalances(state).available,
      "2026-09-12T10:00:00Z",
    );
    expect(() =>
      submitTransfer(
        state,
        {
          key: "expired",
          quote,
          recipient: state.recipients[0],
          purpose: "Test",
        },
        "2026-09-12T10:10:00Z",
      ),
    ).toThrow(/expired/i);
  });
  it("retains recipient snapshots and returns money through a reversing ledger entry", () => {
    const state = initialState();
    const quote = quoteTransfer(
      "PK",
      10000,
      getBalances(state).available,
      "2026-09-12T10:00:00Z",
    );
    const sent = submitTransfer(
      state,
      {
        key: "return-test",
        quote,
        recipient: state.recipients[0],
        purpose: "Test",
      },
      "2026-09-12T10:01:00Z",
    );
    const completed = transitionTransfer(
      sent,
      "return-test",
      "completed",
      "2026-09-12T10:02:00Z",
    );
    const returned = transitionTransfer(
      completed,
      "return-test",
      "returned",
      "2026-09-12T10:03:00Z",
    );
    expect(getBalances(returned).posted).toBe(getBalances(state).posted);
    expect(
      ledgerEntries(returned)
        .filter((e) => e.transferId === "return-test")
        .map((e) => e.amountMinor),
    ).toEqual([-10000, 10000]);
    returned.recipients[0].name = "Edited local recipient";
    expect(
      returned.transfers.find((t) => t.id === "return-test")?.counterparty.name,
    ).not.toBe("Edited local recipient");
    expect(() =>
      transitionTransfer(returned, "return-test", "processing"),
    ).toThrow(/transition/i);
  });
  it("failed processing transfers release their hold without inventing a posted debit", () => {
    const state = initialState();
    const processing = state.transfers.find(
      (t) => t.direction === "out" && t.status === "processing",
    )!;
    const failed = transitionTransfer(state, processing.id, "failed");
    expect(getBalances(failed).posted).toBe(getBalances(state).posted);
    expect(getBalances(failed).available).toBe(
      getBalances(state).available + processing.debitMinor,
    );
  });
  it("validates statement ranges and uses Pakistan calendar dates consistently", () => {
    const state = initialState();
    expect(() => statementRows(state, "2026-09-12", "2026-09-01")).toThrow(
      /date/i,
    );
    const rows = statementRows(state, "2026-09-01", "2026-09-30");
    expect(
      rows.reduce((n, r) => n + r.amountMinor, 0) + state.openingMinor,
    ).toBe(getBalances(state).posted);
    expect(activitySummary({ ...state, transfers: [] }).incoming).toBe(0);
  });
});

describe("payment collection simulation", () => {
  it("turns a local payment link into one deposit and disallows duplicate collection", () => {
    const initial = initialState();
    const withLink = createPaymentLink(initial, {
      id: "demo-link-test",
      title: "Brand direction",
      amountMinor: 85000,
      expiresAt: "2026-12-31",
      recurrence: "One time",
    });
    const paid = payPaymentLink(
      withLink,
      "demo-link-test",
      "2026-09-12T10:00:00Z",
    );
    expect(getBalances(paid).posted).toBe(getBalances(initial).posted + 85000);
    expect(paid.links.find((l) => l.id === "demo-link-test")?.status).toBe(
      "paid",
    );
    expect(
      payPaymentLink(paid, "demo-link-test", "2026-09-12T10:00:01Z"),
    ).toEqual(paid);
  });
});
