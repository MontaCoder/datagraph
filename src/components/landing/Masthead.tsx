"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn, GITHUB_REPO } from "@/lib/utils";

/**
 * Masthead — the instrument's top control bar.
 *
 * A fixed bar that condenses on scroll. The wordmark is drawn as a plotted
 * coordinate glyph; the nav reads like instrument controls. A live scroll
 * progress hairline runs along the bottom edge.
 */
const NAV_LINKS = [
  { href: "#read", label: "Specimen" },
  { href: "#process", label: "Method" },
  {
    href: `https://github.com/${GITHUB_REPO}`,
    label: "Source",
    ext: true,
  },
];

export function Masthead() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      const h =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(1, window.scrollY / h) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-40 transition-all duration-500",
        scrolled
          ? "bg-ink/85 backdrop-blur-xl border-b border-rule"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="max-w-[1480px] mx-auto px-5 md:px-10">
        <div
          className={cn(
            "flex items-center justify-between transition-all duration-500",
            scrolled ? "h-14" : "h-[76px]"
          )}
        >
          {/* Wordmark */}
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label="Datagraph home"
          >
            <PlotGlyph />
            <span className="flex flex-col leading-none">
              <span className="font-display font-extrabold text-[19px] tracking-[-0.03em] text-bone">
                DATAGRAPH
              </span>
              <span className="hidden sm:block font-mono text-[8.5px] tracking-[0.32em] uppercase text-smoke mt-1">
                Precision data instrument
              </span>
            </span>
          </Link>

          {/* center coordinate readout */}
          <div className="hidden lg:flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] uppercase text-smoke">
            <span className="text-graphite">x:</span>
            <span className="text-paper tabular w-9 text-right">
              {(progress * 100).toFixed(0).padStart(3, "0")}
            </span>
            <span className="text-graphite">·</span>
            <span className="flex items-center gap-1.5 text-moss">
              <span className="block size-1.5 rounded-full bg-moss ember-pulse" />
              online
            </span>
          </div>

          {/* Right nav */}
          <nav className="flex items-center gap-1.5 md:gap-4">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                target={l.ext ? "_blank" : undefined}
                rel={l.ext ? "noopener noreferrer" : undefined}
                className="hidden md:inline-flex font-mono text-[11px] tracking-[0.14em] uppercase text-smoke hover:text-bone editorial-link px-1"
              >
                {l.label}
              </Link>
            ))}
            <ThemeToggle variant="chip" className="hidden sm:inline-flex" />
            <Link
              href="/app"
              className="ml-1 group inline-flex items-center gap-2 h-9 px-4 rounded-sm bg-ember text-ink font-mono font-medium text-[11px] tracking-[0.16em] uppercase hover:bg-cinnabar hover:translate-y-[-1px] transition-all shadow-[0_6px_22px_-10px_rgb(var(--accent-rgb)/0.8)]"
            >
              <span>Launch</span>
              <ArrowRight />
            </Link>
            {/* mobile menu toggle */}
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden inline-flex items-center justify-center size-9 rounded-sm border border-rule text-bone hover:border-ember transition-colors"
            >
              <MenuGlyph open={menuOpen} />
            </button>
          </nav>
        </div>
      </div>

      {/* mobile menu panel */}
      <div
        className={cn(
          "md:hidden overflow-hidden border-t border-rule bg-ink/95 backdrop-blur-xl transition-[max-height,opacity] duration-300",
          menuOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0 border-transparent"
        )}
      >
        <nav className="px-5 py-3 flex flex-col">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              target={l.ext ? "_blank" : undefined}
              rel={l.ext ? "noopener noreferrer" : undefined}
              onClick={() => setMenuOpen(false)}
              className="py-3 border-b border-rule font-mono text-[12px] tracking-[0.16em] uppercase text-smoke hover:text-ember transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex items-center justify-between pt-4">
            <ThemeToggle variant="chip" />
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite">
              datagraph
            </span>
          </div>
        </nav>
      </div>

      {/* scroll-progress hairline */}
      <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-transparent overflow-hidden">
        <div
          className="h-full origin-left"
          style={{
            transform: `scaleX(${progress})`,
            background:
              "linear-gradient(90deg, var(--ember), var(--storm))",
            transition: "transform 90ms linear",
            opacity: scrolled ? 1 : 0,
          }}
        />
      </div>
    </header>
  );
}

function PlotGlyph() {
  return (
    <span className="relative grid place-items-center size-9 border border-rule-strong group-hover:border-ember transition-colors duration-300 bg-surface/60">
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* axes */}
        <path
          d="M3 3v16h16"
          stroke="var(--smoke)"
          strokeWidth="1"
          strokeLinecap="square"
        />
        {/* plotted line */}
        <path
          d="M5 16l4-3 3 2 6-9"
          stroke="var(--ember)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* plotted point */}
        <circle cx="18" cy="6" r="2" fill="var(--ember)" />
      </svg>
      {/* registration ticks */}
      <span className="absolute -top-[3px] -left-[3px] size-1.5 border-t border-l border-ember opacity-80" />
      <span className="absolute -bottom-[3px] -right-[3px] size-1.5 border-b border-r border-ember opacity-80" />
    </span>
  );
}

function MenuGlyph({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {open ? (
        <path
          d="M3 3l10 10M13 3L3 13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
      ) : (
        <path
          d="M2 4h12M2 8h12M2 12h12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
      )}
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="-mr-0.5 transition-transform group-hover:translate-x-0.5"
    >
      <path
        d="M1 5h8M5 1l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}
