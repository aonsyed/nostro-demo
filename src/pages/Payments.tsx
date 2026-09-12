import { appURL } from "../lib/paths";
import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  CreditCard,
  Link as LinkIcon,
  LockKey,
  Plus,
  ShieldCheck,
} from "@phosphor-icons/react";
import {
  calendarDate,
  createPaymentLink,
  money,
  newId,
  parseAmount,
  payPaymentLink,
  type PaymentLink,
} from "../lib/banking";
import { useDemo } from "../lib/store";
import {
  ActionLink,
  Button,
  CopyButton,
  DetailRows,
  EmptyState,
  Field,
  Logo,
  Modal,
  PageHeading,
  Status,
  ThemeToggle,
} from "../components/ui";

export function PaymentLinks() {
  const { state, run, notify } = useDemo(),
    [status, setStatus] = useState("all"),
    [open, setOpen] = useState(false),
    [title, setTitle] = useState(""),
    [amount, setAmount] = useState(""),
    [expiry, setExpiry] = useState(
      new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    ),
    [recurrence, setRecurrence] = useState("One time"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const filtered = state.links.filter(
    (l) => status === "all" || l.status === status,
  );
  const create = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const amountMinor = parseAmount(amount);
      await run((s) =>
        createPaymentLink(s, {
          id: newId("link"),
          title,
          amountMinor,
          expiresAt: expiry,
          recurrence,
        }),
      );
      setOpen(false);
      setTitle("");
      setAmount("");
      notify("Your payment link is ready.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeading
        title="Get paid with a link"
        description="Create, share and follow every collection."
      >
        <ActionLink to="/bank/accounts" variant="secondary" arrow={false}>
          Bank transfer details
        </ActionLink>
        <Button disabled={!state.linksEnabled} onClick={() => setOpen(true)}>
          <Plus size={18} />
          New payment link
        </Button>
      </PageHeading>
      <div className="collection-summary">
        <div>
          <span>Awaiting payment</span>
          <strong>
            {money(
              state.links
                .filter((l) =>
                  ["pending", "initiated", "processing"].includes(l.status),
                )
                .reduce((n, l) => n + l.amountMinor, 0),
            )}
          </strong>
        </div>
        <div>
          <span>Collected</span>
          <strong>
            {money(
              state.links
                .filter((l) => l.status === "paid")
                .reduce((n, l) => n + l.amountMinor, 0),
            )}
          </strong>
        </div>
        <div>
          <span>Payment links</span>
          <strong>{state.links.length}</strong>
        </div>
      </div>
      {!state.linksEnabled && (
        <div className="activation-banner">
          <span className="activation-icon">
            <LockKey size={24} />
          </span>
          <div>
            <h3>Payment links need activation</h3>
            <p>
              Activate payment links to create checkout pages and follow every
              collection in your account.
            </p>
          </div>
          <Button
            variant="secondary"
            busy={busy}
            onClick={async () => {
              setBusy(true);
              await run((s) => ({ ...s, linksEnabled: true }));
              notify("Payment links activated.");
              setBusy(false);
            }}
          >
            Activate payment links <ArrowRight size={17} />
          </Button>
        </div>
      )}
      <section className="panel">
        <div
          className="filter-tabs"
          role="group"
          aria-label="Payment link status"
        >
          {[
            "all",
            "pending",
            "initiated",
            "processing",
            "paid",
            "rejected",
            "expired",
            "cancelled",
          ].map((s) => (
            <button
              key={s}
              aria-pressed={status === s}
              onClick={() => setStatus(s)}
            >
              {s === "all" ? "All links" : s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="payment-link-list">
          {filtered.length ? (
            filtered.map((link) => (
              <article key={link.id}>
                <span className="link-symbol">
                  <LinkIcon size={22} />
                </span>
                <div className="payment-link-name">
                  <Link to={`/bank/payments/${link.id}`}>{link.title}</Link>
                  <small>
                    {link.recurrence} / Expires {link.expiresAt}
                  </small>
                </div>
                <Status status={link.status} />
                <strong>{money(link.amountMinor)}</strong>
                <Link
                  className="icon-button"
                  aria-label={`Open ${link.title}`}
                  to={`/bank/payments/${link.id}`}
                >
                  <ArrowUpRight size={20} />
                </Link>
              </article>
            ))
          ) : (
            <EmptyState
              title="No links in this stage"
              description="Collections will appear here as their status changes."
            />
          )}
        </div>
      </section>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Create a payment link"
        description="Create a checkout for your client."
      >
        <form onSubmit={create}>
          <Field label="What is this payment for?">
            <input
              autoFocus
              required
              maxLength={100}
              placeholder="Website design milestone"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <div className="form-grid">
            <Field label="Amount (USD)">
              <input
                required
                inputMode="decimal"
                placeholder="1500.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>
            <Field label="Frequency">
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
              >
                <option>One time</option>
                <option>Weekly</option>
                <option>Every two weeks</option>
                <option>Monthly</option>
              </select>
            </Field>
          </div>
          <Field label="Link expiry">
            <input
              type="date"
              required
              min={calendarDate(new Date().toISOString())}
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              onInput={(e) => setExpiry(e.currentTarget.value)}
            />
          </Field>
          {recurrence !== "One time" && (
            <p className="small-text">
              The frequency is recorded on this link. Automatic charges are not
              enabled.
            </p>
          )}
          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}
          <div className="modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" busy={busy}>
              Create link <ArrowRight size={17} />
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function PaymentLinkDetail() {
  const { id } = useParams(),
    { state, run, notify } = useDemo(),
    [busy, setBusy] = useState(false),
    link = state.links.find((l) => l.id === id);
  if (!link)
    return (
      <EmptyState
        title="Link not found"
        description="This payment link could not be found."
      >
        <ActionLink to="/bank/payments">View payment links</ActionLink>
      </EmptyState>
    );
  const url = appURL(`/checkout/${link.id}`);
  return (
    <>
      <Link to="/bank/payments" className="back-link">
        <ArrowLeft size={17} />
        Payment links
      </Link>
      <PageHeading title={link.title} description={link.id}>
        <Status status={link.status} />
      </PageHeading>
      <div className="link-detail-layout">
        <section className="panel link-detail">
          <span className="link-symbol large">
            <LinkIcon size={32} />
          </span>
          <h2>{money(link.amountMinor)}</h2>
          <p>{link.recurrence}</p>
          <div className="local-link">
            <span>{url}</span>
            <CopyButton compact label="Copy checkout link" value={url} />
          </div>
          <ActionLink to={`/checkout/${link.id}`} variant="primary">
            Open checkout
          </ActionLink>
          <DetailRows
            rows={[
              { label: "Merchant", value: state.profile.company },
              { label: "Created", value: calendarDate(link.createdAt) },
              { label: "Expires", value: link.expiresAt },
              { label: "Currency", value: "USD" },
              { label: "Collection fee", value: "$0.00" },
            ]}
          />
          {link.transferId && (
            <ActionLink
              to={`/bank/transactions/${link.transferId}`}
              variant="secondary"
            >
              View the received payment
            </ActionLink>
          )}
        </section>
        <aside>
          <div className="receive-guide">
            <ShieldCheck size={30} />
            <h2>Follow it through.</h2>
            <p>
              Open the checkout and follow the collection. Its status and your
              account activity update together.
            </p>
          </div>
          {!["paid", "cancelled", "expired"].includes(link.status) && (
            <div className="panel compact-panel">
              <h3>Stop accepting payments</h3>
              <p>Cancel this link. Its history will remain available.</p>
              <Button
                variant="secondary"
                busy={busy}
                onClick={async () => {
                  setBusy(true);
                  await run((s) => ({
                    ...s,
                    links: s.links.map((l) =>
                      l.id === id ? { ...l, status: "cancelled" } : l,
                    ),
                  }));
                  notify("Payment link cancelled.");
                  setBusy(false);
                }}
              >
                Cancel link
              </Button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

export function Checkout() {
  const { id } = useParams(),
    { state, run, notify } = useDemo(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const link = state.links.find((l) => l.id === id);
  const unavailable =
    !link ||
    ["expired", "cancelled", "rejected"].includes(link.status) ||
    (link.status !== "paid" &&
      link.expiresAt < calendarDate(new Date().toISOString()));
  const pay = async (result: "paid" | "rejected") => {
    setBusy(true);
    setError("");
    try {
      await run((s) =>
        result === "paid"
          ? payPaymentLink(s, id!)
          : {
              ...s,
              links: s.links.map((l) =>
                l.id === id ? { ...l, status: "rejected" } : l,
              ),
            },
      );
      notify(`Payment ${result}.`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="checkout-page">
      <header>
        <Logo />
        <ThemeToggle />
      </header>
      <main>
        {!link ? (
          <EmptyState
            title="This link is unavailable"
            description="This payment link could not be found."
          >
            <ActionLink to="/bank/payments">View payment links</ActionLink>
          </EmptyState>
        ) : (
          <>
            <Link to={`/bank/payments/${id}`} className="back-link">
              <ArrowLeft size={16} />
              Back to payment link
            </Link>
            <div className="checkout-layout">
              <div className="checkout-summary">
                <span className="merchant-avatar">A9</span>
                <p>Pay {state.profile.company}</p>
                <h1>{money(link.amountMinor)}</h1>
                <h2>{link.title}</h2>
                <DetailRows
                  rows={[
                    { label: "Frequency", value: link.recurrence },
                    { label: "Currency", value: "USD" },
                    { label: "Fee", value: "$0.00" },
                    {
                      label: "Total",
                      value: <strong>{money(link.amountMinor)}</strong>,
                    },
                  ]}
                />
              </div>
              <section className="panel checkout-form">
                {link.status === "paid" ? (
                  <div className="checkout-success">
                    <CheckCircle size={58} weight="light" />
                    <h2>Payment received.</h2>
                    <p>The payment is now in the merchant’s USD account.</p>
                    <ActionLink to={`/bank/transactions/${link.transferId}`}>
                      View payment receipt
                    </ActionLink>
                  </div>
                ) : unavailable ? (
                  <EmptyState
                    title={`This link is ${link.status === "pending" ? "expired" : link.status}`}
                    description="It is no longer accepting payments."
                  >
                    <ActionLink to="/bank/payments" variant="secondary">
                      Back to payment links
                    </ActionLink>
                  </EmptyState>
                ) : (
                  <>
                    <CreditCard size={30} />
                    <h2>Complete your payment</h2>
                    <p>
                      Review the amount and payment purpose, then confirm your
                      payment.
                    </p>
                    <div className="info-box">
                      <LockKey size={20} />
                      <span>
                        Your payment details stay together with your receipt.
                      </span>
                    </div>
                    {error && (
                      <p className="error-text" role="alert">
                        {error}
                      </p>
                    )}
                    <Button
                      className="full"
                      busy={busy}
                      onClick={() => pay("paid")}
                    >
                      Pay {money(link.amountMinor)} <ArrowRight size={18} />
                    </Button>
                    <button
                      className="text-button"
                      disabled={busy}
                      onClick={() => pay("rejected")}
                    >
                      Decline payment
                    </button>
                  </>
                )}
              </section>
            </div>
          </>
        )}
      </main>
      <footer>
        <Link to="/">
          Nostro · Local demo · Fictional data · No real money moves.
        </Link>
      </footer>
    </div>
  );
}
