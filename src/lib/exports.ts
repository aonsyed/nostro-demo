import {
  calendarDate,
  statementRows,
  type DemoState,
  type Transfer,
} from "./banking";
import { receiptDocument, statementDocument } from "./pdf-documents";
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import { prepareDownload } from "./download";

function offerDownload(url: string, filename: string, size: number) {
  window.dispatchEvent(
    new CustomEvent("nostro-local-export", { detail: { url, filename, size } }),
  );
}
async function buildPDF(document: TDocumentDefinitions, filename: string) {
  const [{ default: pdfMake }, { default: fonts }] = await Promise.all([
    import("pdfmake/build/pdfmake"),
    import("pdfmake/build/vfs_fonts"),
  ]);
  pdfMake.addVirtualFileSystem(fonts);
  const blob = await pdfMake.createPdf(document).getBlob();
  offerDownload(await prepareDownload(blob, filename), filename, blob.size);
}
export function exportReceipt(state: DemoState, transfer: Transfer) {
  return buildPDF(
    receiptDocument(state, transfer),
    `Nostro-receipt-${transfer.id}.pdf`,
  );
}
export function exportStatement(state: DemoState, from: string, to: string) {
  return buildPDF(
    statementDocument(state, from, to),
    `Nostro-statement-${from}-${to}.pdf`,
  );
}
export async function exportCSV(state: DemoState, from: string, to: string) {
  const rows = statementRows(state, from, to);
  const csv = [
    ["Date (PKT)", "Reference", "Counterparty", "Amount USD", "Balance USD"],
    ...rows.map((r) => [
      calendarDate(r.at),
      r.transferId,
      r.description,
      (r.amountMinor / 100).toFixed(2),
      (r.balanceMinor / 100).toFixed(2),
    ]),
  ]
    .map((row) =>
      row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","),
    )
    .join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const filename = `Nostro-statement-${from}-${to}.csv`;
  offerDownload(await prepareDownload(blob, filename), filename, blob.size);
}
