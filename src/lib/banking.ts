import fixture from "../data/fixtures.json";
import productFacts from "../data/product-facts.json";
import cardEvents from "../data/card-events.json";

export type Country = "PK" | "US";
export type TransferStatus =
  "pending" | "processing" | "completed" | "failed" | "returned";
export type Recipient = {
  id: string;
  name: string;
  type: "Personal" | "Business";
  country: Country;
  bank: string;
  account: string;
  email: string;
  phone: string;
};
export type Quote = {
  country: Country;
  amountMinor: number;
  feeMinor: number;
  debitMinor: number;
  rate: number;
  recipientMinor: number;
  recipientCurrency: "PKR" | "USD";
  createdAt: string;
  expiresAt: string;
};
export type Transfer = Quote & {
  card?: {
    last4: string;
    category: string;
    location: string;
    cardPresent: boolean;
  };
  id: string;
  direction: "in" | "out";
  counterparty: Recipient;
  rail: string;
  status: TransferStatus;
  purpose: string;
  timeline: { status: TransferStatus; at: string }[];
};
export type PaymentLink = {
  id: string;
  title: string;
  amountMinor: number;
  expiresAt: string;
  recurrence: string;
  status:
    | "pending"
    | "initiated"
    | "processing"
    | "paid"
    | "rejected"
    | "expired"
    | "cancelled";
  createdAt: string;
  transferId?: string;
};
export type SupportCase = {
  id: string;
  category: string;
  subject: string;
  description: string;
  transferId?: string;
  status: "Open" | "Resolved";
  createdAt: string;
  messages: { at: string; author: string; text: string }[];
  attachment?: string;
};
export type DemoState = {
  card: {
    frozen: boolean;
    last4: string;
    dailyLimitMinor: number;
    onlineEnabled: boolean;
  };
  version: number;
  asOf: string;
  openingMinor: number;
  profile: typeof fixture.profile;
  account: typeof fixture.account;
  recipients: Recipient[];
  transfers: Transfer[];
  links: PaymentLink[];
  cases: SupportCase[];
  linksEnabled: boolean;
  waitlisted: boolean;
};
export const rules = productFacts.demo;
export const productAvailability = productFacts.availability;
export const money = (minor: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(minor / 100);
export const dateLabel = (iso: string, full = false) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    day: "numeric",
    month: "short",
    year: full ? "numeric" : undefined,
    ...(full ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(iso));
export const calendarDate = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("");
export const newId = (prefix: string) =>
  `demo-${prefix}-${crypto.randomUUID().slice(0, 8)}`;

export function parseAmount(value: string): number {
  const clean = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(clean))
    throw new Error("Enter a positive amount with up to two decimal places.");
  const [whole, decimal = ""] = clean.split(".");
  const minor = Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
  if (!Number.isSafeInteger(minor) || minor <= 0 || minor > 100000000)
    throw new Error("Enter an amount between $0.01 and $1,000,000.");
  return minor;
}

export function quoteTransfer(
  country: Country,
  amountMinor: number,
  available = 100000000,
  now = new Date().toISOString(),
): Quote {
  const minimum =
    country === "PK" ? rules.minimumPKMinor : rules.minimumUSMinor;
  if (!Number.isSafeInteger(amountMinor) || amountMinor < minimum)
    throw new Error(
      `The minimum is ${money(minimum)} for ${country === "PK" ? "Pakistan" : "US transfers"}.`,
    );
  const debitMinor = amountMinor + rules.feeMinor;
  if (debitMinor > available)
    throw new Error(
      `You have ${money(available)} available. Enter a lower amount.`,
    );
  return {
    country,
    amountMinor,
    feeMinor: rules.feeMinor,
    debitMinor,
    rate: country === "PK" ? rules.ratePKR : 1,
    recipientMinor:
      country === "PK" ? Math.round(amountMinor * rules.ratePKR) : amountMinor,
    recipientCurrency: country === "PK" ? "PKR" : "USD",
    createdAt: now,
    expiresAt: new Date(
      new Date(now).getTime() + rules.quoteMinutes * 60000,
    ).toISOString(),
  };
}

