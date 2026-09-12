import { Link, useLocation } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, CaretRight } from "@phosphor-icons/react";
import { dateLabel, initials, money, type Transfer } from "../lib/banking";
import { Status } from "./ui";

export function ActivityList({
  transfers,
  compact = false,
}: {
  transfers: Transfer[];
  compact?: boolean;
}) {
  const location = useLocation();
  return (
    <div className={`activity-list ${compact ? "compact" : ""}`}>
      {!compact && (
        <div className="activity-labels" aria-hidden="true">
          <span>Counterparty</span>
          <span>Status / Date</span>
          <span>Amount</span>
          <span />
        </div>
      )}
      {transfers.map((t) => (
        <Link
          className="activity-row"
          key={t.id}
          to={`/bank/transactions/${t.id}`}
          state={{ from: location.pathname + location.search }}
        >
          <span className={`avatar ${t.direction === "in" ? "incoming" : ""}`}>
            {initials(t.counterparty.name)}
          </span>
          <div className="activity-party">
            <strong>{t.counterparty.name}</strong>
            <p>
              {t.card
                ? t.card.category
                : `${t.direction === "in" ? "From" : "To"} ${t.counterparty.bank}`}{" "}
              <span className="account-suffix">
                {t.card
                  ? `•••• ${t.card.last4}`
                  : t.counterparty.account.slice(-4)}
              </span>
            </p>
          </div>
          <div className="activity-status">
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
            <time dateTime={t.createdAt}>{dateLabel(t.createdAt)}</time>
          </div>
          <div className="activity-money">
            <strong>
              {t.direction === "in" ? "+" : "−"}
              {money(t.direction === "in" ? t.amountMinor : t.debitMinor)}
            </strong>
            <small>
              {t.recipientCurrency === "PKR"
                ? money(t.recipientMinor, "PKR")
                : t.rail}
            </small>
          </div>
          <CaretRight className="row-arrow" size={16} />
        </Link>
      ))}
    </div>
  );
}
