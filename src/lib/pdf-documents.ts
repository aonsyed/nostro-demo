import type {
  Content,
  TableCell,
  TDocumentDefinitions,
} from "pdfmake/interfaces";
import {
  calendarDate,
  dateLabel,
  ledgerEntries,
  money,
  statementRows,
  type DemoState,
  type Transfer,
} from "./banking";

const ink = "#191919";
const muted = "#666666";
const section = (text: string): Content => ({
  text,
  style: "section",
  headlineLevel: 1,
});
const amount = (minor: number): string =>
  money(minor).replaceAll("\u00a0", " ");
const cell = (text: string, right = false): TableCell => ({
  text,
  alignment: right ? "right" : "left",
});

function table(
  headers: string[],
  rows: TableCell[][],
  widths: (number | "*" | "auto")[],
): Content {
  return {
    table: {
      headerRows: 1,
      dontBreakRows: true,
      widths,
      body: [
        headers.map((text) => ({
          text,
          bold: true,
          color: "#ffffff",
          fillColor: ink,
          fontSize: 8,
        })),
        ...rows,
      ],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0,
      hLineColor: () => "#dedede",
      paddingLeft: () => 9,
      paddingRight: () => 9,
      paddingTop: () => 5,
      paddingBottom: () => 5,
      fillColor: (row) => (row > 0 && row % 2 === 0 ? "#f5f5f5" : null),
    },
    margin: [0, 0, 0, 12],
  };
}
function base(
  title: string,
  subtitle: string,
  content: Content[],
): TDocumentDefinitions {
  return {
    pageSize: "A4",
    pageBreakBefore: (node, queries) =>
      node.headlineLevel === 1 &&
      queries.getFollowingNodesOnPage().length === 0,
    pageMargins: [40, 85, 40, 65],
    info: {
      title: `Nostro — ${title}`,
      author: "Nostro product demo",
      subject: "Fictional account records",
    },
    defaultStyle: { font: "Roboto", fontSize: 9, color: ink, lineHeight: 1.15 },
    styles: {
      title: { fontSize: 24, bold: true, margin: [0, 0, 0, 6] },
      subtitle: { fontSize: 10, color: muted, margin: [0, 0, 0, 22] },
      section: { fontSize: 11, bold: true, margin: [0, 10, 0, 10] },
      label: { fontSize: 8, color: muted, margin: [0, 0, 0, 5] },
    },
    header: {
      margin: [40, 27, 40, 0],
      stack: [
        {
          columns: [
            { text: "nostro", fontSize: 25, bold: true },
            {
              text: "PERSONAL USD ACCOUNT",
              alignment: "right",
              fontSize: 8,
              color: muted,
              margin: [0, 12, 0, 0],
            },
          ],
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 12,
              x2: 515,
              y2: 12,
              lineWidth: 0.7,
              lineColor: "#cccccc",
            },
          ],
        },
      ],
    },
    footer: (page, count) => ({
      margin: [40, 12, 40, 0],
      stack: [
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 0.5,
              lineColor: "#cccccc",
            },
          ],
        },
        {
          columns: [
            {
              text: "Demo · Fictional data. Not an official statement or proof of payment.",
              fontSize: 7,
              color: muted,
              margin: [0, 8, 0, 0],
            },
            {
              text: `${page} / ${count}`,
              alignment: "right",
              fontSize: 8,
              margin: [0, 8, 0, 0],
              width: 45,
            },
          ],
        },
        {
          text: "All dates and times use Asia/Karachi (PKT). Amounts are USD unless indicated.",
          fontSize: 7,
          color: muted,
          margin: [0, 4, 0, 0],
        },
      ],
    }),
    content: [
      { text: title, style: "title" },
      { text: subtitle, style: "subtitle" },
      ...content,
    ],
  };
}

