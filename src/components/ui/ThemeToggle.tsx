"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * ThemeToggle — editorial-style theme switcher.
 *
 * Two visual variants:
 * - `chip`: a horizontal pill with sun / moon glyphs (used in the
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
          "inline-flex items-center gap-0 h-9 rounded-full border border-rule bg-surface-2/40",
          className
        )}
        style={{ width: variant === "chip" ? 108 : undefined }}
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
          "group relative inline-flex items-center h-9 rounded-full border border-rule bg-surface-2/50 hover:border-rule-strong transition-colors overflow-hidden",
          className
        )}
      >
        {/* the sliding thumb */}
        <span
          className={cn(
            "absolute top-[3px] bottom-[3px] rounded-full bg-bone shadow-[0_1px_3px_rgb(0_0_0/0.25)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            "w-[calc(50%-4px)]"
          )}
          style={{
            left: 4,
            transform: isDark ? "translateX(0)" : "translateX(calc(100% + 2px))",
          }}
        />
        <span
          className={cn(
            "relative z-10 inline-flex items-center justify-center w-[52px] h-full transition-colors duration-200",
            isDark ? "text-ink" : "text-smoke"
          )}
        >
          <MoonIcon className={cn("transition-transform duration-500", isDark ? "rotate-0" : "-rotate-90")} />
        </span>
        <span
          className={cn(
            "relative z-10 inline-flex items-center justify-center w-[52px] h-full transition-colors duration-200",
            !isDark ? "text-ink" : "text-smoke"
          )}
        >
          <SunIcon className={cn("transition-transform duration-500", !isDark ? "rotate-0" : "rotate-90")} />
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
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
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

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
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