export function initialState(): DemoState {
  const recipients = structuredClone(fixture.recipients) as Recipient[];
  const transfers: Transfer[] = fixture.events.map((event) => {
    const party = event.recipientId
      ? recipients.find((r) => r.id === event.recipientId)!
      : {
          id: `party-${event.id}`,
          name: event.name!,
          type: "Business" as const,
          country: "US" as const,
          bank: event.bank!,
          account: event.account!,
          email: "payments@client.example",
          phone: "",
        };
    const country = event.direction === "in" ? "US" : party.country;
    const quote = quoteTransfer(
      country,
      event.amountMinor,
      100000000,
      event.createdAt,
    );
    const status = event.status as TransferStatus;
    const timeline: { status: TransferStatus; at: string }[] = [
      { status: "pending", at: event.createdAt },
    ];
    if (status !== "pending")
      timeline.push({
        status: "processing",
        at: new Date(new Date(event.createdAt).getTime() + 60000).toISOString(),
      });
    if (["completed", "returned"].includes(status))
      timeline.push({
        status: "completed",
        at: new Date(
          new Date(event.createdAt).getTime() + 180000,
        ).toISOString(),
      });
    if (status === "failed" || status === "returned")
      timeline.push({
        status,
        at: new Date(
          new Date(event.createdAt).getTime() + 3600000,
        ).toISOString(),
      });
    return {
      ...quote,
      id: event.id,
      direction: event.direction as "in" | "out",
      counterparty: structuredClone(party),
      rail: event.rail,
      status,
      purpose: event.purpose,
      timeline,
    };
  });
  transfers.push(...initialCardTransfers());
  return {
    card: {
      frozen: false,
      last4: "4242",
      dailyLimitMinor: 100000,
      onlineEnabled: true,
    },
    version: fixture.version,
    asOf: fixture.asOf,
    openingMinor: fixture.openingMinor,
    profile: structuredClone(fixture.profile),
    account: structuredClone(fixture.account),
    recipients,
    transfers,
    links: structuredClone(fixture.links) as PaymentLink[],
    cases: structuredClone(fixture.cases) as SupportCase[],
    linksEnabled: false,
    waitlisted: false,
  };
}

export function initialCardTransfers(): Transfer[] {
  return cardEvents.map((event) => {
    const quote = {
      ...quoteTransfer(
        "US",
        Math.max(event.amountMinor, rules.minimumUSMinor),
        100000000,
        event.createdAt,
      ),
      amountMinor: event.amountMinor,
      debitMinor: event.amountMinor,
      recipientMinor: event.amountMinor,
    };
    const status = event.status as TransferStatus;
    const timeline: Transfer["timeline"] = [
      { status: "pending", at: event.createdAt },
    ];
    if (status !== "failed")
      timeline.push({ status: "processing", at: event.createdAt });
    if (status === "completed" || status === "returned")
      timeline.push({
        status: "completed",
        at: new Date(new Date(event.createdAt).getTime() + 60000).toISOString(),
      });
    if (status === "returned" || status === "failed")
      timeline.push({
        status,
        at: new Date(
          new Date(event.createdAt).getTime() + 3600000,
        ).toISOString(),
      });
    return {
      ...quote,
      id: event.id,
      direction: "out",
      rail: "Card purchase",
      status,
      purpose: event.category,
      card: {
        last4: "4242",
        category: event.category,
        location: event.location,
        cardPresent: event.cardPresent,
      },
      counterparty: {
        id: `merchant-${event.id}`,
        name: event.name,
        type: "Business",
        country: "US",
        bank: event.category,
        account: "DEMO-CARD-4242",
        email: "merchant@demo.example",
        phone: "",
      },
      timeline,
    };
  });
}

