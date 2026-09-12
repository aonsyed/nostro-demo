import { it, expect } from "vitest";
import { initialState } from "./banking";
import { receiptDocument, statementDocument } from "./pdf-documents";
import pdfMake from "pdfmake/build/pdfmake";
import fonts from "pdfmake/build/vfs_fonts";
import { mkdirSync, writeFileSync } from "node:fs";
pdfMake.addVirtualFileSystem(fonts);
it("renders statements and receipt variants as complete PDF documents", async () => {
  const state = initialState();
  const long = {
    ...state,
    transfers: Array.from({ length: 8 }, (_, i) =>
      state.transfers.map((t) => ({
        ...t,
        id: `${t.id}-${i}`,
        counterparty: {
          ...t.counterparty,
          name:
            i === 1
              ? "A deliberately long international business recipient name for statement wrapping validation"
              : t.counterparty.name,
        },
      })),
    ).flat(),
  };
  const docs = [
    ["statement", statementDocument(state, "2026-09-01", "2026-09-12")],
    ["empty-statement", statementDocument(state, "2026-10-01", "2026-10-02")],
    ["long-statement", statementDocument(long, "2026-09-01", "2026-09-12")],
    [
      "receipt",
      receiptDocument(
        state,
        state.transfers.find((t) => t.id === "demo-t09")!,
      ),
    ],
    [
      "card-refund",
      receiptDocument(
        state,
        state.transfers.find((t) => t.id === "demo-card-stay")!,
      ),
    ],
  ] as const;
  for (const [name, definition] of docs) {
    const buffer = await pdfMake.createPdf(definition).getBuffer();
    expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
    if (process.env.PDF_FIXTURES) {
      mkdirSync("tmp/pdfs", { recursive: true });
      writeFileSync(`tmp/pdfs/${name}.pdf`, buffer);
    }
  }
}, 20000);
