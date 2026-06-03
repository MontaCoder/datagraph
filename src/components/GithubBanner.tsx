"use client";

import React, { useEffect, useState } from "react";
import { GITHUB_REPO } from "@/lib/utils";

interface GithubBannerProps {
  show: boolean;
  onClose: () => void;
}

/**
 * GithubBanner — the editorial "broadside" announcement at the very top.
 * Slim, hairline, mono-typed; can be dismissed and persists in localStorage.
 */
export const GithubBanner: React.FC<GithubBannerProps> = ({
  show,
  onClose,
}) => {
  const [stars, setStars] = useState<string>("—");

  useEffect(() => {
    async function fetchStars() {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}`,
          {
            headers: {
              Accept: "application/vnd.github+json",
              "User-Agent": "datagraph-app",
            },
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        setStars(
          typeof data.stargazers_count === "number"
            ? data.stargazers_count.toLocaleString()
            : "—"
        );
      } catch {
        setStars("—");
      }
    }
    fetchStars();
  }, []);

  if (!show) return null;

  return (
    <a
      href={`https://github.com/${GITHUB_REPO}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed top-0 inset-x-0 z-40 h-[34px] flex items-center justify-center bg-ink border-b border-rule overflow-hidden"
    >
      {/* subtle ember underline that animates */}
      <span
        className="absolute inset-x-0 bottom-0 h-[1px] origin-center"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--ember) 50%, transparent)",
          opacity: 0.6,
        }}
      />

      <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.18em] uppercase text-bone">
        <span className="hidden sm:inline text-smoke">▸ Open source on</span>
        <span className="text-bone">GitHub</span>
        <span className="text-graphite">·</span>
        <span className="flex items-center gap-1.5 text-ember">
          <StarGlyph />
          <span className="tabular">{stars}</span>
        </span>
        <span className="text-graphite hidden md:inline">·</span>
        <span className="hidden md:inline text-smoke">
          Read the source, fork the issue
        </span>
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ember translate-x-0 group-hover:translate-x-1 transition-transform">
          →
        </span>
      </div>

      <button
        className="absolute right-2 p-2 text-smoke hover:text-bone transition-colors"
        aria-label="Dismiss banner"
        onClick={(evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          onClose();
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M1 1l8 8M9 1l-8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </svg>
      </button>
    </a>
  );
};

function StarGlyph() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path
        d="M5 1l1.18 2.39L8.8 3.78 6.9 5.63l.45 2.62L5 7l-2.35 1.25.45-2.62-1.9-1.85 2.62-.39L5 1z"
        fill="currentColor"
      />
    </svg>
  );
}
