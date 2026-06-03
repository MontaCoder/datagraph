"use client";

import { cn } from "@/lib/utils";

/**
 * QuestionSuggestionCard — an editorial "suggested reading" entry.
 *
 * Stacks vertically with hairline dividers between cards, each row
 * indexed and capped with a subtle ember on hover.
 */
export function QuestionSuggestionCard({
  question,
  onClick,
  isLoading,
  index,
}: {
  question: string;
  onClick?: () => void;
  isLoading?: boolean;
  index?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick && onClick}
      disabled={!onClick}
      className={cn(
        "group relative flex items-baseline gap-4 w-full text-left px-4 py-4 border-t border-rule first:border-t-0 transition-colors",
        onClick
          ? "cursor-pointer hover:bg-surface-2/60"
          : "cursor-default",
        isLoading && "animate-pulse"
      )}
    >
      {/* index */}
      <span
        className={cn(
          "font-mono text-[11px] tracking-[0.1em] tabular shrink-0 mt-1",
          isLoading ? "text-graphite" : "text-ember"
        )}
      >
        {index !== undefined ? String(index).padStart(2, "0") : "▸"}
      </span>

      {/* the question text */}
      <span className="flex-1 text-paper group-hover:text-bone text-[14.5px] leading-[1.55] transition-colors">
        {isLoading ? (
          <span className="inline-block h-3 w-2/3 rounded bg-rule align-middle" />
        ) : (
          question
        )}
      </span>

      {/* trailing arrow that appears on hover */}
      {!isLoading && onClick && (
        <span className="shrink-0 mt-1 text-graphite group-hover:text-ember translate-x-0 group-hover:translate-x-1 transition-all">
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path
              d="M1 5h10M7 1l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
            />
          </svg>
        </span>
      )}

      {/* ember underline on hover */}
      <span
        className="absolute left-0 bottom-0 h-[1px] w-0 bg-ember transition-all duration-500 group-hover:w-full"
        aria-hidden
      />
    </button>
  );
}