export function statementSummary(state: DemoState, from: string, to: string) {
  const rows = statementRows(state, from, to);
  const opening =
    state.openingMinor +
    ledgerEntries(state)
      .filter((e) => calendarDate(e.at) < from)
      .reduce((sum, e) => sum + e.amountMinor, 0);
  const credits = rows.reduce((sum, e) => sum + Math.max(0, e.amountMinor), 0);
  const debits = rows.reduce((sum, e) => sum + Math.max(0, -e.amountMinor), 0);
  return {
    rows,
    opening,
    credits,
    debits,
    closing: opening + credits - debits,
  };
}
export function statementDocument(
  state: DemoState,
  from: string,
  to: string,
): TDocumentDefinitions {
  const s = statementSummary(state, from, to);
  return base("Account statement", `${from} — ${to}`, [
    {
      columns: [
        {
          stack: [
            { text: "ACCOUNT HOLDER", style: "label" },
            { text: state.profile.name, bold: true, fontSize: 12 },
            { text: state.profile.company, margin: [0, 4, 0, 0] },
          ],
        },
        {
          stack: [
            { text: "ACCOUNT DETAILS", style: "label" },
            {
              text: `${state.account.bank} · ${state.account.number}`,
              bold: true,
            },
            { text: "Currency: USD", margin: [0, 4, 0, 0] },
          ],
        },
      ],
      margin: [0, 0, 0, 18],
    },
    table(
      ["Opening balance", "Money in", "Money out", "Closing balance"],
      [
        [
          cell(amount(s.opening)),
          cell(amount(s.credits)),
          cell(amount(s.debits)),
          cell(amount(s.closing)),
        ],
      ],
      ["*", "*", "*", "*"],
    ),
    section(`Posted activity · ${s.rows.length} entries`),
    table(
      ["Date", "Description / reference", "Money out", "Money in", "Balance"],
      s.rows.length
        ? s.rows.map((r) => [
            cell(calendarDate(r.at)),
            {
              stack: [
                { text: r.description, bold: true },
                {
                  text: r.transferId,
                  color: muted,
                  fontSize: 7,
                  margin: [0, 3, 0, 0],
                },
              ],
            },
            cell(r.amountMinor < 0 ? amount(-r.amountMinor) : "—", true),
            cell(r.amountMinor > 0 ? amount(r.amountMinor) : "—", true),
            cell(amount(r.balanceMinor), true),
          ])
        : [
            [
              {
                text: "No posted activity in this period.",
                colSpan: 5,
                margin: [0, 10, 0, 10],
              },
              "",
              "",
              "",
              "",
            ],
          ],
      [58, "*", 63, 63, 67],
    ),
    {
      text: "Pending payments and card authorisations are excluded. Refunds and returned payments appear as separate posted entries.",
      color: muted,
      fontSize: 8,
      margin: [0, 5, 0, 0],
    },
  ]);
}
export function receiptDocument(
  state: DemoState,
  t: Transfer,
): TDocumentDefinitions {
  const statusNames: Record<string, string> = t.card
    ? {
        pending: "Pending",
        processing: "Authorised",
        completed: "Settled",
        failed: "Declined",
        returned: "Refunded",
      }
    : {};
  const status = (value: string) =>
    statusNames[value] || value.charAt(0).toUpperCase() + value.slice(1);
  const posted = ledgerEntries(state)
    .filter((e) => e.transferId === t.id)
    .reduce((s, e) => s + e.amountMinor, 0);
  const details: TableCell[][] = [
    ["Account holder", state.profile.name],
    ["USD account", `${state.account.bank} · ${state.account.number}`],
    [
      t.card ? "Merchant" : t.direction === "out" ? "Recipient" : "Sender",
      t.counterparty.name,
    ],
    [t.card ? "Category" : "Bank", t.counterparty.bank],
    ...(t.card
      ? [
          ["Card", `Nostro USD · •••• ${t.card.last4}`],
          ["Merchant location", t.card.location],
          ["Purchase type", t.card.cardPresent ? "In person" : "Online"],
        ]
      : [["Account reference", t.counterparty.account]]),
    ["Method", t.rail],
    ["Purpose", t.purpose],
  ];
  return base(
    t.card ? "Card transaction receipt" : "Payment receipt",
    `${t.id} · ${dateLabel(t.createdAt, true)} PKT`,
    [
      {
        columns: [
          {
            stack: [
              {
                text: t.card ? "PURCHASE AMOUNT" : "PAYMENT AMOUNT",
                style: "label",
              },
              { text: amount(t.amountMinor), fontSize: 28, bold: true },
            ],
          },
          {
            stack: [
              { text: "STATUS", style: "label" },
              { text: status(t.status), fontSize: 14, bold: true },
              {
                text: `Net posted amount: ${amount(posted)}`,
                fontSize: 8,
                color: muted,
                margin: [0, 6, 0, 0],
              },
            ],
            alignment: "right",
          },
        ],
        margin: [0, 0, 0, 16],
      },
      section(t.card ? "Card & merchant" : "Account & destination"),
      table(["Detail", "Information"], details, [125, "*"]),
      section("Payment breakdown"),
      table(
        ["Item", "Amount"],
        [
          ["Source amount", cell(amount(t.amountMinor), true)],
          ["Fee", cell(amount(t.feeMinor), true)],
          ...(!t.card
            ? [
                [
                  t.direction === "in"
                    ? "Incoming amount"
                    : "Quoted total debit",
                  cell(
                    amount(t.direction === "in" ? t.amountMinor : t.debitMinor),
                    true,
                  ),
                ],
                [
                  "Recipient amount",
                  cell(
                    `${(t.recipientMinor / 100).toFixed(2)} ${t.recipientCurrency}`,
                    true,
                  ),
                ],
                [
                  "Exchange rate",
                  cell(`1 USD = ${t.rate} ${t.recipientCurrency}`, true),
                ],
              ]
            : []),
        ],
        ["*", 180],
      ),
      section("Payment timeline"),
      table(
        ["Status", "Date & time"],
        t.timeline.map((e) => [
          status(e.status),
          `${dateLabel(e.at, true)} PKT`,
        ]),
        [125, "*"],
      ),
    ],
  );
}
