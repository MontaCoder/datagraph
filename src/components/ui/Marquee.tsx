"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Marquee — a precise editorial ticker. Render twice in a track so the
 * loop is seamless when -50% translate hits.
 */
export function Marquee({
  items,
  className,
  pauseOnHover = true,
}: {
  items: React.ReactNode[];
  className?: string;
  pauseOnHover?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className={cn(
          "marquee-track",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="flex items-center px-6 text-smoke shrink-0"
          >
            {item}
          </span>
        ))}
      </div>
      {/* edge fades so it dissolves into the page */}
      <div
        className="absolute inset-y-0 left-0 w-24 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, var(--ink), transparent)",
        }}
      />
      <div
        className="absolute inset-y-0 right-0 w-24 pointer-events-none"
        style={{
          background:
            "linear-gradient(to left, var(--ink), transparent)",
        }}
      />
    </div>
  );
}
