import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import "@fontsource-variable/geist";
import "./styles.css";
import { DemoProvider } from "./lib/store";
import { BankShell } from "./components/BankShell";
import { CardAccount } from "./pages/CardAccount";
import { ExportDialog } from "./components/ui";
import {
  BankHome,
  Transactions,
  TransferDetail,
  Accounts,
} from "./pages/Banking";
import { SendMoney, Exchange } from "./pages/Send";
import { PaymentLinks, PaymentLinkDetail, Checkout } from "./pages/Payments";
import { Settings, Support, SupportDetail } from "./pages/SettingsSupport";
import {
  MarketingShell,
  HomePage,
  FeaturePage,
  About,
  FAQPage,
  Protection,
  Roadmap,
  LegalPage,
  NotFound,
} from "./pages/Marketing";
function Titles() {
  const location = useLocation();
  React.useEffect(() => {
    const name =
      location.pathname.split("/").filter(Boolean).at(-1) ||
      "Your world, bigger";
    document.title = `${name.replaceAll("-", " ")} — Nostro`;
  }, [location.pathname]);
  React.useEffect(() => {
    const jump = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest?.('a[href^="#"]');
      const href = anchor?.getAttribute("href");
      if (!href || href.startsWith("#/")) return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "instant", block: "start" });
      if (anchor?.classList.contains("skip-link")) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    };
    document.addEventListener("click", jump);
    return () => document.removeEventListener("click", jump);
  }, []);
  return null;
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <DemoProvider>
        <Titles />
        <ExportDialog />
        <Routes>
          <Route element={<MarketingShell />}>
            <Route index element={<HomePage />} />
            <Route path="feature/:kind" element={<NotFound />} />
            {["receive", "send", "debit-card"].map((kind) => (
              <Route
                path={`feature/${kind}`}
                key={kind}
                element={<FeaturePage kind={kind} />}
              />
            ))}
            {["payment-links", "remittance"].map((kind) => (
              <Route
                path={kind}
                key={kind}
                element={<FeaturePage kind={kind} />}
              />
            ))}
            <Route path="about" element={<About />} />
            <Route path="faq" element={<FAQPage />} />
            <Route
              path="how-your-money-is-protected"
              element={<Protection />}
            />
            <Route path="roadmap" element={<Roadmap />} />
            <Route path="privacy-policy" element={<LegalPage privacy />} />
            <Route path="terms-of-service" element={<LegalPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="bank" element={<BankShell />}>
            <Route index element={<BankHome />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="transactions/:id" element={<TransferDetail />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="send" element={<SendMoney />} />
            <Route path="exchange" element={<Exchange />} />
            <Route path="payments" element={<PaymentLinks />} />
            <Route path="payments/:id" element={<PaymentLinkDetail />} />
            <Route path="cards" element={<CardAccount />} />
            <Route path="settings" element={<Settings />} />
            <Route path="support" element={<Support />} />
            <Route path="support/:id" element={<SupportDetail />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="checkout/:id" element={<Checkout />} />
        </Routes>
      </DemoProvider>
    </HashRouter>
  </React.StrictMode>,
);
