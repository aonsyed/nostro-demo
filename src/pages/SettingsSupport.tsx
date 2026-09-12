import { assetPath } from "../lib/paths";
import { useState, type FormEvent } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CheckCircle,
  CreditCard,
  Envelope,
  Fingerprint,
  GearSix,
  GlobeHemisphereWest,
  Moon,
  PaperPlaneTilt,
  Plus,
  ShieldCheck,
  Sun,
  User,
  Waveform,
} from "@phosphor-icons/react";
import { useDemo } from "../lib/store";
import {
  dateLabel,
  initials,
  newId,
  productAvailability,
  type SupportCase,
} from "../lib/banking";
import {
  ActionLink,
  Button,
  EmptyState,
  Field,
  Logo,
  Modal,
  PageHeading,
  Status,
} from "../components/ui";

export function NostroCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`nostro-card ${className}`}
      aria-label="Nostro USD debit card"
    >
      <img src={assetPath("nostro-logo.webp")} alt="Nostro" />
      <GlobeHemisphereWest className="card-globe" size={210} weight="thin" />
      <div className="card-chip">
        <CreditCard size={31} weight="thin" />
      </div>
      <div className="card-bottom">
        <span>Made for your world.</span>
        <span>DEBIT / USD</span>
      </div>
    </div>
  );
}

