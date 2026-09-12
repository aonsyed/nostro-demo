import { describe, expect, it } from "vitest";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import {
  initialState,
  createPaymentLink,
  payPaymentLink,
  submitTransfer,
  quoteTransfer,
  transitionTransfer,
} from "./banking";

describe("static demo and fictional-data guardrails", () => {
  it("keeps source-attribution and repeated demo copy out of product pages", () => {
    const marketing = readFileSync("src/pages/Marketing.tsx", "utf8");
    const productCopy = marketing.replace(/<footer\b[\s\S]*?<\/footer>/g, "");
    expect(productCopy).not.toMatch(
      /original Nostro|original product|original public|local concept|design concept|\bLocal demo\b|\bProduct demo\b/i,
    );
    expect(marketing).not.toContain("Original Nostro website");
    expect(marketing).toContain("Product demo. All balances");
  });
  it("keeps every seeded account reference conspicuously fictional", () => {
    const state = initialState();
    expect(state.profile.email).toMatch(/\.example$/);
    expect(state.account.number).toMatch(/^DEMO-/);
    for (const party of [
      ...state.recipients,
      ...state.transfers.map((t) => t.counterparty),
    ]) {
      expect(party.account).toMatch(/^DEMO-/);
      expect(party.email).toMatch(/\.example$/);
    }
  });
  it("uses only the authorised GitHub Pages deployment", () => {
    expect(existsSync(resolve(".openai/hosting.json"))).toBe(false);
    expect(readFileSync(".github/workflows/pages.yml", "utf8")).toContain(
      "actions/deploy-pages@v4",
    );
    expect(readFileSync("src/main.tsx", "utf8")).toContain("HashRouter");
    expect(existsSync("server/local-exports.ts")).toBe(false);
    const config = readFileSync("vite.config.ts", "utf8");
    expect([...config.matchAll(/host:\s*["']127\.0\.0\.1["']/g)]).toHaveLength(
      2,
    );
    expect(readFileSync("index.html", "utf8")).toContain("noindex");
    expect(readFileSync("public/robots.txt", "utf8")).toContain("Disallow: /");
  });
  it("contains no runtime financial network clients", () => {
    const files = readdirSync("src", { recursive: true }).filter(
      (f) => /\.tsx?$/.test(String(f)) && !String(f).endsWith(".test.ts"),
    );
    const source = files
      .map((f) => readFileSync(resolve("src", String(f)), "utf8"))
      .join("\n");
    expect(source).not.toMatch(
      /\bfetch\s*\(|\bXMLHttpRequest\b|\baxios\b|\bWebSocket\s*\(/,
    );
  });
});
describe("unhappy paths preserve money and history", () => {
  const now = "2026-09-12T12:00:00.000Z";
  it("rejects a stale balance even when the quote was initially affordable", () => {
    const initial = initialState(),
      quote = quoteTransfer("PK", 10000, 100000, now);
    expect(() =>
      submitTransfer(
        { ...initial, openingMinor: 0, transfers: [] },
        {
          key: "demo-insufficient",
          quote,
          recipient: initial.recipients[0],
          purpose: "Example",
        },
        now,
      ),
    ).toThrow(/available/);
  });
  it("rejects the wrong destination country and invalid state transitions", () => {
    const state = initialState(),
      quote = quoteTransfer("US", 10000, 100000, now);
    expect(() =>
      submitTransfer(
        state,
        {
          key: "demo-mismatch",
          quote,
          recipient: state.recipients[0],
          purpose: "Example",
        },
        now,
      ),
    ).toThrow(/destination country/);
    expect(() =>
      transitionTransfer(state, "demo-t12", "completed", now),
    ).toThrow(/transition/);
  });
  it("does not collect cancelled or expired links and supports a small collection without a transfer minimum", () => {
    let state = initialState();
    expect(() => payPaymentLink(state, "demo-link-old", now)).toThrow(
      /no longer/,
    );
    state = createPaymentLink(
      state,
      {
        id: "demo-small",
        title: "Example",
        amountMinor: 1,
        expiresAt: "2026-10-01",
        recurrence: "One time",
      },
      now,
    );
    expect(
      payPaymentLink(state, "demo-small", now).transfers[0].amountMinor,
    ).toBe(1);
    state = {
      ...state,
      links: state.links.map((l) =>
        l.id === "demo-small" ? { ...l, status: "cancelled" } : l,
      ),
    };
    expect(() => payPaymentLink(state, "demo-small", now)).toThrow(/no longer/);
  });
});
