"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

import { ChatHistoryMenu } from "./ChatHistoryMenu";
import { GithubBanner } from "./GithubBanner";
import useLocalStorage from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import TooltipUsage from "./TooltipUsage";
import { ThemeToggle } from "./ui/ThemeToggle";

interface HeaderProps {
  chatId?: string;
}

/**
 * Header — the application chrome (used on /app and /chat/[id]).
 *
 * Mobile: a fixed top bar with the home glyph, history menu, new chat,
 * and credits chip.
 * Desktop: a fixed left rail (60px) that mirrors the editorial aesthetic.
 */
export function Header({ chatId }: HeaderProps) {
  const [showBanner, setShowBanner] = useLocalStorage<boolean>(
    "showBanner",
    true
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <></>;

  return (
    <>
      <GithubBanner show={showBanner} onClose={() => setShowBanner(false)} />

      <aside
        className={cn(
          // shared layout
          "fixed z-30 bg-ink/85 backdrop-blur-md border-rule",
          // mobile: top bar
          "top-0 left-0 right-0 h-[60px] flex flex-row-reverse items-center justify-between px-3 border-b",
          // desktop: side rail
          "md:flex-col md:w-[60px] md:left-0 md:top-0 md:bottom-0 md:right-auto md:h-auto md:px-0 md:border-r md:border-b-0 md:justify-start",
          showBanner ? "mt-[34px] md:h-[calc(100vh-34px)]" : "md:h-screen"
        )}
      >
        {/* hairline accent bar at top of rail */}
        <span
          className="hidden md:block absolute top-0 inset-x-0 h-[1px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--ember) 50%, transparent)",
          }}
        />

        {/* primary cluster */}
        <div className="flex flex-row gap-2 md:flex-col md:gap-2 md:w-full items-center md:pt-3">
          {/* home glyph — desktop only (top of rail) */}
          <Link
            href="/"
            className="hidden md:flex items-center justify-center w-full py-3 border-b border-rule group"
            aria-label="Home"
          >
            <HomeGlyph />
          </Link>

          {/* chat history */}
          <div className="md:mt-1">
            <ChatHistoryMenu chatId={chatId} />
          </div>

          {/* new chat */}
          <Link
            href="/app"
            aria-label="Start a new chat"
            className="group inline-flex items-center justify-center size-9 rounded-sm border border-rule hover:border-ember hover:bg-surface-2 transition-colors"
          >
            <NewChatGlyph />
          </Link>

          {/* mobile theme + credits */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle variant="icon" />
            <TooltipUsage />
          </div>
        </div>

        {/* mobile-only home glyph (left side) */}
        <Link
          href="/"
          className="md:hidden inline-flex items-center justify-center"
          aria-label="Home"
        >
          <HomeGlyph small />
        </Link>

        {/* spacer to push credits to bottom on desktop */}
        <div className="hidden md:block flex-1" />

        {/* desktop theme toggle + credits chip (bottom of rail) */}
        <div className="hidden md:flex md:flex-col md:items-center md:gap-3 md:w-full md:pb-4 border-t border-rule pt-4 mt-2">
          <ThemeToggle variant="icon" />
          <TooltipUsage />
        </div>
      </aside>

      {/* mobile spacer */}
      <div
        className={cn(
          "md:hidden",
          showBanner ? "min-h-[94px]" : "min-h-[60px]"
        )}
      />
      <div
        className={cn(
          "hidden md:block",
          showBanner ? "min-h-[34px]" : "min-h-0"
        )}
      />
    </>
  );
}

function HomeGlyph({ small = false }: { small?: boolean }) {
  const size = small ? 22 : 26;
  return (
    <span
      className="relative grid place-items-center group"
      style={{ width: size, height: size }}
    >
      <span className="absolute inset-0 border border-bone/80 transition-colors group-hover:border-bone" />
      <span className="absolute -bottom-[3px] -right-[3px] inset-0 border border-ember opacity-90" />
      <span
        className="relative font-display italic leading-none text-bone"
        style={{ fontSize: small ? 13 : 15 }}
      >
        d
      </span>
    </span>
  );
}

function NewChatGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-smoke group-hover:text-ember transition-colors"
    >
      <path
        d="M7 1.5v11M1.5 7h11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}