export function simulateCardPurchase(
  state: DemoState,
  now = new Date().toISOString(),
): DemoState {
  const id = "demo-card-new-purchase",
    amountMinor = 2499;
  if (state.transfers.some((t) => t.id === id)) return state;
  if (state.card.frozen)
    throw new Error("Unfreeze your card before trying a new purchase.");
  if (!state.card.onlineEnabled)
    throw new Error(
      "Enable online payments before trying this online purchase.",
    );
  const spent = state.transfers
    .filter(
      (t) =>
        t.card &&
        ["completed", "processing", "pending"].includes(t.status) &&
        calendarDate(t.createdAt) === calendarDate(now),
    )
    .reduce((sum, t) => sum + t.debitMinor, 0);
  if (spent + amountMinor > state.card.dailyLimitMinor)
    throw new Error("This purchase would exceed your daily spending limit.");
  if (amountMinor > getBalances(state).available)
    throw new Error("There is not enough available balance for this purchase.");
  const template = initialCardTransfers()[0];
  const transfer: Transfer = {
    ...template,
    id,
    createdAt: now,
    amountMinor,
    debitMinor: amountMinor,
    recipientMinor: amountMinor,
    status: "processing",
    counterparty: {
      ...template.counterparty,
      id: "demo-merchant-paper",
      name: "Paper & Objects",
    },
    purpose: "Studio supplies",
    card: {
      last4: state.card.last4,
      category: "Shopping",
      location: "New York, US",
      cardPresent: false,
    },
    timeline: [
      { status: "pending", at: now },
      { status: "processing", at: now },
    ],
  };
  return { ...state, asOf: now, transfers: [transfer, ...state.transfers] };
}

