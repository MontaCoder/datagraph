"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Panel, LiveDot, CloseGlyph } from "@/components/ui";

/* ─────────────────────────────────────────────────────────────
   tools — the code-execution surfaces inside a chat reply:
   the run monitor, the trace, stdout and the figure lightbox.
   ───────────────────────────────────────────────────────────── */

const STAGES = [
  "booting the code interpreter",
  "mounting the csv from storage",
  "setting up the environment",
  "preparing the runtime",
  "executing your python",
  "collecting outputs",
  "rendering figures",
  "finalizing the answer",
];

export function RunMonitor() {
  const [progress, setProgress] = useState(0);
  const stage = STAGES[Math.min(STAGES.length - 1, Math.floor((progress / 80) * STAGES.length))];

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => (p >= 80 ? p : Math.min(80, p + Math.floor(Math.random() * 3) + 1)));
    }, 120);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-4">
      <p className="label flex items-center gap-2 mb-2">
        <LiveDot tone="accent" /> pressing the run<span className="caret" />
      </p>
      <Panel label={stage} live status={`${String(progress).padStart(2, "0")}%`}>
        <div className="px-4 py-3.5">
          <div className="h-[3px] bg-paper-3 rounded-pill overflow-hidden">
            <div
              className="h-full w-full bg-accent origin-left transition-transform duration-200"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>
          <pre className="readout whitespace-pre-wrap mt-3">
            <span className="text-accent">$ </span>
            e2b sandbox, python3{"\n"}
            {stage} [{"=".repeat(Math.floor(progress / 4))}
            {" ".repeat(20 - Math.floor(progress / 4))}]
          </pre>
        </div>
      </Panel>
    </div>
  );
}

export function Trace({ data }: { data: string }) {
  const [expanded, setExpanded] = useState(false);
  const lines = data.split("\n");
  const isLong = lines.length > 10;
  const traceId = React.useId();

  return (
    <div className="mt-4 border border-error/40 rounded-card overflow-hidden bg-error/5">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-error/40">
        <p className="label text-error flex items-center gap-2">
          <span className="block size-1.5 rounded-full bg-error shrink-0" aria-hidden="true" />
          errata, execution failed
        </p>
        <span className="readout text-error/70">{lines.length} lines</span>
      </div>
      <div id={`${traceId}-x`} className="px-4 py-3 max-h-[280px] overflow-y-auto">
        <pre className="readout text-error/90 whitespace-pre-wrap">
          {expanded || !isLong ? data : lines.slice(0, 10).join("\n")}
        </pre>
      </div>
      {isLong && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={`${traceId}-x`}
          onClick={() => setExpanded((e) => !e)}
          className="w-full py-2.5 border-t border-error/40 bg-error/5 hover:bg-error/10 transition-colors label text-error cursor-pointer"
        >
          {expanded ? "show less" : `show ${lines.length - 10} more lines`}
        </button>
      )}
    </div>
  );
}

export function Stdout({ data }: { data: string }) {
  return (
    <Panel label="stdout" className="mt-4" bodyClassName="px-4 py-3.5 max-h-[280px] overflow-y-auto">
      <pre className="readout whitespace-pre-wrap">{data}</pre>
    </Panel>
  );
}

export function Figure({ imageData }: { imageData: { [key: string]: string } }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const src = `data:image/png;base64,${imageData["image/png"]}`;

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>("button, [href]");
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen, handleClose]);

  return (
    <>
      <Panel
        label="figure, rendered"
        right={
          <button
            type="button"
            onClick={handleOpen}
            className="label hover:text-ink underline decoration-accent underline-offset-2 cursor-pointer"
          >
            expand
          </button>
        }
        className="mt-4"
      >
        <button
          type="button"
          aria-label="Expand figure in full view"
          onClick={handleOpen}
          className="block w-full p-4 cursor-zoom-in hover:opacity-95 transition-opacity text-left bg-[var(--color-plot-paper)]"
        >
          {hasError ? (
            <span className="label whitespace-nowrap flex items-center justify-center py-10">
              figure could not be rendered
            </span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- the figure is an inline data url; there is nothing to fetch
            <img
              src={src}
              alt="Generated figure"
              loading="lazy"
              decoding="async"
              onError={() => setHasError(true)}
              className="max-w-full h-auto block mx-auto"
            />
          )}
        </button>
      </Panel>

      {isOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Generated figure, expanded view"
          onClick={handleClose}
          className="fixed inset-0 z-[600] flex items-center justify-center bg-paper/95 px-4 md:px-10 py-10"
        >
          <div className="absolute top-4 inset-x-0 flex items-center justify-between px-6">
            <p className="label">figure, expanded view</p>
            <button
              ref={closeBtnRef}
              type="button"
              aria-label="Close figure"
              onClick={handleClose}
              className="inline-flex items-center justify-center size-9 rounded-pill border border-rule-2 text-ink hover:border-accent hover:text-accent-2 bg-paper-2 transition-colors cursor-pointer"
            >
              <CloseGlyph />
            </button>
          </div>
          <div
            onClick={(e) => e.stopPropagation()}
            className="border border-rule rounded-card p-4 max-w-[90vw] max-h-[80vh] overflow-auto bg-[var(--color-plot-paper)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- inline data url */}
            <img src={src} alt="Generated figure expanded" decoding="async" className="block max-w-full h-auto" />
          </div>
        </div>
      )}
    </>
  );
}
