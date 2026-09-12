import { assetPath } from "../lib/paths";
import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import NumberFlow from "@number-flow/react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bank,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  Eye,
  EyeSlash,
  GlobeHemisphereWest,
  MagnifyingGlass,
  Plus,
  Receipt,
  ShieldCheck,
  X,
} from "@phosphor-icons/react";
import { useDemo } from "../lib/store";
import {
  activitySummary,
  calendarDate,
  dateLabel,
  getBalances,
  initials,
  ledgerEntries,
  money,
  simulateIncoming,
  statementRows,
  transitionTransfer,
  type TransferStatus,
} from "../lib/banking";
import { exportCSV, exportReceipt, exportStatement } from "../lib/exports";
import { ActivityList } from "../components/ActivityList";
import { CashChart } from "../components/Charts";
import {
  ActionLink,
  Button,
  CopyButton,
  DetailRows,
  EmptyState,
  Field,
  Modal,
  PageHeading,
  Status,
} from "../components/ui";

export function StatementModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { state, notify } = useDemo(),
    [from, setFrom] = useState("2026-09-01"),
    [to, setTo] = useState(calendarDate(state.asOf)),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const invalid = !from || !to || from > to;
  const download = async (type: "pdf" | "csv") => {
    setBusy(true);
    setError("");
    try {
      if (type === "pdf") await exportStatement(state, from, to);
      else await exportCSV(state, from, to);
      notify(`Your ${type.toUpperCase()} statement is ready.`);
      onOpenChange(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Download a statement"
      description="A statement of posted activity from your USD account."
    >
      <div className="form-grid">
        <Field label="From">
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => setFrom(e.target.value)}
            onInput={(e) => setFrom(e.currentTarget.value)}
          />
        </Field>
        <Field label="To">
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => setTo(e.target.value)}
            onInput={(e) => setTo(e.currentTarget.value)}
          />
        </Field>
      </div>
      {invalid && (
        <p className="error-text" role="alert">
          The start date must be on or before the end date.
        </p>
      )}
      {!invalid && (
        <div className="info-box">
          <Receipt size={22} />
          <span>
            {statementRows(state, from, to).length} posted entries in this
            period. Dates use Pakistan time.
          </span>
        </div>
      )}
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      <div className="modal-actions">
        <Button
          variant="secondary"
          disabled={invalid}
          busy={busy}
          onClick={() => download("csv")}
        >
          CSV
        </Button>
        <Button disabled={invalid} busy={busy} onClick={() => download("pdf")}>
          <Download size={18} />
          Download PDF
        </Button>
      </div>
    </Modal>
  );
}