export function ledgerEntries(state: DemoState) {
  return state.transfers
    .flatMap((t) => {
      const posted = t.timeline.find((x) => x.status === "completed");
      if (!posted) return [];
      const amount = t.direction === "in" ? t.amountMinor : -t.debitMinor;
      const entries = [
        {
          id: `${t.id}-posted`,
          transferId: t.id,
          at: posted.at,
          amountMinor: amount,
          description: t.counterparty.name,
          kind: "posted" as "posted" | "returned",
        },
      ];
      const returned = t.timeline.find((x) => x.status === "returned");
      if (returned)
        entries.push({
          id: `${t.id}-return`,
          transferId: t.id,
          at: returned.at,
          amountMinor: -amount,
          description: `Returned: ${t.counterparty.name}`,
          kind: "returned",
        });
      return entries;
    })
    .sort((a, b) => a.at.localeCompare(b.at));
}
export function getBalances(state: DemoState) {
  const posted =
    state.openingMinor +
    ledgerEntries(state).reduce((n, e) => n + e.amountMinor, 0);
  const held = state.transfers
    .filter(
      (t) =>
        t.direction === "out" && ["pending", "processing"].includes(t.status),
    )
    .reduce((n, t) => n + t.debitMinor, 0);
  const incoming = state.transfers
    .filter(
      (t) =>
        t.direction === "in" && ["pending", "processing"].includes(t.status),
    )
    .reduce((n, t) => n + t.amountMinor, 0);
  return { posted, held, available: posted - held, incoming };
}
export function activitySummary(state: DemoState) {
  const settled = state.transfers.filter((t) => t.status === "completed");
  return {
    incoming: settled
      .filter((t) => t.direction === "in")
      .reduce((n, t) => n + t.amountMinor, 0),
    outgoing: settled
      .filter((t) => t.direction === "out")
      .reduce((n, t) => n + t.debitMinor, 0),
    count: settled.length,
  };
}
export function submitTransfer(
  state: DemoState,
  input: { key: string; quote: Quote; recipient: Recipient; purpose: string },
  now = new Date().toISOString(),
): DemoState {
  if (state.transfers.some((t) => t.id === input.key)) return state;
  if (new Date(now) > new Date(input.quote.expiresAt))
    throw new Error(
      "Your quote expired. Refresh it and review the new quote before confirming.",
    );
  const verified = quoteTransfer(
    input.quote.country,
    input.quote.amountMinor,
    getBalances(state).available,
    now,
  );
  if (
    verified.debitMinor !== input.quote.debitMinor ||
    verified.recipientMinor !== input.quote.recipientMinor
  )
    throw new Error("The quote changed. Review a refreshed quote.");
  if (input.recipient.country !== input.quote.country)
    throw new Error("Choose a recipient in the selected destination country.");
  if (
    !input.recipient.name.trim() ||
    !input.recipient.bank.trim() ||
    !input.recipient.account.trim()
  )
    throw new Error("Complete the recipient and bank details.");
  const t: Transfer = {
    ...input.quote,
    id: input.key,
    direction: "out",
    counterparty: structuredClone(input.recipient),
    rail: input.quote.country === "PK" ? "Bank transfer" : "ACH",
    purpose: input.purpose,
    status: "processing",
    createdAt: now,
    timeline: [
      { status: "pending", at: now },
      { status: "processing", at: now },
    ],
  };
  return { ...state, asOf: now, transfers: [t, ...state.transfers] };
}
export function transitionTransfer(
  state: DemoState,
  id: string,
  status: TransferStatus,
  now = new Date().toISOString(),
): DemoState {
  const transfer = state.transfers.find((t) => t.id === id);
  if (!transfer) throw new Error("Transfer not found.");
  if (transfer.status === status) return state;
  const allowed: Record<TransferStatus, TransferStatus[]> = {
    pending: ["processing", "completed", "failed"],
    processing: ["completed", "failed"],
    completed: ["returned"],
    failed: [],
    returned: [],
  };
  if (!allowed[transfer.status].includes(status))
    throw new Error("That status transition is not available.");
  return {
    ...state,
    asOf: now,
    transfers: state.transfers.map((t) =>
      t.id === id
        ? { ...t, status, timeline: [...t.timeline, { status, at: now }] }
        : t,
    ),
  };
}
export function statementRows(state: DemoState, from: string, to: string) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(from) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(to) ||
    from > to
  )
    throw new Error("Choose a start date on or before the end date.");
  let running = state.openingMinor;
  return ledgerEntries(state)
    .map((e) => ({ ...e, balanceMinor: (running += e.amountMinor) }))
    .filter((e) => calendarDate(e.at) >= from && calendarDate(e.at) <= to);
}
export function createPaymentLink(
  state: DemoState,
  input: Omit<PaymentLink, "status" | "createdAt">,
  now = new Date().toISOString(),
): DemoState {
  if (!input.title.trim()) throw new Error("Give this payment link a title.");
  if (!Number.isSafeInteger(input.amountMinor) || input.amountMinor <= 0)
    throw new Error("Enter a valid amount.");
  if (input.expiresAt < calendarDate(now))
    throw new Error("Choose an expiry date today or later.");
  if (state.links.some((l) => l.id === input.id)) return state;
  return {
    ...state,
    links: [{ ...input, status: "pending", createdAt: now }, ...state.links],
  };
}
export function payPaymentLink(
  state: DemoState,
  id: string,
  now = new Date().toISOString(),
): DemoState {
  const link = state.links.find((l) => l.id === id);
  if (!link) throw new Error("Payment link not found.");
  if (link.status === "paid") return state;
  if (
    !["pending", "initiated", "processing"].includes(link.status) ||
    link.expiresAt < calendarDate(now)
  )
    throw new Error("This payment link is no longer accepting payments.");
  const transfer: Transfer = {
    ...quoteTransfer("US", Math.max(link.amountMinor, 5000), 100000000, now),
    amountMinor: link.amountMinor,
    debitMinor: link.amountMinor,
    recipientMinor: link.amountMinor,
    id: `payment-${id}`,
    direction: "in",
    rail: "Payment link",
    counterparty: {
      id: `payer-${id}`,
      name: "Studio client",
      country: "US",
      type: "Business",
      bank: "Card payment",
      account: "DEMO-CARD-4242",
      email: "customer@client.example",
      phone: "",
    },
    status: "completed",
    purpose: link.title,
    timeline: [
      { status: "pending", at: now },
      { status: "completed", at: now },
    ],
  };
  return {
    ...state,
    asOf: now,
    links: state.links.map((l) =>
      l.id === id ? { ...l, status: "paid", transferId: transfer.id } : l,
    ),
    transfers: [transfer, ...state.transfers],
  };
}
export function simulateIncoming(
  state: DemoState,
  now = new Date().toISOString(),
): DemoState {
  const id = "demo-incoming-scenario";
  if (state.transfers.some((t) => t.id === id)) return state;
  const transfer: Transfer = {
    ...quoteTransfer("US", 180000, 100000000, now),
    id,
    direction: "in",
    rail: "ACH",
    counterparty: {
      id: "demo-client",
      name: "Juniper Studio",
      country: "US",
      type: "Business",
      bank: "Client bank transfer",
      account: "DEMO-US-1800",
      email: "accounts@juniper.example",
      phone: "",
    },
    status: "completed",
    purpose: "Design project milestone",
    timeline: [
      { status: "pending", at: now },
      { status: "completed", at: now },
    ],
  };
  return { ...state, asOf: now, transfers: [transfer, ...state.transfers] };
}
