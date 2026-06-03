"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * ThemeToggle — editorial-style theme switcher.
 *
 * Two visual variants:
 * - `chip`: a horizontal pill with "DARK / LIGHT" mono labels (used in the
 *   landing masthead).
 * - `icon`: a single 36x36 button with a sun/moon glyph (used in the app
 *   sidebar where space is tight).
 */
export function ThemeToggle({
  variant = "icon",
  className,
}: {
  variant?: "icon" | "chip";
  className?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // render skeleton on the server / before hydration to avoid theme flicker
  if (!mounted) {
    return variant === "chip" ? (
      <span
        aria-hidden
        className={cn(
          "inline-flex items-center gap-0 h-8 rounded-sm border border-rule bg-surface-2/40",
          className
        )}
        style={{ width: variant === "chip" ? 92 : undefined }}
      />
    ) : (
      <span
        aria-hidden
        className={cn(
          "inline-flex items-center justify-center size-9 rounded-sm border border-rule bg-surface-2/40",
          className
        )}
      />
    );
  }

  const isDark = resolvedTheme === "dark";
  const next = isDark ? "light" : "dark";

  if (variant === "chip") {
    return (
      <button
        type="button"
        aria-label={`Switch to ${next} theme`}
        title={`Switch to ${next} theme`}
        onClick={() => setTheme(next)}
        className={cn(
          "group relative inline-flex items-center h-8 rounded-sm border border-rule bg-surface-2/60 hover:border-rule-strong transition-colors overflow-hidden",
          className
        )}
      >
        {/* the moving thumb */}
        <span
          className={cn(
            "absolute top-0.5 bottom-0.5 left-0.5 rounded-[2px] bg-ember transition-transform duration-300 ease-out",
            "w-[44px]"
          )}
          style={{
            transform: isDark ? "translateX(0)" : "translateX(44px)",
          }}
        />
        <span
          className={cn(
            "relative z-10 inline-flex items-center justify-center w-[44px] h-full font-mono text-[10px] tracking-[0.16em] uppercase transition-colors",
            isDark ? "text-ink" : "text-smoke"
          )}
        >
          <Moon /> Dark
        </span>
        <span
          className={cn(
            "relative z-10 inline-flex items-center justify-center w-[44px] h-full font-mono text-[10px] tracking-[0.16em] uppercase transition-colors",
            !isDark ? "text-ink" : "text-smoke"
          )}
        >
          <Sun /> Lite
        </span>
      </button>
    );
  }

  // icon variant
  return (
    <button
      type="button"
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      onClick={() => setTheme(next)}
      className={cn(
        "group inline-flex items-center justify-center size-9 rounded-sm border border-rule bg-surface-2/40 hover:border-ember hover:bg-surface-2 transition-colors text-smoke hover:text-ember cursor-pointer",
        className
      )}
    >
      {isDark ? <Sun /> : <Moon />}
    </button>
  );
}

function Sun() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mr-1 last:mr-0"
    >
      <circle cx="7" cy="7" r="2.6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M7 1.5v1.6M7 10.9v1.6M1.5 7h1.6M10.9 7h1.6M2.6 2.6l1.1 1.1M10.3 10.3l1.1 1.1M2.6 11.4l1.1-1.1M10.3 3.7l1.1-1.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
      />
    </svg>
  );
}

function Moon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mr-1 last:mr-0"
    >
      <path
        d="M11.5 8.4A4.6 4.6 0 1 1 5.6 2.5a4 4 0 0 0 5.9 5.9z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