export function BalancePanel({ compact = false }: { compact?: boolean }) {
  const { state, motionEnabled } = useDemo(),
    [hidden, setHidden] = useState(false),
    balance = getBalances(state);
  return (
    <div className={`balance-panel ${compact ? "compact" : ""}`}>
      <div className="balance-top">
        <span>
          <img src={assetPath("us.webp")} alt="" />
          US Dollar <small>USD</small>
        </span>
        <button
          className="icon-button"
          onClick={() => setHidden(!hidden)}
          aria-label={hidden ? "Show balance" : "Hide balance"}
        >
          {hidden ? <EyeSlash size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <span className="balance-label">Available balance</span>
      <div className="balance-amount">
        {hidden ? (
          "••••••"
        ) : (
          <NumberFlow
            value={balance.available / 100}
            format={{ style: "currency", currency: "USD" }}
            animated={motionEnabled}
          />
        )}
      </div>
      <p>{hidden ? "Balance hidden" : `${money(balance.held)} in progress`}</p>
      <div className="balance-actions">
        <ActionLink to="/bank/accounts" variant="balance-primary" arrow={false}>
          <Plus size={17} />
          Receive money
        </ActionLink>
        <ActionLink to="/bank/send" variant="balance-secondary" arrow={false}>
          <ArrowUpRight size={17} />
          Send money
        </ActionLink>
      </div>
    </div>
  );
}

export function BankHome() {
  const { state } = useDemo(),
    [statement, setStatement] = useState(false),
    summary = activitySummary(state),
    balance = getBalances(state);
  const recent = [...state.transfers]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);
  return (
    <>
      <PageHeading
        title={`Good afternoon, ${state.profile.name.split(" ")[0]}.`}
        description="Here’s where your money stands."
      >
        <Button variant="secondary" onClick={() => setStatement(true)}>
          <Download size={17} />
          Statement
        </Button>
      </PageHeading>
      <div className="dashboard-top">
        <BalancePanel />
        <section className="chart-card panel">
          <CashChart state={state} />
        </section>
      </div>
      <div className="account-metrics">
        <div>
          <ArrowDownLeft size={19} />
          <span>
            Money received<strong>{money(summary.incoming)}</strong>
          </span>
          <small>Posted activity</small>
        </div>
        <div>
          <ArrowUpRight size={19} />
          <span>
            Money sent<strong>{money(summary.outgoing)}</strong>
          </span>
          <small>Completed transfers</small>
        </div>
        <div>
          <Clock size={19} />
          <span>
            On its way to you<strong>{money(balance.incoming)}</strong>
          </span>
          <small>Pending deposits</small>
        </div>
      </div>
      <div className="dashboard-bottom">
        <section className="panel recent-panel">
          <div className="panel-heading">
            <h2>Recent activity</h2>
            <Link to="/bank/transactions">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          {recent.length ? (
            <ActivityList transfers={recent} compact />
          ) : (
            <EmptyState
              title="Your story starts here"
              description="Receive your first payment to see your activity."
            />
          )}
        </section>
        <aside className="dashboard-aside">
          <section className="panel account-mini">
            <div className="panel-heading">
              <Bank size={25} />
              <span className="account-active">Active</span>
            </div>
            <h3>Your US account</h3>
            <p>{state.profile.name}</p>
            <div className="account-mini-number">
              <span>{state.account.number}</span>
              <CopyButton
                value={state.account.number}
                label="Copy account number"
                compact
              />
            </div>
            <p className="small-text">{state.account.bank} · USD</p>
            <Link className="inline-link" to="/bank/accounts">
              View account details <ArrowUpRight size={17} />
            </Link>
          </section>
          <section className="panel account-mini dashboard-card">
            <div className="panel-heading">
              <h3>Your Nostro Card</h3>
              <span className="account-active">
                {state.card.frozen ? "Frozen" : "Active"}
              </span>
            </div>
            <Link
              to="/bank/cards"
              className="dashboard-card-face"
              aria-label="Open your Nostro Card"
            >
              <img src={assetPath("nostro-logo.webp")} alt="Nostro" />
              <CreditCard size={30} weight="thin" />
              <span>
                •••• {state.card.last4}
                <small>DEBIT / USD</small>
              </span>
            </Link>
            <div className="dashboard-card-details">
              <span>
                Daily spending limit
                <strong>{money(state.card.dailyLimitMinor)}</strong>
              </span>
              <span>
                Online payments
                <strong>{state.card.onlineEnabled ? "Enabled" : "Off"}</strong>
              </span>
            </div>
            <Link className="inline-link" to="/bank/cards">
              Manage card <ArrowUpRight size={17} />
            </Link>
          </section>
          <Link to="/bank/payments" className="collection-callout">
            <span>
              <strong>Get paid with a link</strong>
              <small>One link. A clearer way to collect.</small>
            </span>
            <ArrowUpRight size={23} />
          </Link>
        </aside>
      </div>
      <StatementModal open={statement} onOpenChange={setStatement} />
    </>
  );
}

