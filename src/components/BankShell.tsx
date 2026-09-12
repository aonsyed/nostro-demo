import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ArrowsLeftRight,
  CreditCard,
  Bank,
  Bell,
  CaretDown,
  GearSix,
  House,
  MagnifyingGlass,
  Receipt,
  Question,
  ArrowUpRight,
  CheckCircle,
} from "@phosphor-icons/react";
import { useDemo } from "../lib/store";
import { dateLabel, initials, money } from "../lib/banking";
import { Logo, Modal, ThemeToggle, Status } from "./ui";

const nav = [
  { to: "/bank", label: "Home", icon: House },
  { to: "/bank/transactions", label: "Transactions", icon: Receipt },
  { to: "/bank/cards", label: "Cards", icon: CreditCard },
  { to: "/bank/accounts", label: "Accounts", icon: Bank },
  { to: "/bank/settings", label: "Settings", icon: GearSix },
];
export function BankShell() {
  const { state, toast } = useDemo(),
    [searchOpen, setSearchOpen] = useState(false),
    [query, setQuery] = useState(""),
    [notifications, setNotifications] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setSearchOpen(false);
    setNotifications(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((x) => !x);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const matches = state.transfers
    .filter((t) =>
      `${t.counterparty.name} ${t.counterparty.bank} ${t.purpose} ${t.id}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .slice(0, 6);
  return (
    <div className="bank-shell">
      <a className="skip-link" href="#bank-content">
        Skip to account content
      </a>
      <header className="bank-header">
        <Logo />
        <nav className="bank-nav" aria-label="Banking navigation">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/bank"}
              className={({ isActive }) =>
                `${isActive ? "active " : ""}${label === "Home" ? "home-nav" : ""}`
              }
            >
              <Icon size={21} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="bank-utilities">
          <button
            className="icon-button search-shortcut"
            aria-label="Search your account"
            onClick={() => setSearchOpen(true)}
          >
            <MagnifyingGlass size={21} />
          </button>
          <ThemeToggle />
          <button
            className="icon-button notification-button"
            aria-label="Notifications"
            onClick={() => setNotifications(true)}
          >
            <Bell size={21} />
            <i />
          </button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              className="profile-button"
              aria-label="Account menu"
            >
              <span>{initials(state.profile.name)}</span>
              <CaretDown size={12} />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="dropdown-content"
                sideOffset={12}
                align="end"
              >
                <div className="dropdown-profile">
                  <strong>{state.profile.name}</strong>
                  <small>Personal USD account</small>
                </div>
                <DropdownMenu.Item asChild>
                  <Link to="/bank/settings">
                    Profile & settings <GearSix size={17} />
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link to="/bank/support">
                    Help & support <Question size={17} />
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item asChild>
                  <Link to="/bank/exchange">
                    Exchange rates <ArrowsLeftRight size={17} />
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link to="/bank/cards">
                    Your Nostro Card <ArrowUpRight size={17} />
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link to="/bank/payments">
                    Payment links <ArrowUpRight size={17} />
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link to="/">
                    Nostro website <ArrowUpRight size={17} />
                  </Link>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>
      <div className="demo-strip">
        <span>
          Personal workspace <span className="subtle">/</span>{" "}
          {state.profile.company}
        </span>
        <span className="demo-indicator">Personal USD account</span>
      </div>
      <main id="bank-content" className="bank-main">
        <Outlet />
      </main>
      <footer className="bank-footer">
        <span>All amounts and account details are fictional.</span>
        <Link to="/bank/support">
          Need a hand? <ArrowUpRight size={14} />
        </Link>
      </footer>
      <Modal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title="Find something"
        description="Search payments, people and bank references."
      >
        <div className="search-field">
          <MagnifyingGlass size={20} />
          <input
            autoFocus
            aria-label="Search account records"
            placeholder="Name, bank or payment reference"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="search-results">
          {matches.length ? (
            matches.map((t) => (
              <Link key={t.id} to={`/bank/transactions/${t.id}`}>
                <span>
                  <strong>{t.counterparty.name}</strong>
                  <small>{t.purpose}</small>
                </span>
                <span>{money(t.amountMinor)}</span>
              </Link>
            ))
          ) : (
            <p>No payments match that search.</p>
          )}
        </div>
        <div className="quick-links">
          <Link to="/bank/accounts">Account details</Link>
          <Link to="/bank/payments">Payment links</Link>
          <Link to="/bank/support">Get support</Link>
        </div>
      </Modal>
      <Modal
        open={notifications}
        onOpenChange={setNotifications}
        title="Updates"
        description="Activity from your account."
      >
        <div className="notifications">
          {state.transfers
            .slice()
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, 5)
            .map((t) => (
              <Link to={`/bank/transactions/${t.id}`} key={t.id}>
                <CheckCircle size={22} />
                <div>
                  <strong>{t.counterparty.name}</strong>
                  <p>
                    {money(t.amountMinor)} <Status status={t.status} />
                  </p>
                  <small>{dateLabel(t.createdAt, true)}</small>
                </div>
              </Link>
            ))}
        </div>
      </Modal>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle size={20} />
          {toast}
        </div>
      )}
    </div>
  );
}
