"use client";

import type { SimulationWarning, WarningSeverity } from "@/types";
import { cn } from "@/lib/utils";

const SEVERITY_STYLES: Record<WarningSeverity, { wrapper: string; icon: string }> = {
  info: {
    wrapper: "bg-sky-50 border-sky-200 text-sky-800",
    icon: "text-sky-500",
  },
  warning: {
    wrapper: "bg-amber-50 border-amber-200 text-amber-800",
    icon: "text-amber-500",
  },
  critical: {
    wrapper: "bg-red-50 border-red-200 text-red-800",
    icon: "text-red-500",
  },
};

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("w-3.5 h-3.5 flex-shrink-0", className)} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("w-3.5 h-3.5 flex-shrink-0", className)} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CriticalIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("w-3.5 h-3.5 flex-shrink-0", className)} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const SEVERITY_ICONS: Record<WarningSeverity, React.FC<{ className?: string }>> = {
  info: InfoIcon,
  warning: WarningIcon,
  critical: CriticalIcon,
};

interface WarningBadgeProps {
  warning: SimulationWarning;
  className?: string;
}

export function WarningBadge({ warning, className }: WarningBadgeProps) {
  const styles = SEVERITY_STYLES[warning.severity];
  const Icon = SEVERITY_ICONS[warning.severity];

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border px-2.5 py-2 text-xs leading-snug",
        styles.wrapper,
        className
      )}
      role="alert"
      aria-live={warning.severity === "critical" ? "assertive" : "polite"}
    >
      <Icon className={styles.icon} />
      <span className="flex-1">{warning.message}</span>
    </div>
  );
}

/** Inline chip variant — smaller, single-line. */
export function WarningChip({ warning, className }: WarningBadgeProps) {
  const styles = SEVERITY_STYLES[warning.severity];
  const Icon = SEVERITY_ICONS[warning.severity];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
        styles.wrapper,
        className
      )}
    >
      <Icon className={styles.icon} />
      <span className="truncate max-w-[180px]">{warning.message}</span>
    </span>
  );
}
