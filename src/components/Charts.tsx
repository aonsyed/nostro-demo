import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useDemo } from "../lib/store";
import {
  calendarDate,
  ledgerEntries,
  money,
  type DemoState,
} from "../lib/banking";

export function CashChart({
  state,
  compact = false,
}: {
  state: DemoState;
  compact?: boolean;
}) {
  const [days, setDays] = useState(14),
    [mode, setMode] = useState("Cash flow"),
    [selected, setSelected] = useState<number | null>(null);
  const reduced = useReducedMotion(),
    { motionEnabled } = useDemo();
  const buckets = useMemo(() => {
    const entries = ledgerEntries(state),
      end =
        new Date(`${calendarDate(state.asOf)}T00:00:00+05:00`).getTime() +
        86400000,
      start = end - days * 86400000,
      step = (days / 14) * 86400000;
    return Array.from({ length: 14 }, (_, i) => {
      const from = start + i * step,
        to = start + (i + 1) * step,
        events = entries.filter(
          (e) =>
            new Date(e.at).getTime() >= from && new Date(e.at).getTime() < to,
        );
      return {
        label: new Intl.DateTimeFormat("en-GB", {
          day: "numeric",
          month: "short",
          timeZone: "Asia/Karachi",
        }).format(new Date(to - 1)),
        incoming: events
          .filter((e) => e.amountMinor > 0)
          .reduce((n, e) => n + e.amountMinor, 0),
        outgoing: Math.abs(
          events
            .filter((e) => e.amountMinor < 0)
            .reduce((n, e) => n + e.amountMinor, 0),
        ),
        balance:
          state.openingMinor +
          entries
            .filter((e) => new Date(e.at).getTime() < to)
            .reduce((n, e) => n + e.amountMinor, 0),
      };
    });
  }, [state, days]);
  const max = Math.max(...buckets.flatMap((b) => [b.incoming, b.outgoing]), 1);
  const active = selected === null ? null : buckets[selected];
  const minBalance = Math.min(...buckets.map((b) => b.balance)),
    maxBalance = Math.max(...buckets.map((b) => b.balance)),
    range = Math.max(maxBalance - minBalance, 100);
  const points = buckets
    .map(
      (b, i) =>
        `${(i * 100) / 13},${90 - ((b.balance - minBalance) / range) * 75}`,
    )
    .join(" ");
  const hasActivity = buckets.some((b) => b.incoming || b.outgoing);
  return (
    <div className={`cash-chart ${compact ? "compact" : ""}`}>
      <div className="chart-toolbar">
        <div className="text-tabs">
          {["Cash flow", "Balance"].map((tab) => (
            <button
              key={tab}
              className={mode === tab ? "selected" : ""}
              onClick={() => {
                setMode(tab);
                setSelected(null);
              }}
              aria-pressed={mode === tab}
            >
              {tab}
            </button>
          ))}
        </div>
        {!compact && (
          <select
            aria-label="Chart period"
            value={days}
            onChange={(e) => {
              setDays(Number(e.target.value));
              setSelected(null);
            }}
          >
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        )}
      </div>
      <div className="chart-meta">
        <span>{active ? active.label : "Your money, at a glance"}</span>
        <span>
          {active ? (
            mode === "Balance" ? (
              money(active.balance)
            ) : (
              `${money(active.incoming)} in / ${money(active.outgoing)} out`
            )
          ) : (
            <>
              <i className="legend-in" />
              Money in <i className="legend-out" />
              Money out
            </>
          )}
        </span>
      </div>
      {!hasActivity ? (
        <div className="quiet-chart">
          <p>No activity in this period</p>
          <small>
            Your balance is unchanged. New payments will appear here.
          </small>
        </div>
      ) : (
        <div
          className={`chart-plot ${mode === "Balance" ? "balance-mode" : ""}`}
        >
          <div className="chart-guides" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          {mode === "Balance" && (
            <svg
              className="balance-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <motion.polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth=".6"
                initial={reduced || !motionEnabled ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9 }}
              />
            </svg>
          )}
          <div className="chart-bars">
            {buckets.map((bucket, i) => (
              <button
                key={i}
                className={selected === i ? "selected" : ""}
                aria-label={`${bucket.label}: ${money(bucket.incoming)} in, ${money(bucket.outgoing)} out, balance ${money(bucket.balance)}`}
                onMouseEnter={() => setSelected(i)}
                onFocus={() => setSelected(i)}
                onClick={() => setSelected(selected === i ? null : i)}
              >
                <motion.span
                  className="bar-in"
                  initial={false}
                  animate={{
                    height:
                      mode === "Balance"
                        ? "100%"
                        : `${Math.max(bucket.incoming ? 3 : 0, (bucket.incoming / max) * 100)}%`,
                  }}
                  transition={{ duration: reduced || !motionEnabled ? 0 : 0.5 }}
                />
                <motion.span
                  className="bar-out"
                  initial={false}
                  animate={{
                    height:
                      mode === "Balance"
                        ? "0%"
                        : `${Math.max(bucket.outgoing ? 3 : 0, (bucket.outgoing / max) * 100)}%`,
                  }}
                  transition={{ duration: reduced || !motionEnabled ? 0 : 0.5 }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="chart-axis">
        <span>{buckets[0].label}</span>
        <span>{buckets[6].label}</span>
        <span>{buckets[13].label}</span>
      </div>
      {!compact && (
        <p className="chart-caption">
          Posted activity in USD. Dates use Pakistan time. As of{" "}
          {calendarDate(state.asOf)}.
        </p>
      )}
    </div>
  );
}