export function Settings() {
  const {
      state,
      run,
      theme,
      setTheme,
      motionEnabled,
      setMotionEnabled,
      reset,
      notify,
    } = useDemo(),
    [profileOpen, setProfileOpen] = useState(false),
    [resetOpen, setResetOpen] = useState(false),
    [securityOpen, setSecurityOpen] = useState(false),
    [profile, setProfile] = useState(state.profile),
    [code, setCode] = useState(""),
    [verified, setVerified] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <>
      <PageHeading
        title="Make yourself at home"
        description="Your profile, preferences and account controls."
      />
      <div className="settings-layout">
        <section className="panel settings-panel">
          <h2>Profile</h2>
          <div className="settings-profile">
            <span className="avatar large">{initials(state.profile.name)}</span>
            <div>
              <strong>{state.profile.name}</strong>
              <p>{state.profile.email}</p>
              <small>{state.profile.company} / Pakistan</small>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setProfile(state.profile);
                setProfileOpen(true);
              }}
            >
              Edit
            </Button>
          </div>
          <h2>Appearance</h2>
          <div className="setting-row">
            <span>
              <strong>Colour theme</strong>
              <small>One monochrome system, in two modes.</small>
            </span>
            <div className="segmented">
              <button
                aria-pressed={theme === "light"}
                onClick={() => setTheme("light")}
              >
                <Sun size={18} />
                Light
              </button>
              <button
                aria-pressed={theme === "dark"}
                onClick={() => setTheme("dark")}
              >
                <Moon size={18} />
                Dark
              </button>
            </div>
          </div>
          <div className="setting-row">
            <span>
              <strong>Website animation</strong>
              <small>
                System reduced-motion preferences are always respected.
              </small>
            </span>
            <button
              className={`switch ${motionEnabled ? "on" : ""}`}
              role="switch"
              aria-checked={motionEnabled}
              aria-label="Website animation"
              onClick={() => setMotionEnabled(!motionEnabled)}
            >
              <span />
            </button>
          </div>
          <h2>Security & help</h2>
          <button
            className="settings-link"
            onClick={() => {
              setCode("");
              setError("");
              setVerified(false);
              setSecurityOpen(true);
            }}
          >
            <Fingerprint size={23} />
            <span>
              <strong>Security verification preview</strong>
              <small>
                Review a verification step before sensitive account changes.
              </small>
            </span>
            <ArrowUpRight size={19} />
          </button>
          <Link className="settings-link" to="/bank/support">
            <ShieldCheck size={23} />
            <span>
              <strong>Help & support</strong>
              <small>Payment help and case history.</small>
            </span>
            <ArrowUpRight size={19} />
          </Link>
          <Link className="settings-link" to="/terms-of-service">
            <GearSix size={23} />
            <span>
              <strong>Terms & product disclosures</strong>
              <small>Account terms and privacy information.</small>
            </span>
            <ArrowUpRight size={19} />
          </Link>
        </section>
        <aside>
          <section className="panel compact-panel">
            <h3>Your account workspace.</h3>
            <p>
              Restore the starting account data whenever you want a fresh view.
            </p>
            <Button variant="secondary" onClick={() => setResetOpen(true)}>
              Reset workspace <ArrowRight size={16} />
            </Button>
          </section>
          <section className="panel compact-panel">
            <h3>Try an empty account</h3>
            <p>
              See how the dashboard handles a new account without inventing a
              balance or activity.
            </p>
            <Button
              variant="secondary"
              onClick={async () => {
                await run((s) => ({
                  ...s,
                  openingMinor: 0,
                  transfers: [],
                  links: [],
                  cases: [],
                }));
                notify(
                  "Empty-account scenario loaded. Reset workspace to restore example activity.",
                );
              }}
            >
              Load empty scenario
            </Button>
          </section>
          <Link to="/" className="inline-link">
            Back to the website <ArrowUpRight size={16} />
          </Link>
        </aside>
      </div>
      <Modal
        open={profileOpen}
        onOpenChange={setProfileOpen}
        title="Edit profile"
        description="Update your account information."
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            await run((s) => ({ ...s, profile }));
            setBusy(false);
            setProfileOpen(false);
            notify("Profile updated.");
          }}
        >
          <Field label="Name">
            <input
              required
              value={profile.name}
              onChange={(e) =>
                setProfile((p) => ({ ...p, name: e.target.value }))
              }
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              required
              value={profile.email}
              onChange={(e) =>
                setProfile((p) => ({ ...p, email: e.target.value }))
              }
            />
          </Field>
          <Field label="Company">
            <input
              required
              value={profile.company}
              onChange={(e) =>
                setProfile((p) => ({ ...p, company: e.target.value }))
              }
            />
          </Field>
          <div className="modal-actions">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setProfileOpen(false)}
            >
              Cancel
            </Button>
            <Button busy={busy} type="submit">
              Save profile
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset this workspace?"
        description="This restores the starting balances, payments, card settings and profile. Your current workspace changes will be removed."
      >
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setResetOpen(false)}>
            Keep exploring
          </Button>
          <Button
            onClick={() => {
              reset();
              setResetOpen(false);
            }}
          >
            Reset workspace
          </Button>
        </div>
      </Modal>
      <Modal
        open={securityOpen}
        onOpenChange={setSecurityOpen}
        title="Verification preview"
        description="Use the code shown below to complete verification."
      >
        {verified ? (
          <div className="checkout-success">
            <CheckCircle size={45} />
            <h2>Verification complete</h2>
            <p>The verification code was accepted.</p>
            <Button onClick={() => setSecurityOpen(false)}>Done</Button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (code === "654321") setVerified(true);
              else setError("That code does not match. Try 654321.");
            }}
          >
            <div className="info-box">
              Example code: <strong>654321</strong>
            </div>
            <Field label="Verification code">
              <input
                inputMode="numeric"
                autoComplete="off"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </Field>
            {error && (
              <p className="error-text" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="full">
              Verify code
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
}

export function Support() {
  const { state, run, notify } = useDemo(),
    navigate = useNavigate(),
    [params] = useSearchParams(),
    [category, setCategory] = useState("Payments"),
    [description, setDescription] = useState(""),
    [attachment, setAttachment] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [key] = useState(() => newId("case"));
  const transfer = state.transfers.find((t) => t.id === params.get("transfer"));
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 10) {
      setError("Please describe the issue in at least 10 characters.");
      return;
    }
    setBusy(true);
    setError("");
    const now = new Date().toISOString(),
      subject = transfer
        ? `Help with ${transfer.counterparty.name}`
        : description.trim().slice(0, 60);
    const supportCase: SupportCase = {
      id: key,
      category,
      subject,
      description,
      transferId: transfer?.id,
      status: "Open",
      createdAt: now,
      attachment,
      messages: [
        { at: now, author: "You", text: description },
        {
          at: now,
          author: "Nostro Support",
          text: "Your case has been recorded with the payment details attached. You can add more information below.",
        },
      ],
    };
    try {
      await run((s) =>
        s.cases.some((c) => c.id === key)
          ? s
          : { ...s, cases: [supportCase, ...s.cases] },
      );
      notify("Your support case has been created.");
      navigate(`/bank/support/${key}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeading
        title="Let’s sort it out"
        description="Payment context and support, together."
      />
      <div className="support-layout">
        <section className="panel support-form">
          <h2>How can we help?</h2>
          {transfer && (
            <Link
              className="support-transfer"
              to={`/bank/transactions/${transfer.id}`}
            >
              <ShieldCheck size={21} />
              <span>
                <strong>{transfer.counterparty.name}</strong>
                <small>{transfer.id} will be attached to this case.</small>
              </span>
              <ArrowUpRight size={17} />
            </Link>
          )}
          <form onSubmit={submit}>
            <fieldset className="support-categories">
              <legend>What is this about?</legend>
              {["Payments", "App issue", "Balance", "General"].map((c) => (
                <label key={c}>
                  <input
                    type="radio"
                    name="category"
                    value={c}
                    checked={category === c}
                    onChange={() => setCategory(c)}
                  />
                  <span>{c}</span>
                </label>
              ))}
            </fieldset>
            <Field label="Tell us what happened">
              <textarea
                required
                rows={6}
                maxLength={2000}
                value={description}
                placeholder="Describe the issue and what you expected to happen."
                onChange={(e) => setDescription(e.target.value)}
              />
              <small className="input-count">{description.length} / 2000</small>
            </Field>
            <Field
              label="Image reference (optional)"
              hint="JPG or PNG, up to 10 MB. Stores a filename reference only."
            >
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (
                    file &&
                    (file.size > 10 * 1024 * 1024 ||
                      !["image/jpeg", "image/png"].includes(file.type))
                  ) {
                    setError("Choose a JPG or PNG no larger than 10 MB.");
                    e.target.value = "";
                    setAttachment("");
                  } else {
                    setAttachment(file?.name || "");
                    setError("");
                  }
                }}
              />
            </Field>
            {error && (
              <p role="alert" className="error-text">
                {error}
              </p>
            )}
            <Button type="submit" busy={busy}>
              Create support case <PaperPlaneTilt size={18} />
            </Button>
          </form>
        </section>
        <aside>
          <section className="panel cases-list">
            <div className="panel-heading">
              <h2>Your cases</h2>
              <span>{state.cases.length}</span>
            </div>
            {state.cases.length ? (
              state.cases.map((c) => (
                <Link key={c.id} to={`/bank/support/${c.id}`}>
                  <strong>{c.subject}</strong>
                  <small>{c.id}</small>
                  <span>
                    <Status status={c.status} />
                    {dateLabel(c.createdAt)}
                  </span>
                </Link>
              ))
            ) : (
              <p>No cases yet.</p>
            )}
          </section>
          <div className="receive-guide">
            <h3>A little context goes a long way.</h3>
            <p>
              Open support from a payment receipt to include its reference
              automatically.
            </p>
            <Link to="/bank/transactions" className="inline-link">
              Find a payment <ArrowRight size={16} />
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}

export function SupportDetail() {
  const { id } = useParams(),
    { state, run, notify } = useDemo(),
    [reply, setReply] = useState(""),
    [busy, setBusy] = useState(false);
  const supportCase = state.cases.find((c) => c.id === id);
  if (!supportCase)
    return (
      <EmptyState
        title="Case not found"
        description="This case could not be found."
      >
        <ActionLink to="/bank/support">Go to support</ActionLink>
      </EmptyState>
    );
  return (
    <div className="case-detail">
      <Link className="back-link" to="/bank/support">
        <ArrowLeft size={17} />
        Help & support
      </Link>
      <PageHeading title={supportCase.subject} description={supportCase.id}>
        <Status status={supportCase.status} />
        <Button
          variant="secondary"
          onClick={async () => {
            await run((s) => ({
              ...s,
              cases: s.cases.map((c) =>
                c.id === id
                  ? { ...c, status: c.status === "Open" ? "Resolved" : "Open" }
                  : c,
              ),
            }));
            notify("Case status updated.");
          }}
        >
          {supportCase.status === "Open" ? "Mark resolved" : "Reopen case"}
        </Button>
      </PageHeading>
      {supportCase.transferId && (
        <ActionLink
          variant="secondary"
          to={`/bank/transactions/${supportCase.transferId}`}
        >
          View linked payment
        </ActionLink>
      )}
      <section className="panel case-conversation">
        {supportCase.messages.map((m, i) => (
          <article key={i} className={m.author === "You" ? "from-user" : ""}>
            <span className="avatar">
              {m.author === "You" ? initials(state.profile.name) : "N"}
            </span>
            <div>
              <header>
                <strong>{m.author}</strong>
                <time>{dateLabel(m.at, true)} PKT</time>
              </header>
              <p>{m.text}</p>
            </div>
          </article>
        ))}
        {supportCase.attachment && (
          <p className="small-text">
            Local image reference: {supportCase.attachment}. No image was
            uploaded.
          </p>
        )}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!reply.trim()) return;
            setBusy(true);
            const text = reply;
            await run((s) => ({
              ...s,
              cases: s.cases.map((c) =>
                c.id === id
                  ? {
                      ...c,
                      status: "Open",
                      messages: [
                        ...c.messages,
                        { at: new Date().toISOString(), author: "You", text },
                      ],
                    }
                  : c,
              ),
            }));
            setReply("");
            setBusy(false);
            notify("Reply saved to your case.");
          }}
        >
          <Field label="Add a reply">
            <textarea
              required
              rows={3}
              maxLength={2000}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />
          </Field>
          <Button busy={busy} type="submit">
            Save reply <PaperPlaneTilt size={17} />
          </Button>
        </form>
      </section>
    </div>
  );
}
