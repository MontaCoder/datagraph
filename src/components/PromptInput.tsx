"use client";

import type React from "react";
import { ModelDropdown } from "./ModelDropdown";
import { useLLMModel } from "@/hooks/useLLMModel";
import { useEffect, useRef } from "react";
import { cn, UploadedFile } from "@/lib/utils";
import { DropdownFileActions } from "./DropdownFileActions";

/**
 * PromptInput — the editorial composer.
 *
 * Single rounded surface with a soft ember focus ring. Top: textarea.
 * Bottom rail: model dropdown on left, attached file chip + send/stop on
 * right. Designed to feel as much like a typewriter as a textbox.
 */
export function PromptInput({
  isLLMAnswering,
  onStopLLM,
  textAreaClassName,
  value,
  onChange,
  onSend,
  uploadedFile,
  placeholder = "Ask anything…",
}: {
  isLLMAnswering: boolean;
  onStopLLM: () => void;
  textAreaClassName?: string;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  uploadedFile?: UploadedFile;
  placeholder?: string;
}) {
  const { selectedModelSlug, setModel, models } = useLLMModel();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData("text");
    onChange(pastedText.trim());
    e.preventDefault();
  };

  return (
    <div
      className={cn(
        "group relative bg-surface/85 backdrop-blur-md border border-rule rounded-sm transition-all duration-200",
        "focus-within:border-rule-strong focus-within:shadow-[0_0_0_1px_var(--ember),0_18px_44px_-22px_rgb(var(--accent-rgb)/0.55)]",
        isLLMAnswering && "shadow-[0_0_0_1px_var(--ember),0_0_30px_-8px_var(--ember)]"
      )}
    >
      {/* prompt eyebrow */}
      <div className="flex items-center justify-between px-4 pt-2.5">
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] uppercase text-smoke">
          <span className="text-ember">$</span>
          <span>{isLLMAnswering ? "Reading…" : "Compose a question"}</span>
          {isLLMAnswering && (
            <span className="block size-1.5 rounded-full bg-ember ember-pulse" />
          )}
        </div>
      </div>

      {/* textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full resize-none bg-transparent text-bone text-[15px] leading-[1.55]",
          "placeholder:text-graphite focus:outline-none px-4 py-3",
          textAreaClassName
        )}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
      />

      {/* bottom rail */}
      <div className="flex flex-row items-center justify-between gap-3 px-3 pb-3 pt-1 border-t border-rule">
        <ModelDropdown
          models={models}
          value={selectedModelSlug}
          onChange={setModel}
        />

        <div className="flex flex-row items-center gap-2">
          {uploadedFile && (
            <div className="hidden sm:flex items-center gap-2 h-7 pl-2.5 pr-1 rounded-sm bg-surface-2 border border-rule">
              <CsvDot />
              <span
                className="font-mono text-[11px] text-bone tabular truncate max-w-[140px]"
                title={
                  uploadedFile.name ||
                  uploadedFile?.url?.split("/").pop() ||
                  ""
                }
              >
                {uploadedFile.name || uploadedFile?.url?.split("/").pop()}
              </span>
              <DropdownFileActions uploadedFile={uploadedFile} />
            </div>
          )}

          {isLLMAnswering ? (
            <button
              onClick={onStopLLM}
              aria-label="Stop"
              className="inline-flex items-center justify-center size-7 rounded-sm bg-surface-2 border border-rule hover:border-ember hover:bg-ink transition-colors text-bone cursor-pointer"
            >
              <StopGlyph />
            </button>
          ) : (
            <button
              onClick={onSend}
              disabled={!value.trim()}
              aria-label="Send"
              className={cn(
                "group/send inline-flex items-center justify-center size-7 rounded-sm transition-all",
                value.trim()
                  ? "bg-ember text-ink hover:bg-cinnabar hover:translate-y-[-1px] shadow-[0_0_0_1px_var(--ember)] cursor-pointer"
                  : "bg-surface-2 text-graphite border border-rule cursor-not-allowed"
              )}
            >
              <SendGlyph />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SendGlyph() {
  return (
    <svg
      width="12"
      height="10"
      viewBox="0 0 12 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M1 5h10M7 1l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

function StopGlyph() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="10" height="10" fill="currentColor" />
    </svg>
  );
}

function CsvDot() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <rect
        x="1"
        y="1"
        width="8"
        height="8"
        stroke="var(--ember)"
        strokeOpacity="0.85"
      />
      <path d="M3 4h4M3 6h3" stroke="var(--ember)" />
    </svg>
  );
}
