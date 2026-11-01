"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   ui — the small shared set: live dot, framed panel, glyphs,
   theme switch, the countdown hook. Labels are the body face;
   the mono is for readouts only.
   ───────────────────────────────────────────────────────────── */

/* a live state only — streaming, running, online. static: no pulse loops */
export function LiveDot({ tone = "live" }: { tone?: "live" | "accent" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block size-1.5 rounded-full shrink-0",
        tone === "live" ? "bg-live" : "bg-accent"
      )}
    />
  );
}

/* framed surface: a header strip and a body, one hairline each */
export function Panel({
  label,
  live,
  status,
  right,
  className,
  bodyClassName,
  children,
}: {
  label: React.ReactNode;
  live?: boolean;
  status?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-paper-2 border border-rule rounded-card overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-rule">
        <span className="label flex items-center gap-2 min-w-0 text-ink-2">
          {live && <LiveDot />}
          <span className="truncate">{label}</span>
        </span>
        {right ??
          (status != null && (
            <span className="readout shrink-0">{status}</span>
          ))}
      </div>
      {children != null && <div className={bodyClassName}>{children}</div>}
    </div>
  );
}

export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={cn("bg-paper-3 animate-pulse", className)} style={style} />;
}

/* ── glyphs (one hand-rolled set, 1.5px strokes) ───────────── */
type GlyphProps = { size?: number; className?: string };

const glyph = (path: React.ReactNode, viewBox = "0 0 12 10") =>
  function Glyph({ size = 12, className }: GlyphProps) {
    const [, , vw, vh] = viewBox.split(" ").map(Number);
    return (
      <svg
        width={size}
        height={(size * vh) / vw}
        viewBox={viewBox}
        fill="none"
        aria-hidden="true"
        className={className}
      >
        {path}
      </svg>
    );
  };

export const ArrowGlyph = glyph(
  <path d="M1 5h10M7 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
);
export const CheckGlyph = glyph(
  <path d="M1.5 6.5 4.5 9.5 10.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />,
  "0 0 12 11"
);
export const UploadGlyph = glyph(
  <path d="M6 9V1m0 0L2.5 4.5M6 1l3.5 3.5M1.5 11h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />,
  "0 0 12 12"
);
export const DownloadGlyph = glyph(
  <path d="M6 1v8m0 0L2.5 5.5M6 9l3.5-3.5M1.5 11.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />,
  "0 0 12 12"
);
export const EyeGlyph = glyph(
  <>
    <ellipse cx="6" cy="6" rx="5.2" ry="3.2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="6" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.4" />
  </>,
  "0 0 12 12"
);
export const StopGlyph = glyph(<rect width="10" height="10" fill="currentColor" />, "0 0 10 10");
export const StarGlyph = glyph(
  <path
    d="M5 1l1.18 2.39L8.8 3.78 6.9 5.63l.45 2.62L5 7l-2.35 1.25.45-2.62-1.9-1.85 2.62-.39L5 1z"
    fill="currentColor"
  />,
  "0 0 10 10"
);
export const ArchiveGlyph = glyph(
  <path
    d="M1.5 3.5h11M2.5 3.5v8.5h9V3.5M5.5 6.5h3"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="square"
  />,
  "0 0 14 14"
);
export const CloseGlyph = glyph(
  <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />,
  "0 0 10 10"
);

export function MoreGlyph({ size = 12 }: GlyphProps) {
  return (
    <svg width={size} height={size * 0.25} viewBox="0 0 12 3" fill="none" aria-hidden="true">
      <circle cx="1.5" cy="1.5" r="1" fill="currentColor" />
      <circle cx="6" cy="1.5" r="1" fill="currentColor" />
      <circle cx="10.5" cy="1.5" r="1" fill="currentColor" />
    </svg>
  );
}

function SunGlyph({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className={className}>
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

function MoonGlyph({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className={className}>
      <path
        d="M11.5 8.4A4.6 4.6 0 1 1 5.6 2.5a4 4 0 0 0 5.9 5.9z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── theme switch: a hairline pill ─────────────────────────── */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // hydration-safe: the server cannot know the theme, so mount is the first read
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <span
        aria-hidden
        className={cn("inline-flex items-center justify-center size-9 rounded-pill border border-rule-2", className)}
      />
    );
  }

  const isDark = resolvedTheme === "dark";
  const next = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      onClick={() => setTheme(next)}
      className={cn(
        "inline-flex items-center justify-center size-9 rounded-pill border border-rule-2 hover:bg-paper-2 transition-colors text-muted hover:text-ink cursor-pointer",
        className
      )}
    >
      {isDark ? <SunGlyph /> : <MoonGlyph />}
    </button>
  );
}

/* ── hooks ─────────────────────────────────────────────────── */
export function useNow(active: boolean, intervalMs = 1000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!active) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- first tick immediately, then on the interval
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
  return now;
}
