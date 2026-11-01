"use client";

import React from "react";
import Link from "next/link";
import useLocalStorage from "@/hooks/useLocalStorage";
import { cn, GITHUB_REPO } from "@/lib/utils";
import { useUserLimits } from "@/hooks/UserLimitsContext";
import { HistoryMenu } from "@/components/chat/history";
import { StarGlyph, ThemeToggle, useNow } from "@/components/ui";

/* ─────────────────────────────────────────────────────────────
   chrome — the github banner, the workspace rail (a top bar on
   phones) and the credits chip. the rail earns its stickiness:
   history, a new session, the theme and the credits live in it.
   ───────────────────────────────────────────────────────────── */

const STARS_KEY = `gh-stars-${GITHUB_REPO}`;

function GithubBanner({ show, onClose }: { show: boolean; onClose: () => void }) {
  const [stars, setStars] = React.useState<string>("—");

  React.useEffect(() => {
    try {
      const cached = sessionStorage.getItem(STARS_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- cache read on mount; no SSR equivalent
      if (cached) setStars(cached);
    } catch {
      // storage unavailable
    }
    fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "datagraph-app" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (typeof data?.stargazers_count !== "number") return;
        const next = String(data.stargazers_count);
        setStars(next);
        try {
          sessionStorage.setItem(STARS_KEY, next);
        } catch {
          // ignore
        }
      })
      .catch(() => {
        // keep the cached value or the dash
      });
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-40 h-[var(--gh-banner-h)] flex items-center justify-center bg-paper-2 border-b border-rule">
      <a
        href={`https://github.com/${GITHUB_REPO}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 flex items-center justify-center gap-3 label hover:text-ink transition-colors"
        aria-label={`Open source on github, ${stars} stars`}
      >
        <span>open source on github</span>
        <span className="readout inline-flex items-center gap-1.5 text-accent-2">
          <StarGlyph size={10} />
          {stars}
        </span>
      </a>
      <button
        type="button"
        aria-label="Dismiss banner"
        onClick={onClose}
        className="absolute right-3 p-1.5 text-muted hover:text-ink transition-colors cursor-pointer"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
      </button>
    </div>
  );
}

function CreditsChip() {
  const { remainingMessages, resetTimestamp } = useUserLimits();
  const [open, setOpen] = React.useState(false);
  const now = useNow(open);

  const reset = React.useMemo(() => {
    if (!resetTimestamp) return null;
    const target = new Date(resetTimestamp);
    if (isNaN(target.getTime())) return null;
    return () => {
      const total = Math.max(0, Math.floor((target.getTime() - (now ?? Date.now())) / 1000));
      const h = Math.floor(total / 3600).toString().padStart(2, "0");
      const m = Math.floor((total % 3600) / 60).toString().padStart(2, "0");
      const s = (total % 60).toString().padStart(2, "0");
      return `${h}:${m}:${s}`;
    };
  }, [resetTimestamp, now]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Remaining credits"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex flex-col items-center justify-center w-11 py-2 rounded-card border border-rule hover:border-rule-2 transition-colors cursor-pointer"
      >
        <span className="readout text-ink leading-none">{remainingMessages ?? "—"}</span>
        <span className="label text-[10px] mt-1">credits</span>
      </button>
      {open && reset && (
        <div className="absolute left-full bottom-0 ml-2 z-[600] bg-paper-2 border border-rule rounded-card px-3 py-2 whitespace-nowrap shadow-card">
          <p className="label">window resets in</p>
          <span className="readout text-ink">{reset()}</span>
        </div>
      )}
    </div>
  );
}

export function AppRail({ chatId }: { chatId?: string }) {
  const [showBanner, setShowBanner] = useLocalStorage<boolean>("showBanner", true);

  return (
    <>
      <GithubBanner show={showBanner} onClose={() => setShowBanner(false)} />

      <aside
        className={cn(
          "fixed z-30 bg-paper border-rule",
          "top-0 left-0 right-0 h-[60px] flex flex-row-reverse items-center justify-between px-4 border-b",
          "md:flex-col md:w-14 md:left-0 md:top-0 md:bottom-0 md:right-auto md:h-auto md:px-0 md:border-r md:border-b-0 md:justify-start",
          showBanner
            ? "mt-[var(--gh-banner-h)] md:h-[calc(100dvh-var(--gh-banner-h))]"
            : "md:h-dvh"
        )}
      >
        <div className="flex flex-row-reverse gap-2 md:flex-col md:w-full items-center md:pt-3">
          <Link
            href="/"
            aria-label="Datagraph home"
            className="hidden md:flex items-center justify-center w-full py-3 border-b border-rule font-display text-[19px] text-ink hover:text-accent-2 transition-colors"
          >
            d
          </Link>

          <HistoryMenu chatId={chatId} />

          <Link
            href="/app"
            aria-label="Start a new chat"
            className="inline-flex items-center justify-center size-9 rounded-card border border-rule hover:border-rule-2 hover:bg-paper-2 text-muted hover:text-ink transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1.5v11M1.5 7h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </Link>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <CreditsChip />
          </div>
        </div>

        <Link href="/" aria-label="Datagraph home" className="md:hidden font-display text-[19px] text-ink">
          d
        </Link>

        <div className="hidden md:block flex-1" />

        <div className="hidden md:flex flex-col items-center gap-3 w-full pb-4 border-t border-rule pt-4 mt-2">
          <ThemeToggle />
          <CreditsChip />
        </div>
      </aside>

      <div
        className={cn(
          "md:hidden",
          showBanner ? "min-h-[calc(60px+var(--gh-banner-h))]" : "min-h-[60px]"
        )}
        aria-hidden="true"
      />
      <div
        className={cn("hidden md:block", showBanner ? "min-h-[var(--gh-banner-h)]" : "min-h-0")}
        aria-hidden="true"
      />
    </>
  );
}