export function Transactions() {
  const { state } = useDemo(),
    [params, setParams] = useSearchParams(),
    [statement, setStatement] = useState(false);
  const q = params.get("q") || "",
    status = params.get("status") || "all",
    direction = params.get("direction") || "all",
    method = params.get("method") || "all",
    from = params.get("from") || "",
    to = params.get("to") || "";
  const set = (key: string, value: string) =>
    setParams(
      (old) => {
        const next = new URLSearchParams(old);
        if (value && value !== "all") next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  const invalid = from && to && from > to;
  const filtered = state.transfers
    .filter(
      (t) =>
        (status === "all" || t.status === status) &&
        (direction === "all" || t.direction === direction) &&
        (method === "all" ||
          (method === "card"
            ? !!t.card
            : method === "bank"
              ? !t.card && t.rail !== "Payment link"
              : t.rail === "Payment link")) &&
        (!from || calendarDate(t.createdAt) >= from) &&
        (!to || calendarDate(t.createdAt) <= to) &&
        `${t.counterparty.name} ${t.counterparty.bank} ${t.counterparty.account} ${t.id} ${t.purpose}`
          .toLowerCase()
          .includes(q.toLowerCase()),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <>
      <PageHeading
        title="Your activity"
        description="Every payment. Every detail. All in one place."
      >
        <Button variant="secondary" onClick={() => setStatement(true)}>
          <Download size={18} />
          Statement
        </Button>
        <ActionLink to="/bank/send" arrow={false}>
          <ArrowUpRight size={18} />
          Send money
        </ActionLink>
      </PageHeading>
      <section className="panel transaction-panel">
        <div className="transaction-toolbar">
          <div className="search-field">
            <MagnifyingGlass size={19} />
            <input
              aria-label="Search transactions"
              placeholder="Search name, bank or reference"
              value={q}
              onChange={(e) => set("q", e.target.value)}
            />
            {q && (
              <button
                className="icon-button"
                aria-label="Clear search"
                onClick={() => set("q", "")}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <select
            aria-label="Payment direction"
            value={direction}
            onChange={(e) => set("direction", e.target.value)}
          >
            <option value="all">All payments</option>
            <option value="in">Money in</option>
            <option value="out">Money out</option>
          </select>
          <select
            aria-label="Payment method"
            value={method}
            onChange={(e) => set("method", e.target.value)}
          >
            <option value="all">All methods</option>
            <option value="card">Card purchases</option>
            <option value="bank">Bank transfers</option>
            <option value="links">Payment links</option>
          </select>
          <label className="date-filter">
            From
            <input
              aria-label="Activity from date"
              type="date"
              value={from}
              onChange={(e) => set("from", e.target.value)}
              onInput={(e) => set("from", e.currentTarget.value)}
            />
          </label>
          <label className="date-filter">
            To
            <input
              aria-label="Activity to date"
              type="date"
              value={to}
              onChange={(e) => set("to", e.target.value)}
              onInput={(e) => set("to", e.currentTarget.value)}
            />
          </label>
        </div>
        <div
          className="filter-tabs"
          role="group"
          aria-label="Filter by payment status"
        >
          {[
            "all",
            "pending",
            "processing",
            "completed",
            "failed",
            "returned",
          ].map((s) => (
            <button
              key={s}
              aria-pressed={s === status}
              onClick={() => set("status", s)}
            >
              {s === "all" ? "All activity" : s[0].toUpperCase() + s.slice(1)}
              {s === "all" && <span>{state.transfers.length}</span>}
            </button>
          ))}
        </div>
        {invalid ? (
          <EmptyState
            title="Check the date range"
            description="Choose a start date on or before the end date."
          />
        ) : filtered.length ? (
          <ActivityList transfers={filtered} />
        ) : (
          <EmptyState
            title={
              q
                ? "No matching payments"
                : `No ${status === "all" ? "" : status + " "}activity`
            }
            description={
              q
                ? "Try another name, bank or reference."
                : "There are no payments matching these filters."
            }
          >
            <Button variant="secondary" onClick={() => setParams({})}>
              Clear filters
            </Button>
          </EmptyState>
        )}
        <footer className="list-footer">
          <span>
            {filtered.length} payment{filtered.length === 1 ? "" : "s"}
          </span>
          <span>All times in Pakistan (PKT)</span>
        </footer>
      </section>
      <StatementModal open={statement} onOpenChange={setStatement} />
    </>
  );
}

const statusExplanation: Record<TransferStatus, string> = {
  pending: "This payment has been created and is awaiting processing.",
  processing:
    "Your payment is being processed. The outgoing amount is reserved in your available balance.",
  completed:
    "The payment has completed. You can review the destination and download your receipt below.",
  failed:
    "This payment did not complete. No posted debit was made and any reserved funds have been released.",
  returned:
    "The receiving bank returned the payment. A reversal has restored the original debit to your account.",
};
const cardExplanation: Record<TransferStatus, string> = {
  pending:
    "The purchase is awaiting authorisation. Its amount is reserved from your available balance.",
  processing:
    "The merchant has authorised this purchase. The amount is reserved until the payment settles or is released.",
  completed:
    "This card purchase has settled and is included in your account balance.",
  failed:
    "This purchase was declined. No money was posted to your account and any authorisation hold has been released.",
  returned:
    "The merchant refunded this purchase. A credit has restored the original amount to your USD account.",
};
export function TransferDetail() {
  const { id } = useParams(),
    { state, run, notify } = useDemo(),
    location = useLocation(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const t = state.transfers.find((t) => t.id === id);
  if (!t)
    return (
      <EmptyState
        title="Payment not found"
        description="This payment could not be found in your account history."
      >
        <ActionLink to="/bank/transactions">Go to activity</ActionLink>
      </EmptyState>
    );
  const latestEntry = ledgerEntries(state)
    .filter((e) => e.transferId === t.id)
    .at(-1);
  const postedAfter = latestEntry
    ? state.openingMinor +
      ledgerEntries(state)
        .filter((e) => e.at <= latestEntry.at)
        .reduce((n, e) => n + e.amountMinor, 0)
    : null;
  const back =
    typeof location.state?.from === "string" &&
    location.state.from.startsWith("/bank")
      ? location.state.from
      : "/bank/transactions";
  const change = async (status: TransferStatus) => {
    setBusy(true);
    try {
      await run((s) => transitionTransfer(s, t.id, status));
      notify(`Payment ${status}.`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="receipt-page">
      <Link to={back} className="back-link">
        <ArrowLeft size={17} />
        Back to activity
      </Link>
      <PageHeading
        title={
          t.card
            ? "Card transaction"
            : t.direction === "in"
              ? "Payment received"
              : "Transfer details"
        }
        description={`Reference ${t.id}`}
      >
        <Button
          variant="secondary"
          busy={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await exportReceipt(state, t);
              notify("Your receipt is ready to download.");
            } catch {
              notify("The receipt could not be generated. Please try again.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <Download size={17} />
          Receipt
        </Button>
      </PageHeading>
      <div className="receipt-grid">
        <section className="panel receipt-main">
          <div className="receipt-summary">
            <span className="receipt-direction">
              {t.direction === "in" ? (
                <ArrowDownLeft size={27} />
              ) : (
                <ArrowUpRight size={27} />
              )}
            </span>
            <p>
              {t.card
                ? "Purchase at"
                : t.direction === "in"
                  ? "Received from"
                  : "Sent to"}{" "}
              {t.counterparty.name}
            </p>
            <h2>{money(t.amountMinor)}</h2>
            <Status
              status={t.status}
              label={
                t.card
                  ? t.status === "returned"
                    ? "Refunded"
                    : t.status === "failed"
                      ? "Declined"
                      : t.status === "completed"
                        ? "Settled"
                        : "Pending"
                  : undefined
              }
            />
            <p className="receipt-explanation">
              {t.card
                ? cardExplanation[t.status]
                : t.direction === "in" &&
                    ["pending", "processing"].includes(t.status)
                  ? "This incoming payment is still in progress. It has not been added to your available balance."
                  : statusExplanation[t.status]}
            </p>
          </div>
          <div className="transfer-destination">
            <span className="avatar">{initials(t.counterparty.name)}</span>
            <div>
              <small>
                {t.card
                  ? "Merchant"
                  : t.direction === "in"
                    ? "Sender"
                    : "Recipient"}
              </small>
              <strong>{t.counterparty.name}</strong>
              <p>
                {t.card ? t.card.category : t.counterparty.bank}{" "}
                <span>{t.card ? t.card.location : t.counterparty.account}</span>
              </p>
            </div>
            <img
              src={
                t.counterparty.country === "PK"
                  ? assetPath("pk.webp")
                  : assetPath("us.webp")
              }
              alt={
                t.counterparty.country === "PK" ? "Pakistan" : "United States"
              }
            />
          </div>
          <div className="receipt-section">
            <h3>Payment breakdown</h3>
            <DetailRows
              rows={
                t.card
                  ? [
                      { label: "Purchase amount", value: money(t.amountMinor) },
                      { label: "Card fee", value: money(t.feeMinor) },
                      {
                        label: "Authorised amount",
                        value: money(t.debitMinor),
                      },
                      {
                        label: "Net posted change",
                        value: money(
                          ledgerEntries(state)
                            .filter((e) => e.transferId === t.id)
                            .reduce((n, e) => n + e.amountMinor, 0),
                        ),
                      },
                    ]
                  : [
                      { label: "Source amount", value: money(t.amountMinor) },
                      { label: "Transfer fee", value: money(t.feeMinor) },
                      {
                        label:
                          t.direction === "in"
                            ? "Incoming amount"
                            : "Quoted total debit",
                        value: money(
                          t.direction === "in" ? t.amountMinor : t.debitMinor,
                        ),
                      },
                      ...(t.recipientCurrency === "PKR"
                        ? [
                            {
                              label: "Exchange rate",
                              value: `1 USD = ${t.rate} PKR`,
                            },
                          ]
                        : []),
                      {
                        label:
                          t.status === "completed"
                            ? "Recipient receives"
                            : "Quoted recipient amount",
                        value: (
                          <strong>
                            {money(t.recipientMinor, t.recipientCurrency)}
                          </strong>
                        ),
                      },
                    ]
              }
            />
          </div>
          <div className="receipt-section">
            <h3>Account & reference</h3>
            <DetailRows
              rows={[
                ...(t.card
                  ? [
                      {
                        label: "Card used",
                        value: `Nostro USD •••• ${t.card.last4}`,
                      },
                      {
                        label: "Purchase type",
                        value: t.card.cardPresent ? "In person" : "Online",
                      },
                      { label: "Merchant location", value: t.card.location },
                    ]
                  : []),
                {
                  label: t.direction === "in" ? "Deposited into" : "Sent from",
                  value: `${state.account.bank} / ${state.account.number}`,
                },
                { label: "Transfer method", value: t.rail },
                { label: "Purpose", value: t.purpose },
                {
                  label: "Created",
                  value: `${dateLabel(t.createdAt, true)} PKT`,
                },
                {
                  label: "Payment reference",
                  value: (
                    <span className="copy-value">
                      {t.id}
                      <CopyButton
                        compact
                        label="Copy payment reference"
                        value={t.id}
                      />
                    </span>
                  ),
                },
                ...(postedAfter !== null
                  ? [
                      {
                        label: "Posted balance after",
                        value: money(postedAfter),
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        </section>
        <aside>
          <section className="panel timeline-panel">
            <h3>Payment journey</h3>
            <ol className="timeline">
              {t.timeline.map((event, i) => (
                <li
                  key={`${event.status}-${i}`}
                  className={i === t.timeline.length - 1 ? "latest" : ""}
                >
                  <span>
                    {event.status === "completed" ? (
                      <CheckCircle size={19} />
                    ) : event.status === "processing" ? (
                      <ArrowsIcon />
                    ) : (
                      <Clock size={18} />
                    )}
                  </span>
                  <div>
                    <strong>
                      {t.card
                        ? {
                            pending: "Purchase requested",
                            processing: "Authorised",
                            completed: "Settled",
                            failed: "Declined",
                            returned: "Refunded",
                          }[event.status]
                        : event.status[0].toUpperCase() + event.status.slice(1)}
                    </strong>
                    <time>{dateLabel(event.at, true)} PKT</time>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          <section className="receipt-help">
            <ShieldCheck size={24} />
            <h3>Need help with this payment?</h3>
            <p>
              Your payment reference will be included, so you won’t need to
              explain it twice.
            </p>
            <ActionLink
              to={`/bank/support?transfer=${t.id}`}
              variant="secondary"
            >
              Get payment support
            </ActionLink>
          </section>
          <details className="simulation-controls">
            <summary>Payment controls</summary>
            <p>Follow this payment through its next stage.</p>
            <div className="button-row">
              {["pending", "processing"].includes(t.status) && (
                <>
                  <Button busy={busy} onClick={() => change("completed")}>
                    {t.card ? "Settle purchase" : "Complete"}
                  </Button>
                  <Button
                    variant="secondary"
                    busy={busy}
                    onClick={() => change("failed")}
                  >
                    {t.card ? "Decline purchase" : "Fail"}
                  </Button>
                </>
              )}
              {t.status === "completed" && t.direction === "out" && (
                <Button
                  variant="secondary"
                  busy={busy}
                  onClick={() => change("returned")}
                >
                  {t.card ? "Refund purchase" : "Return payment"}
                </Button>
              )}
              {["failed", "returned"].includes(t.status) && (
                <span>
                  This payment is closed. Its details stay in your history.
                </span>
              )}
            </div>
            {error && (
              <p role="alert" className="error-text">
                {error}
              </p>
            )}
          </details>
        </aside>
      </div>
    </div>
  );
}
function ArrowsIcon() {
  return <ArrowRight size={18} />;
}

export function Accounts() {
  const { state, run, notify } = useDemo(),
    [params, setParams] = useSearchParams(),
    rail = params.get("rail") || "ACH",
    [busy, setBusy] = useState(false);
  const fields = [
    { label: "Account holder", value: state.profile.name },
    { label: "Account number", value: state.account.number },
    {
      label:
        rail === "International wire"
          ? "SWIFT / BIC"
          : rail === "Domestic wire"
            ? "Wire routing number"
            : "ACH routing number",
      value:
        rail === "International wire"
          ? state.account.swift
          : rail === "Domestic wire"
            ? state.account.routingWire
            : state.account.routingACH,
    },
    { label: "Bank", value: state.account.bank },
    { label: "Bank country", value: "United States" },
    { label: "Currency", value: "USD" },
    { label: "Bank address", value: state.account.address },
  ];
  return (
    <>
      <PageHeading
        title="Your US dollar account"
        description="The details you need to get paid, in one place."
      >
        <ActionLink to="/bank/send" arrow={false}>
          <ArrowUpRight size={18} />
          Send money
        </ActionLink>
      </PageHeading>
      <div className="accounts-layout">
        <section className="panel account-details-panel">
          <header>
            <div className="account-symbol">
              <Bank size={28} />
            </div>
            <div>
              <h2>{state.account.name}</h2>
              <p>
                {state.account.bank} <span>USD</span>
              </p>
            </div>
            <span className="account-active">Active</span>
          </header>
          <div className="account-overview">
            <span>
              Available<strong>{money(getBalances(state).available)}</strong>
            </span>
            <span>
              In progress<strong>{money(getBalances(state).held)}</strong>
            </span>
            <span>
              Account holder<strong>{state.profile.name}</strong>
            </span>
          </div>
          <div className="filter-tabs" aria-label="Receiving method">
            {["ACH", "Domestic wire", "International wire"].map((method) => (
              <button
                key={method}
                aria-pressed={rail === method}
                onClick={() => setParams({ rail: method })}
              >
                {method}
              </button>
            ))}
          </div>
          <div className="account-instructions">
            <div className="panel-heading">
              <h3>{rail} instructions</h3>
              <CopyButton
                label="Copy all"
                value={fields.map((f) => `${f.label}: ${f.value}`).join("\n")}
              />
            </div>
            <p>
              {rail === "ACH"
                ? "For US bank transfers, platform payouts and direct deposits."
                : rail === "Domestic wire"
                  ? "For wire transfers sent from a bank in the United States."
                  : "For USD wires sent from a bank outside the United States."}
            </p>
            <dl className="copy-details">
              {fields.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>
                    <span>{f.value}</span>
                    <CopyButton
                      value={f.value}
                      label={`Copy ${f.label.toLowerCase()}`}
                      compact
                    />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="warning-note">
            Check that the receiving method and account-holder name match your
            payer’s instructions.
          </div>
        </section>
        <aside>
          <section className="receive-guide">
            <GlobeHemisphereWest size={43} />
            <h2>
              From the work you do.
              <br />
              To the account you own.
            </h2>
            <p>
              Use the receiving details that match your payer’s transfer method.
              Keep the name and reference consistent.
            </p>
            <Link to="/feature/receive" className="inline-link">
              Explore receiving <ArrowUpRight size={16} />
            </Link>
          </section>
          <section className="panel compact-panel">
            <h3>Before a real transfer</h3>
            <p>
              Confirm eligibility, limits, fees and timing with Nostro. The
              original public schedules contain differences still awaiting
              review.
            </p>
            <Link to="/faq">
              Read the account FAQ <ArrowRight size={16} />
            </Link>
          </section>
          <section className="simulation-controls open">
            <h3>Explore an incoming payment</h3>
            <p>
              Add a $1,800 client payment and see the balance, history and chart
              update together.
            </p>
            <Button
              variant="secondary"
              busy={busy}
              disabled={state.transfers.some(
                (t) => t.id === "demo-incoming-scenario",
              )}
              onClick={async () => {
                setBusy(true);
                await run((s) => simulateIncoming(s));
                notify("Incoming payment added. Your account is updated.");
                setBusy(false);
              }}
            >
              Add incoming payment <Plus size={16} />
            </Button>
            <Link to="/bank/transactions">
              View activity <ArrowRight size={16} />
            </Link>
          </section>
        </aside>
      </div>
    </>
  );
}
