import { assetPath } from "../lib/paths";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bank,
  CaretRight,
  Check,
  Clock,
  Plus,
  ShieldCheck,
} from "@phosphor-icons/react";
import { useDemo } from "../lib/store";
import {
  getBalances,
  initials,
  money,
  newId,
  parseAmount,
  quoteTransfer,
  rules,
  submitTransfer,
  type Country,
  type Quote,
  type Recipient,
} from "../lib/banking";
import { Button, DetailRows, Field, PageHeading } from "../components/ui";
import { QuoteCalculator } from "../components/QuoteCalculator";

type Draft = {
  key: string;
  country: Country;
  amount: string;
  recipientId: string;
  recipient?: Recipient;
  purpose: string;
  quote?: Quote;
};
export function SendMoney() {
  const { state, run, notify } = useDemo(),
    navigate = useNavigate(),
    [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState<Draft>(() => {
    try {
      const saved = JSON.parse(
        sessionStorage.getItem("nostro-send-draft") || "null",
      );
      if (saved?.key && !params.has("amount")) return saved;
    } catch {}
    return {
      key: newId("transfer"),
      country: params.get("country") === "US" ? "US" : "PK",
      amount: params.get("amount") || "850",
      recipientId: "",
      purpose: "Family support",
    };
  });
  const rawStep = Number(params.get("step") || 0),
    requestedStep = Number.isFinite(rawStep)
      ? Math.min(2, Math.max(0, Math.floor(rawStep)))
      : 0,
    step =
      requestedStep > 0 && !draft.quote
        ? 0
        : requestedStep === 2 && !draft.recipient
          ? 1
          : requestedStep;
  const [newRecipient, setNewRecipient] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [now, setNow] = useState(Date.now());
  const balance = getBalances(state),
    availableRecipients = state.recipients.filter(
      (r) => r.country === draft.country,
    );
  const [recipientForm, setRecipientForm] = useState({
    name: "",
    type: "Personal",
    bank: "",
    account: "",
    email: "",
    phone: "",
  });
  const [saveRecipient, setSaveRecipient] = useState(true);
  useEffect(() => {
    try {
      sessionStorage.setItem("nostro-send-draft", JSON.stringify(draft));
    } catch {}
  }, [draft]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const go = (next: number) => {
    setError("");
    setParams({ step: String(next) });
    window.scrollTo(0, 0);
  };
  const quote = draft.quote,
    expired = quote ? now > new Date(quote.expiresAt).getTime() : false;
  const amountContinue = (e: FormEvent) => {
    e.preventDefault();
    try {
      const next = quoteTransfer(
        draft.country,
        parseAmount(draft.amount),
        balance.available,
      );
      setDraft((d) => ({ ...d, quote: next }));
      go(1);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const recipientContinue = (e: FormEvent) => {
    e.preventDefault();
    let recipient: Recipient | undefined;
    if (newRecipient) {
      if (!recipientForm.account.startsWith("DEMO-")) {
        setError("Enter an account reference beginning with DEMO-.");
        return;
      }
      recipient = {
        ...recipientForm,
        id: newId("recipient"),
        type: recipientForm.type as "Personal" | "Business",
        country: draft.country,
      };
    } else
      recipient = availableRecipients.find((r) => r.id === draft.recipientId);
    if (!recipient) {
      setError("Choose a recipient to continue.");
      return;
    }
    setDraft((d) => ({ ...d, recipient }));
    go(2);
  };
  const confirm = async () => {
    if (!quote || !draft.recipient) return;
    setBusy(true);
    setError("");
    try {
      await run((s) => {
        const sent = submitTransfer(s, {
          key: draft.key,
          quote,
          recipient: draft.recipient!,
          purpose: draft.purpose,
        });
        return saveRecipient &&
          !sent.recipients.some((r) => r.id === draft.recipient!.id)
          ? { ...sent, recipients: [...sent.recipients, draft.recipient!] }
          : sent;
      });
      sessionStorage.removeItem("nostro-send-draft");
      notify("Transfer submitted. Your receipt has all the details.");
      navigate(`/bank/transactions/${draft.key}`, { replace: true });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="send-page">
      <Link to="/bank" className="back-link">
        <ArrowLeft size={16} />
        Back to account
      </Link>
      <PageHeading
        title={
          [
            "Where is it going?",
            "Who are you paying?",
            "Everything look right?",
          ][step]
        }
        description={
          [
            "Start with the destination and amount.",
            "Choose a saved recipient or add someone new.",
            "Check the recipient, account and final amounts before you confirm.",
          ][step]
        }
      />
      <ol className="stepper">
        {["Amount", "Recipient", "Review"].map((label, i) => (
          <li
            className={i === step ? "active" : i < step ? "complete" : ""}
            key={label}
          >
            <span>{i < step ? <Check size={14} /> : i + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      <div className="send-layout">
        <section className="panel send-form">
          {step === 0 && (
            <form onSubmit={amountContinue}>
              <fieldset className="destination-picker">
                <legend>Destination</legend>
                {(["PK", "US"] as Country[]).map((country) => (
                  <button
                    type="button"
                    key={country}
                    aria-pressed={draft.country === country}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        country,
                        recipientId: "",
                        recipient: undefined,
                        quote: undefined,
                      }))
                    }
                  >
                    <img
                      src={
                        country === "PK"
                          ? assetPath("pk.webp")
                          : assetPath("us.webp")
                      }
                      alt=""
                    />
                    <span>
                      <strong>
                        {country === "PK" ? "Pakistan" : "United States"}
                      </strong>
                      <small>
                        {country === "PK" ? "USD to PKR" : "USD to USD"}
                      </small>
                    </span>
                    {draft.country === country && <Check size={20} />}
                  </button>
                ))}
              </fieldset>
              <Field
                label="You send"
                hint={`Available: ${money(balance.available)}`}
              >
                <div className="amount-input">
                  <span>$</span>
                  <input
                    required
                    autoFocus
                    inputMode="decimal"
                    aria-label="Transfer amount in USD"
                    value={draft.amount}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        amount: e.target.value,
                        quote: undefined,
                      }))
                    }
                  />
                  <span>USD</span>
                </div>
              </Field>
              <p className="small-text">
                Minimum:{" "}
                {money(
                  draft.country === "PK"
                    ? rules.minimumPKMinor
                    : rules.minimumUSMinor,
                )}
                . Transfer fee: $0.00.
              </p>
              {error && (
                <p role="alert" className="error-text">
                  {error}
                </p>
              )}
              <Button className="full" type="submit">
                Choose a recipient <ArrowRight size={18} />
              </Button>
            </form>
          )}
          {step === 1 && (
            <form onSubmit={recipientContinue}>
              <div className="segmented">
                <button
                  type="button"
                  aria-pressed={!newRecipient}
                  onClick={() => setNewRecipient(false)}
                >
                  Saved recipients
                </button>
                <button
                  type="button"
                  aria-pressed={newRecipient}
                  onClick={() => setNewRecipient(true)}
                >
                  <Plus size={16} />
                  Someone new
                </button>
              </div>
              {newRecipient ? (
                <div className="recipient-fields">
                  <Field label="Recipient type">
                    <select
                      value={recipientForm.type}
                      onChange={(e) =>
                        setRecipientForm((r) => ({
                          ...r,
                          type: e.target.value,
                        }))
                      }
                    >
                      <option>Personal</option>
                      <option>Business</option>
                    </select>
                  </Field>
                  <Field label="Full legal name">
                    <input
                      required
                      value={recipientForm.name}
                      onChange={(e) =>
                        setRecipientForm((r) => ({
                          ...r,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Recipient’s full name"
                    />
                  </Field>
                  <Field label="Bank">
                    <select
                      required
                      value={recipientForm.bank}
                      onChange={(e) =>
                        setRecipientForm((r) => ({
                          ...r,
                          bank: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select a bank</option>
                      {(draft.country === "PK"
                        ? ["Meezan Bank", "HBL", "UBL", "Bank Alfalah"]
                        : ["Chase", "Bank of America", "Citibank"]
                      ).map((bank) => (
                        <option key={bank}>{bank}</option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="Account reference"
                    hint="Use the account reference provided by the recipient."
                  >
                    <input
                      required
                      value={recipientForm.account}
                      onChange={(e) =>
                        setRecipientForm((r) => ({
                          ...r,
                          account: e.target.value,
                        }))
                      }
                      placeholder={`DEMO-${draft.country}-1234`}
                    />
                  </Field>
                  <Field label="Email (optional)">
                    <input
                      type="email"
                      value={recipientForm.email}
                      onChange={(e) =>
                        setRecipientForm((r) => ({
                          ...r,
                          email: e.target.value,
                        }))
                      }
                      placeholder="recipient@family.example"
                    />
                  </Field>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={saveRecipient}
                      onChange={(e) => setSaveRecipient(e.target.checked)}
                    />
                    Save recipient
                  </label>
                </div>
              ) : (
                <div className="recipient-list">
                  {availableRecipients.map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      aria-pressed={draft.recipientId === r.id}
                      onClick={() =>
                        setDraft((d) => ({ ...d, recipientId: r.id }))
                      }
                    >
                      <span className="avatar">{initials(r.name)}</span>
                      <span>
                        <strong>{r.name}</strong>
                        <small>
                          {r.bank} / {r.account}
                        </small>
                      </span>
                      {draft.recipientId === r.id ? (
                        <Check size={19} />
                      ) : (
                        <CaretRight size={18} />
                      )}
                    </button>
                  ))}
                  {!availableRecipients.length && (
                    <p>No saved recipients here yet. Add someone new.</p>
                  )}
                </div>
              )}
              <Field label="Payment purpose">
                <input
                  required
                  maxLength={100}
                  value={draft.purpose}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, purpose: e.target.value }))
                  }
                />
              </Field>
              {error && (
                <p role="alert" className="error-text">
                  {error}
                </p>
              )}
              <div className="form-actions">
                <Button type="button" variant="secondary" onClick={() => go(0)}>
                  Back
                </Button>
                <Button type="submit">
                  Review transfer <ArrowRight size={18} />
                </Button>
              </div>
            </form>
          )}
          {step === 2 && quote && draft.recipient && (
            <>
              <div className="review-recipient">
                <span className="avatar large">
                  {initials(draft.recipient.name)}
                </span>
                <h2>{draft.recipient.name}</h2>
                <p>{draft.recipient.bank}</p>
                <strong>{draft.recipient.account}</strong>
                <button className="text-button" onClick={() => go(1)}>
                  Change recipient
                </button>
              </div>
              <DetailRows
                rows={[
                  { label: "You send", value: money(quote.amountMinor) },
                  { label: "Fee", value: money(quote.feeMinor) },
                  {
                    label: "Total from your account",
                    value: <strong>{money(quote.debitMinor)}</strong>,
                  },
                  {
                    label: "Recipient receives",
                    value: (
                      <strong>
                        {money(quote.recipientMinor, quote.recipientCurrency)}
                      </strong>
                    ),
                  },
                  {
                    label: "Exchange rate",
                    value: `1 USD = ${quote.rate} ${quote.recipientCurrency}`,
                  },
                  {
                    label: "From",
                    value: `${state.account.bank} / ${state.account.number}`,
                  },
                  { label: "Purpose", value: draft.purpose },
                ]}
              />
              <div className={`quote-expiry ${expired ? "error-text" : ""}`}>
                <Clock size={17} />
                {expired
                  ? "Quote expired. Refresh and review it again."
                  : `Quote valid for ${Math.max(0, Math.ceil((new Date(quote.expiresAt).getTime() - now) / 60000))} min`}
                {expired && (
                  <button
                    className="text-button"
                    onClick={() => {
                      try {
                        setDraft((d) => ({
                          ...d,
                          quote: quoteTransfer(
                            d.country,
                            parseAmount(d.amount),
                            balance.available,
                          ),
                        }));
                        setError("");
                      } catch (e) {
                        setError((e as Error).message);
                      }
                    }}
                  >
                    Refresh quote
                  </button>
                )}
              </div>
              {error && (
                <p className="error-text" role="alert">
                  {error}
                </p>
              )}
              <div className="form-actions">
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() => go(1)}
                >
                  Back
                </Button>
                <Button disabled={expired} busy={busy} onClick={confirm}>
                  Confirm transfer <ArrowUpRight size={18} />
                </Button>
              </div>
            </>
          )}
        </section>
        <aside className="send-aside">
          <Bank size={30} />
          <h3>A clear path home.</h3>
          <p>
            {draft.country === "PK"
              ? "Send from your USD account to a bank account in Pakistan."
              : "Send US dollars to a bank account in the United States."}
          </p>
          <div className="send-route">
            <span>
              <img src={assetPath("us.webp")} alt="" />
              Your USD account
            </span>
            <span className="route-connector">
              <ArrowRight size={18} />
            </span>
            <span>
              <img
                src={
                  draft.country === "PK"
                    ? assetPath("pk.webp")
                    : assetPath("us.webp")
                }
                alt=""
              />
              {draft.country === "PK" ? "Pakistan" : "United States"}
            </span>
          </div>
          <div className="send-guidance">
            <ShieldCheck size={19} />
            <p>
              Every payment gets a full receipt with its recipient, bank, fees
              and status history.
            </p>
          </div>
          <p className="small-text">
            Keep your recipient’s name and bank details up to date before
            sending.
          </p>
        </aside>
      </div>
    </div>
  );
}
export function Exchange() {
  return (
    <>
      <PageHeading
        title="A clearer exchange"
        description="See the full calculation before you send."
      />
      <div className="exchange-page">
        <div>
          <h2>
            Know what arrives.
            <br />
            Before it leaves.
          </h2>
          <p>
            Your USD amount, the exchange rate, the fee and the PKR amount your
            recipient receives. No guessing between screens.
          </p>
          <div className="info-box">
            <ShieldCheck size={25} />
            <span>
              Your quoted rate, transfer fee and recipient amount stay together
              from review to receipt.
            </span>
          </div>
        </div>
        <QuoteCalculator initialAmount="1000" />
      </div>
    </>
  );
}
