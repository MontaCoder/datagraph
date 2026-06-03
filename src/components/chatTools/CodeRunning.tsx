"use client";
import { useEffect, useState } from "react";
import { ThinkingIndicator } from "../ui/ThinkingIndicator";

const STATUSES = [
  "Booting the code interpreter",
  "Mounting the CSV from storage",
  "Setting up the environment",
  "Installing dependencies",
  "Executing your Python",
  "Collecting outputs",
  "Rendering figures",
  "Finalizing the answer",
];

/**
 * CodeRunning — the editorial "press is running" interlude.
 * A simulated progress bar with rotating stage labels while the model
 * waits for the E2B sandbox to return.
 */
export const CodeRunning = () => {
  const [progress, setProgress] = useState(0);
  const statusIndex = Math.min(
    STATUSES.length - 1,
    Math.floor((progress / 80) * STATUSES.length)
  );
  const currentStatus = STATUSES[statusIndex];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (progress < 80) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 80) {
            const next = prev + Math.floor(Math.random() * 3) + 1;
            return next > 80 ? 80 : next;
          }
          return prev;
        });
      }, 120);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [progress]);

  return (
    <>
      <ThinkingIndicator thought="Pressing the run" />
      <div className="mt-2 border border-rule rounded-sm bg-surface-2/60 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-rule bg-surface-2/80 flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ember flex items-center gap-2">
            <span className="block size-1.5 rounded-full bg-ember ember-pulse" />
            ▸ {currentStatus}
          </span>
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-smoke tabular">
            {String(progress).padStart(2, "0")}%
          </span>
        </div>
        <div className="px-4 py-3 space-y-2">
          {/* progress bar */}
          <div className="relative h-[4px] bg-rule rounded-sm overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-ember transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* mock-terminal-line */}
          <pre className="font-mono text-[12px] text-paper leading-[1.6] whitespace-pre-wrap">
            <span className="text-ember">$ </span>
            <span className="text-smoke">e2b sandbox · python3</span>
            {"\n"}
            <span className="text-storm">{currentStatus}</span>
            <span className="text-graphite">
              {" "}
              [{"=".repeat(Math.floor(progress / 4))}
              {" ".repeat(20 - Math.floor(progress / 4))}]{" "}
            </span>
            <span className="cursor-blink" />
          </pre>
        </div>
      </div>
    </>
  );
};
