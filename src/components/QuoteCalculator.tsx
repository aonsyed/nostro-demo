import { assetPath } from "../lib/paths";
import { useMemo, useState } from "react";
import NumberFlow from "@number-flow/react";
import {
  ArrowDown,
  ArrowUpRight,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { getBalances, parseAmount, quoteTransfer, rules } from "../lib/banking";
import { useDemo } from "../lib/store";

export function QuoteCalculator({
  publicMode = false,
  initialAmount = "500",
}: {
  publicMode?: boolean;
  initialAmount?: string;
}) {
  const { state, motionEnabled } = useDemo(),
    [amount, setAmount] = useState(initialAmount),
    [refresh, setRefresh] = useState(0);
  const { quote, error } = useMemo(() => {
    try {
      return {
        quote: quoteTransfer(
          "PK",
          parseAmount(amount),
          publicMode ? 100000000 : getBalances(state).available,
        ),
        error: "",
      };
    } catch (e) {
      return { quote: null, error: (e as Error).message };
    }
  }, [amount, state, publicMode, refresh]);
  return (
    <div className="quote-calculator">
      <div className="panel-heading">
        <h3>Send money home</h3>
        <button
          aria-label="Refresh quote"
          className="icon-button"
          onClick={() => setRefresh((n) => n + 1)}
        >
          <ArrowsClockwise size={19} />
        </button>
      </div>
      <label className="quote-input">
        <span>You send</span>
        <div>
          <input
            aria-label="Amount in US dollars"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <span>
            <img src={assetPath("us.webp")} alt="" />
            USD
          </span>
        </div>
      </label>
      <div className="quote-rate">
        <span>
          <ArrowDown size={14} />
        </span>
        1 USD = {rules.ratePKR.toFixed(2)} PKR
      </div>
      <div className="quote-output">
        <span>They receive</span>
        <div aria-live="polite">
          <NumberFlow
            value={(quote?.recipientMinor || 0) / 100}
            format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            animated={motionEnabled}
          />
          <span>
            <img src={assetPath("pk.webp")} alt="" />
            PKR
          </span>
        </div>
      </div>
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
      <div className="quote-fee">
        <span>Transfer fee</span>
        <strong>$0.00</strong>
      </div>
      {quote ? (
        <Link
          className="button primary full"
          to={`/bank/send?amount=${encodeURIComponent(amount)}&country=PK`}
        >
          Try this transfer <ArrowUpRight size={18} />
        </Link>
      ) : (
        <button className="button primary full" disabled>
          Enter a valid amount
        </button>
      )}
      <p className="demo-note">
        Review your rate before confirming.{" "}
        {refresh > 0 ? "Quote refreshed." : ""}
      </p>
    </div>
  );
}
