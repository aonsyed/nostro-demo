import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CreditCard,
  Eye,
  Snowflake,
  SlidersHorizontal,
  ShoppingBag,
} from "@phosphor-icons/react";
import { useDemo } from "../lib/store";
import {
  getBalances,
  money,
  parseAmount,
  calendarDate,
  simulateCardPurchase,
} from "../lib/banking";
import { NostroCard } from "./SettingsSupport";
import { ActivityList } from "../components/ActivityList";
import {
  Button,
  CopyButton,
  DetailRows,
  Field,
  Modal,
  PageHeading,
} from "../components/ui";

export function CardAccount() {
  const { state, run, notify } = useDemo(),
    [details, setDetails] = useState(false),
    [limits, setLimits] = useState(false),
    [limit, setLimit] = useState(String(state.card.dailyLimitMinor / 100)),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const purchases = state.transfers
    .filter((t) => t.card)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const month = calendarDate(state.asOf).slice(0, 7),
    spent = purchases
      .filter(
        (t) =>
          t.status === "completed" &&
          calendarDate(t.createdAt).startsWith(month),
      )
      .reduce((n, t) => n + t.amountMinor, 0),
    held = purchases
      .filter((t) => ["pending", "processing"].includes(t.status))
      .reduce((n, t) => n + t.amountMinor, 0);
  const purchase = async () => {
    setBusy(true);
    setError("");
    try {
      await run((s) => simulateCardPurchase(s));
      notify(
        "Purchase authorised. Your available balance and card activity are updated.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeading
        title="Your everyday, in dollars."
        description="Your card, spending and controls. All connected to your USD account."
      />
      <div className="active-card-layout">
        <section
          className={`active-card-stage ${state.card.frozen ? "card-is-frozen" : ""}`}
        >
          <div className="card-stage-heading">
            <span>
              <CreditCard size={18} />
              Nostro USD card
            </span>
            <span className="card-state">
              {state.card.frozen ? (
                <>
                  <Snowflake size={13} />
                  Frozen
                </>
              ) : (
                "Active"
              )}
            </span>
          </div>
          <NostroCard />
          <div className="issued-card-name">
            <span>{state.profile.name}</span>
            <span>•••• {state.card.last4}</span>
          </div>
          <div className="card-action-row">
            <Button variant="secondary" onClick={() => setDetails(true)}>
              <Eye size={17} />
              Card details
            </Button>
            <Button
              variant="secondary"
              busy={busy}
              onClick={async () => {
                setBusy(true);
                await run((s) => ({
                  ...s,
                  card: { ...s.card, frozen: !s.card.frozen },
                }));
                notify(
                  state.card.frozen
                    ? "Card unfrozen. New purchases are enabled."
                    : "Card frozen. New purchases are blocked.",
                );
                setBusy(false);
              }}
            >
              <Snowflake size={17} />
              {state.card.frozen ? "Unfreeze" : "Freeze card"}
            </Button>
          </div>
        </section>
        <section className="panel card-spending">
          <div className="panel-heading">
            <h2>Your spending</h2>
            <span className="small-text">This month</span>
          </div>
          <span className="card-spend-total">{money(spent)}</span>
          <p>Settled purchases · refunds excluded</p>
          <DetailRows
            rows={[
              { label: "Pending authorisations", value: money(held) },
              {
                label: "Available in your USD account",
                value: money(getBalances(state).available),
              },
              {
                label: "Daily spending limit",
                value: money(state.card.dailyLimitMinor),
              },
            ]}
          />
          <div className="setting-row">
            <span>
              <strong>Online payments</strong>
              <small>Allow purchases on websites and in apps.</small>
            </span>
            <button
              className={`switch ${state.card.onlineEnabled ? "on" : ""}`}
              role="switch"
              aria-label="Online card payments"
              aria-checked={state.card.onlineEnabled}
              onClick={async () => {
                await run((s) => ({
                  ...s,
                  card: { ...s.card, onlineEnabled: !s.card.onlineEnabled },
                }));
                notify("Online payment preference updated.");
              }}
            >
              <span />
            </button>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setLimit(String(state.card.dailyLimitMinor / 100));
              setError("");
              setLimits(true);
            }}
          >
            <SlidersHorizontal size={17} />
            Manage spending limit
          </Button>
        </section>
      </div>
      <section className="panel card-activity">
        <div className="panel-heading">
          <h2>Card activity</h2>
          <Link to="/bank/transactions?method=card">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        {purchases.length ? (
          <ActivityList transfers={purchases} />
        ) : (
          <div className="empty-state">
            <ShoppingBag size={30} />
            <h3>Your first purchase starts here.</h3>
            <p>
              Card payments will appear alongside the rest of your account
              activity.
            </p>
          </div>
        )}
      </section>
      <div className="card-try-purchase">
        <div>
          <ShoppingBag size={23} />
          <span>
            <strong>Paper & Objects</strong>
            <small>Online purchase · Studio supplies · $24.99</small>
          </span>
        </div>
        <Button
          variant="secondary"
          busy={busy}
          disabled={state.transfers.some(
            (t) => t.id === "demo-card-new-purchase",
          )}
          onClick={purchase}
        >
          {state.transfers.some((t) => t.id === "demo-card-new-purchase")
            ? "Purchase added"
            : "Try a card purchase"}
          <ArrowUpRight size={17} />
        </Button>
        {error && !limits && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
      </div>
      <Modal
        open={details}
        onOpenChange={setDetails}
        title="Card details"
        description="Your USD card is linked to your account balance."
      >
        <NostroCard />
        <DetailRows
          rows={[
            { label: "Cardholder", value: state.profile.name },
            {
              label: "Card reference",
              value: (
                <span className="copy-value">
                  DEMO-CARD-{state.card.last4}
                  <CopyButton
                    compact
                    label="Copy card reference"
                    value={`DEMO-CARD-${state.card.last4}`}
                  />
                </span>
              ),
            },
            { label: "Expiry", value: "12 / 29" },
            { label: "Security code", value: "•••" },
            { label: "Billing country", value: "Pakistan" },
            { label: "Status", value: state.card.frozen ? "Frozen" : "Active" },
          ]}
        />
      </Modal>
      <Modal
        open={limits}
        onOpenChange={setLimits}
        title="Spending limit"
        description="Control how much can be authorised on your card in a day."
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const amount = parseAmount(limit);
              await run((s) => ({
                ...s,
                card: { ...s.card, dailyLimitMinor: amount },
              }));
              setLimits(false);
              notify("Daily spending limit updated.");
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          <Field label="Daily limit (USD)">
            <input
              required
              inputMode="decimal"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />
          </Field>
          <p className="small-text">
            The limit includes settled and pending purchases authorised today.
            Existing payments are unaffected.
          </p>
          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}
          <div className="modal-actions">
            <Button type="submit">Save limit</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
