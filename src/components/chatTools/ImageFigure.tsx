"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";

interface ImageFigureProps {
  imageData: { [key: string]: string };
}

/**
 * ImageFigure — renders a generated chart/figure as a captioned panel.
 * Click to expand to an accessible modal dialog (focus-trapped, Esc to close,
 * focus restored to the trigger on close).
 */
export const ImageFigure: React.FC<ImageFigureProps> = ({ imageData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const handleOpen = () => setIsOpen(true);
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
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])'
        );
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
      <figure className="mt-4 fade-in border border-rule rounded-sm overflow-hidden bg-surface-2/40">
        <figcaption className="flex items-center justify-between px-4 py-2 border-b border-rule bg-surface-2/80">
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-smoke flex items-center gap-2">
            <span className="block size-1.5 rounded-full bg-moss" />
            ▸ Figure · rendered
          </span>
          <button
            onClick={handleOpen}
            className="font-mono text-[10px] tracking-[0.18em] uppercase text-smoke hover:text-ember editorial-link cursor-pointer"
          >
            Expand ↗
          </button>
        </figcaption>
        <div
          className="p-4 cursor-zoom-in hover:opacity-95 transition-opacity"
          style={{ background: "#f3f5ec" }}
          onClick={handleOpen}
        >
          <h3 className="sr-only">Generated figure</h3>
          <img
            src={`data:image/png;base64,${imageData["image/png"]}`}
            alt="Generated figure"
            className="max-w-full h-auto block mx-auto"
          />
        </div>
      </figure>
      {isOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Generated figure, expanded view"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 backdrop-blur-md px-4 md:px-10 py-10"
          onClick={handleClose}
        >
          <div className="absolute top-4 inset-x-0 flex items-center justify-between px-6">
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-smoke">
              ▸ Figure · expanded view
            </span>
            <button
              ref={closeBtnRef}
              aria-label="Close figure"
              onClick={handleClose}
              className="inline-flex items-center justify-center size-9 rounded-sm border border-rule text-bone hover:border-ember hover:text-ember bg-surface transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
              >
                <line x1="3" y1="3" x2="11" y2="11" />
                <line x1="11" y1="3" x2="3" y2="11" />
              </svg>
            </button>
          </div>
          <div
            className="border border-rule p-4 max-w-[90vw] max-h-[80vh] overflow-auto"
            style={{ background: "#f3f5ec" }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`data:image/png;base64,${imageData["image/png"]}`}
              alt="Generated figure expanded"
              className="block max-w-full h-auto"
            />
          </div>
        </div>
      )}
    </>
  );
};
