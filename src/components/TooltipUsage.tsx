"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { intervalToDuration, differenceInSeconds } from "date-fns";
import { useUserLimits } from "@/hooks/UserLimitsContext";

function formatTimeRemaining(resetTimestamp: number) {
  const now = new Date();
  const reset =
    typeof resetTimestamp === "string"
      ? new Date(parseInt(resetTimestamp, 10))
      : new Date(resetTimestamp);
  if (isNaN(reset.getTime())) return "--:--:--";
  if (reset.getTime() <= now.getTime()) return "00:00:00";
  const duration = intervalToDuration({ start: now, end: reset });
  const totalSeconds = differenceInSeconds(reset, now);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = (duration.minutes ?? 0).toString().padStart(2, "0");
  const seconds = (duration.seconds ?? 0).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * TooltipUsage — credits-remaining chip in the app rail. Displays a small
 * tabular number with the "credits" eyebrow underneath; on hover, the
 * tooltip reveals the time until the rate-limit window resets.
 */
export default function TooltipUsage() {
  const { remainingMessages, resetTimestamp } = useUserLimits();

  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [open]);

  const formattedTime = useMemo(() => {
    if (!resetTimestamp) return undefined;
    return formatTimeRemaining(resetTimestamp);
  }, [resetTimestamp, tick]);

  return (
    <Tooltip onOpenChange={setOpen} open={open}>
      <TooltipTrigger asChild>
        <button
          aria-label="Remaining credits"
          className="group flex flex-col items-center justify-center w-[44px] py-2 rounded-sm border border-rule hover:border-ember bg-surface-2/40 transition-colors"
        >
          <span className="font-mono text-[14px] leading-none text-bone tabular">
            {remainingMessages ?? "—"}
          </span>
          <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-smoke mt-1.5">
            credits
          </span>
        </button>
      </TooltipTrigger>
      {formattedTime && (
        <TooltipContent
          side="right"
          className="!bg-surface !text-bone !border-rule !rounded-sm !px-3 !py-2"
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-smoke">
              ▾ Window resets in
            </span>
            <span className="font-mono text-[12px] text-ember tabular">
              {formattedTime}
            </span>
          </div>
        </TooltipContent>
      )}
    </Tooltip>
  );
}
