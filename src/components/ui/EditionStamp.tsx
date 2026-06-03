"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * EditionStamp — newspaper-style mast metadata. Renders a date,
 * issue number, and live-data dot. Used in the landing masthead and
 * the app shell footer.
 */
export function EditionStamp({
  className,
  edition = "VOLUME I · ISSUE 001",
  showLive = true,
  showDate = true,
}: {
  className?: string;
  edition?: string;
  showLive?: boolean;
  showDate?: boolean;
}) {
  const [today, setToday] = useState<string>("");

  useEffect(() => {
    const d = new Date();
    setToday(
      d
        .toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
        .toUpperCase()
    );
  }, []);

  return (
    <div
      className={cn(
        "flex items-center gap-3 font-mono text-[10px] tracking-[0.18em] uppercase text-smoke",
        className
      )}
    >
      {showDate && <span className="tabular">{today}</span>}
      {showDate && <span className="text-graphite">·</span>}
      <span>{edition}</span>
      {showLive && (
        <>
          <span className="text-graphite">·</span>
          <span className="flex items-center gap-1.5">
            <span
              className="block size-1.5 rounded-full bg-ember ember-pulse"
              aria-hidden
            />
            <span className="text-ember">LIVE</span>
          </span>
        </>
      )}
    </div>
  );
}
