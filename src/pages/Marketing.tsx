import { assetPath } from "../lib/paths";
import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDown,
  Bank,
  CheckCircle,
  CreditCard,
  GlobeHemisphereWest,
  Link as LinkIcon,
  List,
  Minus,
  Play,
  Plus,
  ShieldCheck,
  X,
} from "@phosphor-icons/react";
import {
  ActionLink,
  Button,
  Logo,
  Modal,
  Reveal,
  ThemeToggle,
} from "../components/ui";
import { BalancePanel } from "./Banking";
import { NostroCard } from "./SettingsSupport";
import { CashChart } from "../components/Charts";
import { QuoteCalculator } from "../components/QuoteCalculator";
import { ActivityList } from "../components/ActivityList";
import { useDemo } from "../lib/store";

const products = [
  ["Receive money", "Your own USD account", "/feature/receive"],
  ["Send money", "From your account to theirs", "/feature/send"],
  ["Payment links", "A simpler way to collect", "/payment-links"],
  ["Nostro Card", "Your everyday, in dollars", "/feature/debit-card"],
  ["Money to Pakistan", "Explore the transfer journey", "/remittance"],
];
const resources = [
  ["Help centre", "Answers, without the runaround", "/faq"],
  [
    "Your money’s protection",
    "Understand the people and processes",
    "/how-your-money-is-protected",
  ],
  ["Roadmap", "Available, coming soon and planned", "/roadmap"],
];
export function MarketingShell() {
  const [menu, setMenu] = useState(""),
    [mobile, setMobile] = useState(false);
  const { pathname } = useLocation(),
    { toast } = useDemo();
  useEffect(() => {
    setMenu("");
    setMobile(false);
    window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu("");
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <div className="marketing">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="marketing-header">
        <Logo />
        <nav className="marketing-nav" aria-label="Main navigation">
          {["Products", "Resources"].map((n) => (
            <button
              key={n}
              aria-expanded={menu === n}
              aria-controls="mega-menu"
              onClick={() => setMenu(menu === n ? "" : n)}
            >
              {n}
              {menu === n ? <Minus size={13} /> : <Plus size={13} />}
            </button>
          ))}
          <Link to="/about">Our story</Link>
        </nav>
        <div className="marketing-utilities">
          <ThemeToggle />
          <ActionLink to="/bank" className="header-demo" arrow={false}>
            Open your account <ArrowUpRight size={17} />
          </ActionLink>
          <button
            aria-label="Open navigation"
            className="icon-button mobile-menu-button"
            onClick={() => setMobile(true)}
          >
            <List size={23} />
          </button>
        </div>
        <AnimatePresence>
          {menu && (
            <motion.div
              id="mega-menu"
              className="mega-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="mega-intro">
                <small>{menu}</small>
                <h2>
                  {menu === "Products"
                    ? "Money, made more useful."
                    : "A little clarity goes a long way."}
                </h2>
                <p>
                  Explore your account, your card and a clearer way to move
                  money.
                </p>
              </div>
              <div className="mega-links">
                {(menu === "Products" ? products : resources).map(
                  ([title, description, to]) => (
                    <Link to={to} key={to}>
                      <span>
                        <strong>{title}</strong>
                        <small>{description}</small>
                      </span>
                      <ArrowUpRight size={22} />
                    </Link>
                  ),
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      {menu && (
        <button
          className="menu-scrim"
          aria-label="Close navigation menu"
          onClick={() => setMenu("")}
        />
      )}
      <Modal open={mobile} onOpenChange={setMobile} title="Explore Nostro">
        <div className="mobile-navigation">
          {[
            ...products,
            ...resources,
            ["Our story", "Meet the people building Nostro", "/about"],
          ].map(([title, description, to]) => (
            <Link to={to} key={to}>
              <strong>{title}</strong>
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </div>
        <ActionLink to="/bank" className="full">
          Open your account
        </ActionLink>
      </Modal>
      <main id="main-content">
        <Outlet />
      </main>
      <footer className="marketing-footer">
        <div className="footer-top">
          <div>
            <Logo />
            <p>
              A world of possibility.
              <br />
              An account of your own.
            </p>
          </div>
          <div>
            <h3>Products</h3>
            {products.map(([title, , to]) => (
              <Link key={to} to={to}>
                {title}
              </Link>
            ))}
          </div>
          <div>
            <h3>Discover</h3>
            {resources.map(([title, , to]) => (
              <Link key={to} to={to}>
                {title}
              </Link>
            ))}
            <Link to="/about">Our story</Link>
            <Link to="/bank/support">Help & support</Link>
          </div>
          <div>
            <h3>The details</h3>
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/terms-of-service">Terms of service</Link>
            <ThemeToggle />
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            Product demo. All balances, transfers and account details are
            fictional. No real money moves.
          </p>
          <span>© 2026 Nostro</span>
        </div>
      </footer>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle size={20} />
          {toast}
        </div>
      )}
    </div>
  );
}

export function ProductPreview({ scene = 0 }: { scene?: number }) {
  const { state } = useDemo();
  return (
    <div className={`product-preview scene-${scene}`}>
      <div className="preview-window">
        <span>
          <i />
          <i />
          <i />
        </span>
        <small>Nostro / Personal account</small>
        <span>USD</span>
      </div>
      {scene === 0 ? (
        <>
          <div className="preview-heading">
            <span>Your world. Your account.</span>
            <Bank size={20} />
          </div>
          <BalancePanel compact />
          <div className="preview-account">
            <span>
              Account holder<strong>{state.profile.name}</strong>
            </span>
            <span>
              Account number<strong>{state.account.number}</strong>
            </span>
            <span>
              Bank<strong>{state.account.bank}</strong>
            </span>
          </div>
        </>
      ) : scene === 1 ? (
        <QuoteCalculator publicMode />
      ) : scene === 2 ? (
        <div className="preview-card issued-preview">
          <NostroCard />
          <div className="preview-issued-state">
            <span>Nostro USD · •••• {state.card.last4}</span>
            <span>{state.card.frozen ? "Frozen" : "Active"}</span>
          </div>
          <ActivityList
            transfers={state.transfers.filter((t) => t.card).slice(0, 2)}
            compact
          />
        </div>
      ) : (
        <>
          <div className="preview-heading">
            <span>Get paid. Keep the details.</span>
            <LinkIcon size={23} />
          </div>
          <div className="invoice-preview">
            <small>ATELIER NINE / INVOICE 024</small>
            <h3>
              Good work.
              <br />
              Ready to be paid.
            </h3>
            <div>
              <span>Brand identity · Milestone 01</span>
              <strong>$1,500.00</strong>
            </div>
            <ActionLink to="/bank/payments" className="full">
              Explore payment links
            </ActionLink>
          </div>
        </>
      )}
    </div>
  );
}

const scenes = [
  {
    label: "Receive",
    heading: "Your work goes global.\nYour account should too.",
    copy: "A US dollar account for the work you do across borders. Find the right receiving details, share them with your payer and follow the money from one place.",
    to: "/feature/receive",
  },
  {
    label: "Send",
    heading: "From a good month.\nTo a little more at home.",
    copy: "See the amount, destination and example exchange rate before you send. Then follow the transfer all the way to a receipt that tells the whole story.",
    to: "/feature/send",
  },
  {
    label: "Card",
    heading: "Your next chapter.\nIn your pocket.",
    copy: "Spend from your USD balance, control your card and keep every purchase in view. Merchant details, pending charges and refunds stay together.",
    to: "/feature/debit-card",
  },
  {
    label: "Collect",
    heading: "Less chasing.\nMore getting paid.",
    copy: "Create a payment link, choose the amount and follow each collection through to your account history.",
    to: "/payment-links",
  },
];
function ProductStory() {
  const ref = useRef<HTMLDivElement>(null),
    { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start start", "end end"],
    }),
    [scene, setScene] = useState(0),
    reduced = useReducedMotion(),
    { motionEnabled } = useDemo(),
    [wide, setWide] = useState(() => window.innerWidth >= 1000);
  useEffect(() => {
    const mq = matchMedia("(min-width: 1000px)"),
      change = () => setWide(mq.matches);
    mq.addEventListener("change", change);
    return () => mq.removeEventListener("change", change);
  }, []);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (wide && motionEnabled && !reduced)
      setScene(Math.min(3, Math.floor(v * 4)));
  });
  const item = scenes[scene];
  return (
    <section
      ref={ref}
      className={`product-story ${!motionEnabled || reduced ? "static-story" : ""}`}
      id="product-story"
    >
      <div className="story-sticky">
        <div className="story-copy">
          <span className="eyebrow">An account for what comes next</span>
          <div
            className="story-tabs"
            role="group"
            aria-label="Explore products"
          >
            {scenes.map((s, i) => (
              <button
                key={s.label}
                aria-pressed={scene === i}
                onClick={() => setScene(i)}
              >
                <span>0{i + 1}</span>
                {s.label}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={scene}
              initial={
                reduced || !motionEnabled ? false : { opacity: 0, y: 18 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h2>{item.heading}</h2>
              <p>{item.copy}</p>
              <ActionLink variant="secondary" to={item.to}>
                Explore {item.label.toLowerCase()}
              </ActionLink>
            </motion.div>
          </AnimatePresence>
          <span className="story-counter">
            0{scene + 1} <span>/ 04</span>
          </span>
        </div>
        <div className="story-visual">
          <AnimatePresence mode="wait">
            <motion.div
              key={scene}
              initial={
                reduced || !motionEnabled
                  ? false
                  : { opacity: 0, scale: 0.95, rotate: 2 }
              }
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <ProductPreview scene={scene} />
            </motion.div>
          </AnimatePresence>
          <span className="preview-caption">
            Everything connected. In one account.
          </span>
        </div>
      </div>
    </section>
  );
}

function Walkthrough() {
  const [step, setStep] = useState(0),
    [playing, setPlaying] = useState(false),
    { motionEnabled } = useDemo(),
    reduced = useReducedMotion();
  useEffect(() => {
    if (!playing || !motionEnabled || reduced) return;
    const id = setInterval(() => setStep((s) => (s + 1) % 4), 4000);
    return () => clearInterval(id);
  }, [playing, motionEnabled, reduced]);
  return (
    <section className="walkthrough section-wrap">
      <Reveal className="section-heading">
        <div>
          <span className="eyebrow">See the whole picture</span>
          <h2>
            No mystery in
            <br />
            your money.
          </h2>
        </div>
        <p>
          See how your account works, from receiving a payment to using your
          card. Open your account and explore each step.
        </p>
      </Reveal>
      <div className="walkthrough-stage">
        <div className="walkthrough-controls">
          <span className="eyebrow">A quick product tour</span>
          {scenes.map((s, i) => (
            <button
              key={s.label}
              aria-pressed={step === i}
              onClick={() => {
                setPlaying(false);
                setStep(i);
              }}
            >
              <span>0{i + 1}</span>
              <strong>
                {
                  [
                    "Find your US account details",
                    "See what arrives in Pakistan",
                    "Manage your card and purchases",
                    "Create a payment link",
                  ][i]
                }
              </strong>
              <ArrowUpRight size={20} />
            </button>
          ))}
          <Button
            variant="secondary"
            onClick={() => setPlaying(!playing)}
            disabled={!motionEnabled || !!reduced}
          >
            <Play size={16} />
            {playing ? "Pause tour" : "Play the tour"}
          </Button>
          <small>Motion preferences are respected.</small>
        </div>
        <div className="tour-screen">
          <ProductPreview scene={step} />
        </div>
      </div>
      <div className="source-videos">
        <span>See how it works</span>
        <a
          href="https://www.tiktok.com/@nostropk/video/7618650478242483477"
          target="_blank"
          rel="noreferrer"
        >
          Nostro’s payment walkthrough <ArrowUpRight size={16} />
        </a>
        <a
          href="https://www.tiktok.com/@nostropk/video/7623132898404633876"
          target="_blank"
          rel="noreferrer"
        >
          Nostro’s payout walkthrough <ArrowUpRight size={16} />
        </a>
      </div>
    </section>
  );
}

const audiences = [
  {
    name: "Freelancers",
    title: "Made for your next\nbig yes.",
    copy: "The client abroad. The project you wanted. A clearer place to receive your earnings and plan what comes next.",
    label: "CLIENT PAYMENT",
    amount: "$3,200.00",
    source: "Upwork payout",
  },
  {
    name: "Remote teams",
    title: "Your work has\nno fixed address.",
    copy: "Keep your USD income visible, whether you’re working from a studio, your home or somewhere in between.",
    label: "MONTHLY PAYOUT",
    amount: "$2,750.00",
    source: "Deel payment",
  },
  {
    name: "Independent businesses",
    title: "Build something\nof your own.",
    copy: "Give clients a clear way to pay, keep the references together and follow each collection from the first link to the last detail.",
    label: "PROJECT MILESTONE",
    amount: "$1,500.00",
    source: "Atelier Nine · payment link",
  },
];
function Audience() {
  const [active, setActive] = useState(0),
    item = audiences[active];
  return (
    <section className="audience-section">
      <div className="audience-inner section-wrap">
        <div className="audience-copy">
          <span className="eyebrow">Built around the way you work</span>
          <div className="audience-tabs">
            {audiences.map((a, i) => (
              <button
                key={a.name}
                aria-pressed={active === i}
                onClick={() => setActive(i)}
              >
                {a.name}
              </button>
            ))}
          </div>
          <h2>{item.title}</h2>
          <p>{item.copy}</p>
          <ActionLink to="/feature/receive" variant="secondary">
            Find your way in
          </ActionLink>
        </div>
        <div className="audience-art">
          <GlobeHemisphereWest
            className="orbit-globe"
            size={430}
            weight="thin"
          />
          <motion.div
            key={active}
            className="earning-slip"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span>{item.label}</span>
            <CheckCircle size={27} />
            <strong>{item.amount}</strong>
            <p>{item.source}</p>
            <hr />
            <small>
              Received into your USD account
              <br />
              Paid into your USD account
            </small>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const questions = [
  [
    "What is Nostro?",
    "A US dollar account and cross-border money experience for people in Pakistan working with the world. Receive earnings, manage your balance and move money from one account.",
  ],
  [
    "Is Nostro itself a bank?",
    "Nostro provides the account experience through banking and payment partners. Review the current account agreement for the provider, account structure and applicable protections.",
  ],
  [
    "Who can apply?",
    "Eligibility depends on your location, account type and intended use. Check the current requirements before starting your application.",
  ],
  [
    "Which documents do I need?",
    "Individual and business accounts have different verification requirements. Prepare the identity and business information requested during onboarding.",
  ],
  [
    "Can I receive money from work platforms?",
    "You can use the receiving method supported by your work platform. Your account name, routing details and the platform’s payout requirements must match.",
  ],
  [
    "Do I get account and routing details?",
    "Find your USD account details under Accounts. Separate instructions are provided for ACH, domestic wire and international wire.",
  ],
  [
    "What does it cost?",
    "Review the fee shown with your quote before confirming. Your receipt keeps the transfer amount, fee and recipient total together.",
  ],
  [
    "What exchange rate will I get?",
    "The calculator shows the rate used for your quote. Review it before confirming; an expired quote must be refreshed.",
  ],
  [
    "What is the minimum transfer?",
    "The transfer form shows the minimum for your destination and checks your available balance before you continue.",
  ],
  [
    "How long does a transfer take?",
    "Timing depends on the payment method, reviews, banking hours and the receiving institution. Follow the status and timeline in your payment details.",
  ],
  [
    "Can I transfer to Pakistan?",
    "Choose Pakistan, enter the USD amount and select a bank recipient. Review the PKR amount and destination before confirming.",
  ],
  [
    "Can I send a US bank transfer?",
    "Choose United States to send USD to a US bank account. You can save recipient details for future transfers.",
  ],
  [
    "Is the Nostro Card available?",
    "Your Nostro Card is connected to your USD account. Open Cards to see your purchases, manage limits and freeze or unfreeze the card.",
  ],
  [
    "Does the card support mobile wallets?",
    "Mobile wallet support is listed in the roadmap. You can use the card controls and review online or in-person purchases from your account.",
  ],
  [
    "How do payment links work?",
    "Activate payment links, set the amount and purpose, then open the checkout. Each collection has a status and links to the payment in your account history.",
  ],
  [
    "Can I collect recurring payments?",
    "A link can record a weekly, fortnightly or monthly frequency. Automatic charging is not enabled; each collection needs a payment.",
  ],
  [
    "Can I hold other currencies?",
    "This account holds USD. Additional currencies, including GBP, are listed in the roadmap.",
  ],
  [
    "How do I get help with a payment?",
    "Open the payment receipt and choose support. The payment reference is included in the case, so you can keep the conversation and transaction together.",
  ],
  [
    "How is my money protected?",
    "Protection depends on the account structure and applicable partner terms. Read the money-protection page for the roles, conditions and source disclosures.",
  ],
];
export function FAQList({ short = false }: { short?: boolean }) {
  const [query, setQuery] = useState("");
  const list = (short ? questions.slice(0, 6) : questions).filter(([q, a]) =>
    (q + " " + a).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="faq-list">
      {!short && (
        <input
          type="search"
          aria-label="Search questions"
          placeholder="Search accounts, transfers, fees…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}
      {list.map(([q, a]) => (
        <details key={q}>
          <summary>
            {q}
            <Plus size={20} />
          </summary>
          <p>{a}</p>
        </details>
      ))}
      {!list.length && (
        <p>No questions match that search. Try “fees” or “account”.</p>
      )}
    </div>
  );
}
function Comparison() {
  return (
    <section className="comparison section-wrap">
      <Reveal className="section-heading">
        <div>
          <span className="eyebrow">Know your options</span>
          <h2>
            The right route.
            <br />
            For the right payment.
          </h2>
        </div>
        <p>
          Choose the method that fits your payer. Keep the account, cost and
          destination clear before money moves.
        </p>
      </Reveal>
      <div
        className="comparison-scroll"
        tabIndex={0}
        role="region"
        aria-label="Receiving method comparison, scroll horizontally on small screens"
      >
        <table>
          <thead>
            <tr>
              <th>What matters</th>
              <th>ACH</th>
              <th>Domestic wire</th>
              <th>Payment link</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Best suited to",
                "US platform & bank payouts",
                "US bank wire payments",
                "Client collections",
              ],
              [
                "What you share",
                "Account + ACH routing",
                "Account + wire routing",
                "A payment link",
              ],
              [
                "What to check",
                "Name and payout eligibility",
                "Bank instructions and fees",
                "Activation and collection fees",
              ],
              [
                "What you get",
                "Receiving instructions",
                "Receiving instructions",
                "Payment checkout",
              ],
            ].map((row) => (
              <tr key={row[0]}>
                {row.map((cell, i) =>
                  i === 0 ? <th key={i}>{cell}</th> : <td key={i}>{cell}</td>,
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small-text">
        Compare timing, fees and receiving requirements before choosing a
        method.{" "}
        <a
          href="https://www.nostro.pk/remittance"
          target="_blank"
          rel="noreferrer"
        >
          More about remittances <ArrowUpRight size={12} />
        </a>
      </p>
    </section>
  );
}
export function ClosingCTA() {
  return (
    <section className="closing-cta section-wrap">
      <span className="eyebrow">Your next move</span>
      <h2>
        Make room
        <br />
        for more.
      </h2>
      <div>
        <p>
          Explore a more connected way to receive, manage and move your money.
        </p>
        <ActionLink to="/bank">Open your account</ActionLink>
        <small>Your money. A clearer view.</small>
      </div>
      <span className="closing-orbit" aria-hidden="true" />
    </section>
  );
}
export function HomePage() {
  const ref = useRef<HTMLElement>(null),
    { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start start", "end start"],
    }),
    y = useTransform(scrollYProgress, [0, 1], [0, 130]),
    scale = useTransform(scrollYProgress, [0, 1], [1.03, 1.15]),
    reduced = useReducedMotion(),
    { motionEnabled, state } = useDemo(),
    [problem, setProblem] = useState(0);
  const problems = [
    [
      "Where did my payment go?",
      "Every transfer deserves a destination, a reference and a clear status.",
      "/bank/transactions",
    ],
    [
      "What am I actually paying?",
      "See the amount, example fee and recipient total together, before you confirm.",
      "/bank/send",
    ],
    [
      "Why do I have to explain this again?",
      "A support case should carry the payment context with it.",
      "/bank/support",
    ],
    [
      "Why is getting started so unclear?",
      "Separate the documents, eligibility and account details into understandable steps.",
      "/faq",
    ],
    [
      "What happens when a payment fails?",
      "Show the outcome and what happened to the funds. Keep the history.",
      "/bank/transactions?status=failed",
    ],
  ];
  return (
    <>
      <section className="hero" ref={ref}>
        <motion.img
          className="hero-landscape"
          src={assetPath("karakoram-hero.png")}
          alt="Sunlight over a mountain lake in a Karakoram-inspired landscape"
          fetchPriority="high"
          style={reduced || !motionEnabled ? {} : { y, scale }}
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <Reveal>
            <span className="eyebrow">From Pakistan. For your world.</span>
            <h1>
              Your world
              <br />
              just got bigger.
            </h1>
            <p>
              Meet the US dollar account for the way you work.
              <br className="desktop-only" /> Earn globally. Keep your
              possibilities open.
            </p>
            <div className="hero-actions">
              <ActionLink to="/bank">Explore your account</ActionLink>
              <a href="#product-story" className="hero-text-link">
                See how it works <ArrowDown size={18} />
              </a>
            </div>
          </Reveal>
        </div>
        <div className="hero-bottom">
          <span>01 / A new perspective on money</span>
          <button
            className="hero-motion"
            onClick={() =>
              document
                .getElementById("product-story")
                ?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" })
            }
          >
            Discover Nostro <ArrowDown size={18} />
          </button>
          <span>Your money. Your world.</span>
        </div>
        <motion.div
          className="hero-payment"
          initial={
            reduced || !motionEnabled ? false : { opacity: 0, y: 35, rotate: 3 }
          }
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.7, duration: 0.9 }}
        >
          <span className="payment-mark">
            <ArrowDown size={22} />
          </span>
          <div>
            <small>A little more possibility</small>
            <strong>Payment received</strong>
            <span>Client payout · USD</span>
          </div>
          <strong>
            $3,200<span>.00</span>
          </strong>
        </motion.div>
      </section>
      <section className="platform-section">
        <p>Your work can take you anywhere.</p>
        <div className="platform-window">
          <div className="platform-track">
            {[0, 1].map((n) => (
              <div key={n} aria-hidden={n === 1}>
                {["upwork", "deel", "fiverr", "remote", "amazon", "etsy"].map(
                  (name) => (
                    <img
                      src={assetPath(`${name}.webp`)}
                      alt={name}
                      key={name}
                    />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
        <small>Choose the receiving details required by your platform.</small>
      </section>
      <ProductStory />
      <section className="clarity-section section-wrap">
        <Reveal className="clarity-title">
          <span className="eyebrow">Better questions. Clearer answers.</span>
          <h2>
            Money shouldn’t
            <br />
            leave you guessing.
          </h2>
          <p>
            Good design goes beyond the balance. It helps you understand what
            happened, what comes next and what to do about it.
          </p>
        </Reveal>
        <div className="problem-story">
          <div className="problem-count">
            0{problem + 1}
            <span> / 05</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={problem}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h3>{problems[problem][0]}</h3>
              <p>{problems[problem][1]}</p>
              <ActionLink to={problems[problem][2]} variant="secondary">
                Try the improvement
              </ActionLink>
            </motion.div>
          </AnimatePresence>
          <div className="problem-controls">
            {problems.map((p, i) => (
              <button
                key={p[0]}
                aria-label={`Show improvement ${i + 1}: ${p[0]}`}
                aria-pressed={problem === i}
                onClick={() => setProblem(i)}
              />
            ))}
            <button
              className="icon-button"
              aria-label="Next improvement"
              onClick={() => setProblem((problem + 1) % 5)}
            >
              <ArrowRight size={22} />
            </button>
          </div>
        </div>
      </section>
      <Audience />
      <section className="money-story section-wrap">
        <Reveal>
          <span className="eyebrow">A clearer view of your money</span>
          <h2>
            More than
            <br />a number.
          </h2>
          <p>
            See money coming in, money going out and the payments behind it.
            Quiet periods stay quiet. Your history tells the story.
          </p>
          <ActionLink to="/bank/transactions" variant="secondary">
            Explore your activity
          </ActionLink>
        </Reveal>
        <Reveal className="marketing-chart panel">
          <CashChart state={state} />
          <ActivityList
            transfers={state.transfers
              .filter((t) => t.status === "completed")
              .slice(0, 2)}
            compact
          />
        </Reveal>
      </section>
      <Walkthrough />
      <Comparison />
      <section className="home-faq section-wrap">
        <div>
          <span className="eyebrow">A little more clarity</span>
          <h2>
            Good questions.
            <br />
            Straight answers.
          </h2>
          <ActionLink to="/faq" variant="secondary">
            All questions
          </ActionLink>
        </div>
        <FAQList short />
      </section>
      <ClosingCTA />
    </>
  );
}

const featureContent: Record<
  string,
  {
    eyebrow: string;
    title: string;
    copy: string;
    scene: number;
    steps: string[][];
  }
> = {
  receive: {
    eyebrow: "Your USD account",
    title: "Paid in dollars.\nReady for your world.",
    copy: "Bring the work you do across borders into an account you can understand. Explore USD receiving details, platform payouts and a clear payment history.",
    scene: 0,
    steps: [
      [
        "Find the right details",
        "Choose ACH, domestic wire or international wire. Each route has its own receiving instructions.",
      ],
      [
        "Share with your payer",
        "Use the correct account holder and routing details. Confirm platform and sender requirements before a real payout.",
      ],
      [
        "Follow your payment",
        "See the sender, status and reference in your history. Download a clearly itemised receipt.",
      ],
    ],
  },
  send: {
    eyebrow: "Move money with clarity",
    title: "Good things\nmake their way home.",
    copy: "See what you send, what they receive and where it is going. A complete transfer journey, from the first quote to the last detail.",
    scene: 1,
    steps: [
      [
        "Choose the amount",
        "Review the rate, fee and recipient total before choosing where the money goes.",
      ],
      [
        "Know the destination",
        "Choose a saved recipient or add bank details. Confirm the legal name and account before proceeding.",
      ],
      [
        "Keep the whole story",
        "Follow processing, completion or return. The receipt keeps the destination and payment reference together.",
      ],
    ],
  },
  "debit-card": {
    eyebrow: "The Nostro USD Card",
    title: "For the life\nafter payday.",
    copy: "A card connected to your USD balance. Spend online or in person, manage your limits and keep the details of every purchase.",
    scene: 2,
    steps: [
      [
        "Your dollars, ready to spend",
        "Pay from your USD balance and see each card purchase alongside your transfers and incoming payments.",
      ],
      [
        "Controls that stay close",
        "Freeze or unfreeze your card, manage online payments and set a daily spending limit from your account.",
      ],
      [
        "Every purchase, accounted for",
        "Review the merchant, card used and payment status. Follow a pending purchase through settlement or refund.",
      ],
    ],
  },
  "payment-links": {
    eyebrow: "Less chasing. More making.",
    title: "Good work deserves\na simpler way to pay.",
    copy: "Give each client a clear amount, a payment purpose and one place to follow the collection. Create a link and keep track of every payment.",
    scene: 3,
    steps: [
      [
        "Activate payment links",
        "Activate payment links from your account to start creating and following collections.",
      ],
      [
        "Create your link",
        "Set a title, amount, expiry and frequency. Each payment has a clear purpose and a place in your account history.",
      ],
      [
        "Follow the collection",
        "Complete your payment, review the receipt and see the money appear in the same account ledger.",
      ],
    ],
  },
  remittance: {
    eyebrow: "From you. To Pakistan.",
    title: "Closer to home.\nEvery step of the way.",
    copy: "Turn your USD earnings into a clearer transfer to Pakistan. Review your quote and follow a bank payout from beginning to end.",
    scene: 1,
    steps: [
      [
        "Start with the full amount",
        "See the USD debit, example conversion and PKR recipient amount in a single quote.",
      ],
      [
        "Choose who receives it",
        "Choose a bank recipient in Pakistan and check the account details. Additional payout methods are listed in the roadmap.",
      ],
      [
        "Stay in the picture",
        "Keep a timeline, destination details and a downloadable receipt. A returned payment remains part of the history.",
      ],
    ],
  },
};
export function FeaturePage({ kind }: { kind: string }) {
  const f = featureContent[kind],
    app =
      f.scene === 0
        ? "/bank/accounts"
        : f.scene === 1
          ? "/bank/send"
          : f.scene === 2
            ? "/bank/cards"
            : "/bank/payments";
  return (
    <>
      <section className="feature-hero section-wrap">
        <Reveal>
          <span className="eyebrow">{f.eyebrow}</span>
          <h1>{f.title}</h1>
          <p>{f.copy}</p>
          <ActionLink to={app}>Explore your account</ActionLink>
        </Reveal>
        <Reveal className="feature-preview" delay={0.15}>
          <ProductPreview scene={f.scene} />
        </Reveal>
      </section>
      <section className="feature-steps section-wrap">
        <div className="section-heading">
          <h2>
            A clear path.
            <br />
            From start to finish.
          </h2>
          <p>Useful details at each step, with a real place to go next.</p>
        </div>
        <div className="steps-grid">
          {f.steps.map(([title, copy], i) => (
            <Reveal key={title} delay={i * 0.1}>
              <span className="step-number">0{i + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </Reveal>
          ))}
        </div>
      </section>
      {kind === "receive" && (
        <section className="eligibility section-wrap">
          <div>
            <span className="eyebrow">Getting started</span>
            <h2>
              The account starts
              <br />
              with you.
            </h2>
          </div>
          <div>
            <h3>Individuals and independent work</h3>
            <p>
              Confirm your location, identity requirements, source of funds and
              intended account use before applying.
            </p>
            <h3>Business requirements</h3>
            <p>
              Business eligibility and documentation can differ from individual
              accounts. Confirm the current entity and verification requirements
              before applying.
            </p>
            <ActionLink to="/faq" variant="secondary">
              Explore account questions
            </ActionLink>
          </div>
        </section>
      )}
      {(kind === "remittance" || kind === "send") && <Comparison />}
      {kind === "payment-links" && <Walkthrough />}
      <section className="home-faq section-wrap">
        <div>
          <h2>
            Before your
            <br />
            next move.
          </h2>
          <p>Availability, pricing and protection deserve clear answers.</p>
          <ActionLink to="/faq" variant="secondary">
            Visit the help centre
          </ActionLink>
        </div>
        <FAQList short />
      </section>
      <section className="related-products section-wrap">
        <h2>There’s more to your account.</h2>
        <div>
          {products
            .filter(([, , to]) => !to.endsWith(kind))
            .slice(0, 3)
            .map(([title, copy, to]) => (
              <Link key={to} to={to}>
                <ArrowUpRight size={28} />
                <h3>{title}</h3>
                <p>{copy}</p>
              </Link>
            ))}
        </div>
      </section>
      <ClosingCTA />
    </>
  );
}

export function About() {
  return (
    <>
      <section className="about-hero section-wrap">
        <span className="eyebrow">Rooted here. Looking out.</span>
        <Reveal>
          <h1>
            Big ambition.
            <br />A place to begin.
          </h1>
        </Reveal>
        <div>
          <p>
            Nostro is about helping people in Pakistan participate in the global
            economy. The work, talent and ambition are already here. The
            financial experience should make the next step easier.
          </p>
          <p>
            Nostro brings that purpose into everyday use: clearer USD accounts,
            more understandable transfers and a product that gives people the
            details they need.
          </p>
          <a
            className="inline-link"
            href="https://www.nostro.pk/about"
            target="_blank"
            rel="noreferrer"
          >
            More about Nostro <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
      <div className="about-landscape">
        <img
          src={assetPath("karakoram-hero.png")}
          alt="Mountain lake beneath the Karakoram-inspired peaks"
        />
        <span>From Pakistan. For your world.</span>
      </div>
      <section className="team-section section-wrap">
        <div className="section-heading">
          <div>
            <span className="eyebrow">The people behind Nostro</span>
            <h2>
              Built by people.
              <br />
              For possibilities.
            </h2>
          </div>
          <p>Meet the team building a more connected financial life.</p>
        </div>
        <div className="team-grid">
          {[
            ["talha", "Talha Khan", "Co-Founder"],
            ["anas", "Anas Khan", "Co-Founder"],
            ["maaz", "Maaz Hamid", "Lead Engineer"],
            ["hamza", "Hamza Amin", "Software Engineer"],
            ["ali", "Ali Vijdaan", "Software Engineer"],
          ].map(([slug, name, role], i) => (
            <Reveal key={slug} delay={i * 0.05}>
              <img src={assetPath(`${slug}.jpg`)} alt={name} loading="lazy" />
              <h3>{name}</h3>
              <p>{role}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <ClosingCTA />
    </>
  );
}
export function FAQPage() {
  return (
    <section className="faq-page section-wrap">
      <div>
        <span className="eyebrow">Help centre</span>
        <h1>
          A little clarity.
          <br />A long way.
        </h1>
        <p>
          Find answers about your account, card, payments and the details behind
          them.
        </p>
        <ActionLink to="/bank/support" variant="secondary">
          Get support
        </ActionLink>
      </div>
      <FAQList />
    </section>
  );
}

export function Protection() {
  return (
    <>
      <section className="text-hero section-wrap">
        <ShieldCheck size={50} weight="light" />
        <span className="eyebrow">Understand your account</span>
        <h1>
          Trust starts
          <br />
          with the details.
        </h1>
        <p>
          Know who provides the account, how funds move and which protections
          apply. Those details belong in plain sight.
        </p>
      </section>
      <section className="disclosure-layout section-wrap">
        <aside>
          <a href="#roles">Who does what</a>
          <a href="#funds">How funds move</a>
          <a href="#protection">Protection & eligibility</a>
          <a href="#closure">Account closure</a>
        </aside>
        <div>
          <article id="roles">
            <h2>Who does what</h2>
            <p>
              Nostro provides the product experience. Its public disclosures
              describe banking and payment partners. USD account details name
              Citibank. The full legal entity, relationship and account
              structure require confirmation in the current agreement.
            </p>
          </article>
          <article id="funds">
            <h2>Follow the movement</h2>
            <ol>
              <li>
                Your payer starts a transfer using the correct receiving method.
              </li>
              <li>The applicable banking or payment partners process it.</li>
              <li>The account shows the payment and its status.</li>
              <li>
                An outgoing payment follows its own destination and processing
                route.
              </li>
            </ol>
            <p>
              Review the fund segregation terms in the applicable account
              agreement.
            </p>
          </article>
          <article id="protection">
            <h2>Protection has conditions</h2>
            <p>
              A named banking partner does not automatically mean every product
              or balance is insured. Coverage depends on the legal account
              structure, eligibility, records and applicable limits. Read the
              applicable coverage terms for your account.
            </p>
          </article>
          <article id="closure">
            <h2>If an account closes</h2>
            <p>
              Closure, fund return, record access and support obligations must
              follow the applicable agreement. Confirm the current process and
              contact details with Nostro.
            </p>
          </article>
          <div className="info-box">
            <ShieldCheck size={24} />
            <span>
              Read the current agreement for the account structure, partner
              responsibilities and applicable protections.
            </span>
          </div>
          <a
            href="https://www.nostro.pk/how-your-money-is-protected"
            target="_blank"
            rel="noreferrer"
            className="button secondary"
          >
            Read protection disclosures <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
    </>
  );
}
export function Roadmap() {
  const [request, setRequest] = useState(""),
    { notify } = useDemo();
  return (
    <>
      <section className="text-hero section-wrap">
        <span className="eyebrow">What comes next</span>
        <h1>
          A clearer view
          <br />
          of what’s ahead.
        </h1>
        <p>See what you can use today and what is being explored next.</p>
      </section>
      <section className="roadmap-grid section-wrap">
        {[
          [
            "Available in your account",
            "USD receiving details",
            "Nostro Card and spending controls",
            "Pakistan & US transfers",
            "Activity and support",
          ],
          [
            "Next steps",
            "Payment links · activation required",
            "Additional payout methods",
            "Card wallet support · unconfirmed",
          ],
          [
            "Planned / owner review",
            "Additional currencies including GBP",
            "Reconciled fees and minimums",
            "Unified terms and eligibility",
          ],
        ].map(([title, ...items]) => (
          <div className="panel" key={title}>
            <h2>{title}</h2>
            {items.map((item) => (
              <p key={item}>
                <span className="roadmap-dot" />
                {item}
              </p>
            ))}
          </div>
        ))}
      </section>
      <section className="roadmap-request section-wrap">
        <div>
          <h2>
            What would make
            <br />
            your day easier?
          </h2>
          <p>Save an idea for how your account could work better.</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            localStorage.setItem("nostro-feature-idea", request);
            notify("Feature idea saved locally. Nothing was sent to Nostro.");
            setRequest("");
          }}
        >
          <label className="field">
            <span>Your feature idea</span>
            <textarea
              required
              minLength={10}
              maxLength={1500}
              rows={4}
              value={request}
              onChange={(e) => setRequest(e.target.value)}
            />
          </label>
          <Button type="submit">
            Save idea <ArrowRight size={18} />
          </Button>
        </form>
      </section>
    </>
  );
}
const termsSections = [
  "About these services",
  "Eligibility and account use",
  "Verification and information",
  "Receiving money",
  "Sending money",
  "Fees and exchange rates",
  "Payment restrictions",
  "Payment links",
  "Cards and planned features",
  "Records and certificates",
  "Account closure",
  "Support and complaints",
  "Applicable agreement",
];
const privacySections = [
  "About this workspace",
  "Account information",
  "Local storage and preferences",
  "Files and attachments",
  "Third-party sources",
  "Retention and deletion",
  "Privacy policy",
];
export function LegalPage({ privacy = false }: { privacy?: boolean }) {
  const sections = privacy ? privacySections : termsSections,
    title = privacy ? "Privacy, clearly." : "The terms matter.",
    source = privacy ? "privacy-policy" : "terms-of-service";
  return (
    <section className="legal-page section-wrap">
      <header>
        <span className="eyebrow">Legal information · 12 September 2026</span>
        <h1>{title}</h1>
        <p>
          Find the key account conditions below. For the governing details, read
          the applicable Nostro agreement and privacy policy.
        </p>
        <a
          href={`https://www.nostro.pk/${source}`}
          target="_blank"
          rel="noreferrer"
          className="button secondary"
        >
          Read the full {privacy ? "privacy policy" : "terms"}{" "}
          <ArrowUpRight size={18} />
        </a>
      </header>
      <div className="disclosure-layout">
        <aside>
          {sections.map((s, i) => (
            <a key={s} href={`#section-${i + 1}`}>
              {String(i + 1).padStart(2, "0")} {s}
            </a>
          ))}
        </aside>
        <div>
          {sections.map((s, i) => (
            <article id={`section-${i + 1}`} key={s}>
              <small>SECTION {String(i + 1).padStart(2, "0")}</small>
              <h2>{s}</h2>
              <p>
                {privacy
                  ? [
                      "This workspace provides an account experience using browser storage.",
                      "Profile details, recipients and payment records are held in this workspace.",
                      "Your theme, motion preferences, account activity, profile edits and cases are stored in this browser.",
                      "PDF and CSV exports are generated locally. Support attachments keep only a filename; no image is uploaded.",
                      "External links may take you to websites with their own privacy policies.",
                      "Use Settings → Reset workspace to restore the starting account. Clear the site’s browser data to remove saved preferences and records.",
                      "Read Nostro’s current privacy policy for details about collection, service providers and retention practices.",
                    ][i]
                  : [
                      "USD accounts and cross-border payments are subject to provider terms. Read the current agreement for provider roles and the governing entity.",
                      "Location, age, intended use and account type may affect eligibility. Read the current account requirements before applying.",
                      "Opening an account requires applicable identity and business checks. Review the requested information during the application process.",
                      "Choose the receiving method and details required by your payer. Confirm sender eligibility, naming requirements, fees and timing before using real instructions.",
                      "Review the destination, amount, currency and applicable transfer conditions before confirming a payment.",
                      "Fees and rates are shown with the quote. Review the full amount and recipient total before confirming.",
                      "Prohibited activities, supported countries and transaction restrictions must follow the current agreement. No compliance determination is made here.",
                      "Payment links require activation. Recurring settings record a frequency; automatic charging is not enabled.",
                      "Your card is linked to your USD account. Review applicable card terms, limits and transaction restrictions before use.",
                      "Receipts and statements provide a record of account activity. Confirm eligibility and availability for official certificates such as PRCs.",
                      "Closure, suspension, record retention and fund return conditions follow the applicable account agreement.",
                      "Support cases here stay in this browser. Use Nostro’s actual support channels for a real account issue or complaint.",
                      "Read the current governing terms for your account and contact support if you need clarification.",
                    ][i]}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
export function NotFound() {
  return (
    <section className="text-hero section-wrap">
      <span className="eyebrow">404 / A wrong turn</span>
      <h1>
        Let’s find
        <br />
        your way back.
      </h1>
      <p>This page could not be found.</p>
      <ActionLink to="/">Return to Nostro</ActionLink>
    </section>
  );
}
