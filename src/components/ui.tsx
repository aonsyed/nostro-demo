import { assetPath } from "../lib/paths";
import {
  useState,
  useEffect,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
import { Link } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  Check,
  CheckCircle,
  Copy,
  Moon,
  Sun,
  X,
  CircleNotch,
  ArrowRight,
  WarningCircle,
  Clock,
} from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useDemo } from "../lib/store";
import type { TransferStatus } from "../lib/banking";

export function ExportDialog() {
  const [file, setFile] = useState<{
    url: string;
    filename: string;
    size: number;
  } | null>(null);
  useEffect(() => {
    const onExport = (e: Event) => {
      setFile(
        (e as CustomEvent<{ url: string; filename: string; size: number }>)
          .detail,
      );
    };
    window.addEventListener("nostro-local-export", onExport);
    return () => window.removeEventListener("nostro-local-export", onExport);
  }, []);
  useEffect(
    () => () => {
      if (file?.url.startsWith("blob:")) URL.revokeObjectURL(file.url);
    },
    [file],
  );
  return (
    <Modal
      open={!!file}
      onOpenChange={(open) => {
        if (!open) setFile(null);
      }}
      title="Your export is ready"
      description="Generated from your account records."
    >
      {file && (
        <>
          <p className="export-filename">{file.filename}</p>
          <p className="small-text">
            {Math.ceil(file.size / 1024)} KB ·{" "}
            {file.filename.endsWith(".pdf")
              ? "PDF document"
              : "CSV spreadsheet"}
          </p>
          <a
            className="button primary full"
            href={file.url}
            download={file.url.startsWith("blob:") ? file.filename : undefined}
            target="_blank"
            rel="noreferrer"
          >
            Download {file.filename.endsWith(".pdf") ? "PDF" : "CSV"}{" "}
            <ArrowUpRight size={18} />
          </a>
        </>
      )}
    </Modal>
  );
}

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="brand" aria-label="Nostro home">
      <img
        src={assetPath("nostro-logo.webp")}
        alt="Nostro"
        width="142"
        height="38"
      />
    </Link>
  );
}
export function Button({
  children,
  variant = "primary",
  busy = false,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  busy?: boolean;
}) {
  return (
    <button
      className={`button ${variant} ${className}`}
      {...props}
      disabled={props.disabled || busy}
    >
      {busy ? <CircleNotch className="spin" size={18} /> : null}
      {children}
    </button>
  );
}
export function ActionLink({
  to,
  children,
  variant = "primary",
  className = "",
  arrow = true,
}: {
  to: string;
  children: ReactNode;
  variant?: string;
  className?: string;
  arrow?: boolean;
}) {
  return (
    <Link to={to} className={`button ${variant} ${className}`}>
      {children}
      {arrow && <ArrowUpRight size={18} />}
    </Link>
  );
}
export function ThemeToggle() {
  const { theme, setTheme } = useDemo();
  return (
    <button
      className="icon-button theme-toggle"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? <Moon size={21} /> : <Sun size={21} />}
    </button>
  );
}
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className={`modal ${wide ? "wide" : ""}`}
          aria-describedby={description ? "modal-description" : undefined}
        >
          <header className="modal-heading">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              {description && (
                <Dialog.Description id="modal-description">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close className="icon-button" aria-label="Close dialog">
              <X size={22} />
            </Dialog.Close>
          </header>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function CopyButton({
  value,
  label = "Copy",
  compact = false,
}: {
  value: string;
  label?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const { notify } = useDemo();
  return (
    <button
      className={compact ? "icon-button copy-button" : "button secondary small"}
      aria-label={label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          notify("Copied to your clipboard.");
          setTimeout(() => setCopied(false), 2000);
        } catch {
          notify(
            "Copy is unavailable. You can select and copy the displayed details.",
          );
        }
      }}
    >
      {copied ? <Check size={17} /> : <Copy size={17} />}{" "}
      {!compact && (copied ? "Copied" : label)}
    </button>
  );
}
export function Status({
  status,
  label,
}: {
  status: TransferStatus | string;
  label?: string;
}) {
  const icon =
    status === "completed" || status === "paid" ? (
      <CheckCircle size={14} />
    ) : status === "failed" || status === "returned" ? (
      <WarningCircle size={14} />
    ) : (
      <Clock size={14} />
    );
  return (
    <span className={`status status-${status.toLowerCase()}`}>
      {icon}
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-symbol">
        <ArrowRight size={25} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const { motionEnabled } = useDemo();
  return (
    <motion.div
      className={className}
      initial={reduced || !motionEnabled ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.65, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
export function DetailRows({
  rows,
}: {
  rows: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="detail-rows">
      {rows.map((r) => (
        <div key={r.label}>
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
export function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="heading-actions">{children}</div>}
    </header>
  );
}
export function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
      {error && <small className="error-text">{error}</small>}
    </label>
  );
}
