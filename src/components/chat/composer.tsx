"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import { useLLMModel } from "@/hooks/useLLMModel";
import { useUserLimits } from "@/hooks/UserLimitsContext";
import { cn, UploadedFile } from "@/lib/utils";
import {
  ArrowGlyph, CheckGlyph, CloseGlyph, DownloadGlyph, EyeGlyph, LiveDot, MoreGlyph, StopGlyph,
} from "@/components/ui";

/* ─────────────────────────────────────────────────────────────
   composer — the input surface shared by /app and /chat, plus
   the model picker, the file chip and the csv preview dialog.
   ───────────────────────────────────────────────────────────── */

function ModelPicker({ className }: { className?: string }) {
  const { models, selectedModelSlug, setModel } = useLLMModel();
  const selected = models.find((m) => m.slug === selectedModelSlug);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Model"
          className={cn(
            "inline-flex items-center gap-2 h-9 px-3 rounded-pill border border-rule-2 bg-paper hover:border-muted transition-colors cursor-pointer",
            "data-[state=open]:border-accent",
            className
          )}
        >
          {selected && (
            // eslint-disable-next-line @next/next/no-img-element -- 14px remote brand mark; the optimizer would cost more than it saves
            <img
              src={selected.logo}
              alt=""
              width={14}
              height={14}
              className="w-3.5 h-3.5 object-contain"
            />
          )}
          <span className="readout text-ink">{selected?.title.toLowerCase() ?? "model"}</span>
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden="true" className="text-muted">
            <path d="M1 1.5 4 4.5 7 1.5" stroke="currentColor" strokeWidth="1.25" />
          </svg>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="min-w-[200px] bg-paper-2 border border-rule rounded-card shadow-card p-1 z-[100]"
        >
          {models.map((m) => (
            <DropdownMenu.Item
              key={m.slug}
              onSelect={() => setModel(m.slug)}
              className="flex items-center gap-2.5 px-2.5 h-9 cursor-pointer outline-none text-ink-2 rounded-[6px] data-[highlighted]:bg-paper-3 data-[highlighted]:text-ink"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- 14px remote brand mark */}
              <img src={m.logo} alt="" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
              <span className="readout text-inherit flex-1">{m.title.toLowerCase()}</span>
              {m.slug === selectedModelSlug && <CheckGlyph className="text-accent" size={11} />}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function CsvDot() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="8" height="8" stroke="var(--color-accent)" strokeOpacity="0.85" />
      <path d="M3 4h4M3 6h3" stroke="var(--color-accent)" />
    </svg>
  );
}

const MAX_PREVIEW_ROWS = 150;

function CsvModal({
  open,
  onOpenChange,
  headers,
  rows,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headers: string[];
  rows: { [key: string]: string }[];
}) {
  const shown = rows.slice(0, MAX_PREVIEW_ROWS);
  const truncated = rows.length > shown.length;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[400] bg-paper/85" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[400] w-[calc(100vw-2rem)] md:w-[900px] max-h-[80vh] flex flex-col bg-paper border border-rule rounded-card shadow-card">
          <div className="flex items-center justify-between pl-5 pr-12 py-3 border-b border-rule">
            <Dialog.Title className="label text-ink">csv preview</Dialog.Title>
            <span className="readout text-muted">
              {rows.length} rows, {headers.length} cols
            </span>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close preview"
                className="absolute top-3 right-3 p-1.5 text-muted hover:text-ink cursor-pointer"
              >
                <CloseGlyph />
              </button>
            </Dialog.Close>
          </div>
          <div className="overflow-auto flex-1">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  {headers.map((h, i) => (
                    <th
                      key={i}
                      scope="col"
                      className="label px-4 py-3 whitespace-nowrap border-r border-b border-rule bg-paper-2 last:border-r-0"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((row, r) => (
                  <tr key={r} className="hover:bg-paper-2/60">
                    {headers.map((h, c) => (
                      <td
                        key={c}
                        className="readout px-4 py-2.5 whitespace-nowrap border-r border-b border-rule last:border-r-0"
                      >
                        {row[h] ?? <span className="text-muted">n/a</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {truncated && (
            <div className="border-t border-rule px-5 py-2.5">
              <p className="label">
                showing the first {shown.length} of {rows.length} rows
              </p>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function FileChip({ uploadedFile }: { uploadedFile: UploadedFile }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const hasPreview = !!uploadedFile.csvHeaders?.length && !!uploadedFile.csvRows?.length;
  const hasDownload = !!uploadedFile.url;
  const name = uploadedFile.name || uploadedFile.url?.split("/").pop() || "file";

  return (
    <div className="hidden sm:flex items-center gap-1.5 h-9 pl-3 pr-1.5 rounded-pill border border-rule-2 bg-paper">
      <CsvDot />
      <span className="readout text-ink truncate max-w-[140px]" title={name}>
        {name}
      </span>
      {(hasPreview || hasDownload) && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label="File actions"
              className="inline-flex items-center justify-center size-6 rounded-pill text-muted hover:text-ink hover:bg-paper-3 transition-colors cursor-pointer"
            >
              <MoreGlyph />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="min-w-[160px] bg-paper-2 border border-rule rounded-card shadow-card p-0 z-[100] overflow-hidden"
            >
              {hasDownload && (
                <DropdownMenu.Item asChild className="outline-none">
                  <a
                    href={uploadedFile.url}
                    download={uploadedFile.name}
                    className="flex items-center gap-2.5 h-10 px-3.5 cursor-pointer text-ink-2 outline-none data-[highlighted]:bg-paper-3 data-[highlighted]:text-ink border-b border-rule readout"
                  >
                    <DownloadGlyph />
                    download
                  </a>
                </DropdownMenu.Item>
              )}
              {hasPreview && (
                <DropdownMenu.Item
                  onSelect={() => setPreviewOpen(true)}
                  className="flex items-center gap-2.5 h-10 px-3.5 cursor-pointer text-ink-2 outline-none data-[highlighted]:bg-paper-3 data-[highlighted]:text-ink readout"
                >
                  <EyeGlyph />
                  preview rows
                </DropdownMenu.Item>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
      {hasPreview && (
        <CsvModal
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          headers={uploadedFile.csvHeaders!}
          rows={uploadedFile.csvRows!}
        />
      )}
    </div>
  );
}

export function Composer({
  value,
  onChange,
  onSend,
  onStop,
  isAnswering = false,
  uploadedFile,
  placeholder = "ask anything",
  autoFocus = false,
  size = "md",
  fixedOnMobile = false,
  creditsSignal,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  isAnswering?: boolean;
  uploadedFile?: UploadedFile;
  placeholder?: string;
  autoFocus?: boolean;
  size?: "md" | "lg";
  fixedOnMobile?: boolean;
  /** increments each time an answer consumes credits → refetch */
  creditsSignal?: number;
}) {
  const { refetch } = useUserLimits();
  const taRef = useRef<HTMLTextAreaElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [spacerH, setSpacerH] = useState(0);
  const lastSignal = useRef(creditsSignal ?? 0);

  useEffect(() => {
    if (autoFocus) taRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (creditsSignal === undefined || creditsSignal === lastSignal.current) return;
    lastSignal.current = creditsSignal;
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditsSignal]);

  // measured spacer so the fixed mobile input never hides content
  useLayoutEffect(() => {
    if (!fixedOnMobile) return;
    const el = boxRef.current;
    if (!el) return;
    const update = () => setSpacerH(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fixedOnMobile]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const body = (
    <div
      className={cn(
        "relative bg-paper border rounded-card transition-colors",
        isAnswering ? "border-accent" : "border-rule focus-within:border-rule-2"
      )}
    >
      <div className="flex items-center gap-2 px-4 pt-3">
        <span className="readout text-accent">$</span>
        <span className="label">{isAnswering ? "reading" : "compose a question"}</span>
        {isAnswering && <LiveDot tone="accent" />}
      </div>

      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label="Your question"
        className={cn(
          "w-full resize-none bg-transparent text-ink text-[15px] leading-[1.55] px-4 py-3",
          "placeholder:text-muted focus:outline-none focus-visible:outline-none",
          size === "lg" ? "h-[88px] md:h-[110px]" : "h-[60px] md:h-[72px]"
        )}
      />

      <div className="flex items-center justify-between gap-3 px-3 pb-3 pt-1 border-t border-rule">
        <ModelPicker />
        <div className="flex items-center gap-2">
          {uploadedFile && <FileChip uploadedFile={uploadedFile} />}
          {isAnswering ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop"
              className="inline-flex items-center justify-center size-9 rounded-pill border border-rule-2 text-ink hover:border-accent hover:text-accent-2 transition-colors cursor-pointer"
            >
              <StopGlyph size={9} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSend}
              disabled={!value.trim()}
              aria-label="Send"
              className={cn(
                "inline-flex items-center justify-center size-9 rounded-pill transition-colors",
                value.trim()
                  ? "bg-accent text-accent-ink hover:bg-accent-2 cursor-pointer"
                  : "bg-paper-3 text-muted cursor-not-allowed"
              )}
            >
              <ArrowGlyph size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (!fixedOnMobile) {
    return <div className="w-full max-w-3xl mx-auto">{body}</div>;
  }

  return (
    <>
      <div
        className="w-full md:hidden"
        style={{ height: spacerH ? spacerH + 28 : 168 }}
        aria-hidden="true"
      />
      <div className="fixed bottom-0 inset-x-0 z-20 px-4 pt-3 pb-4 bg-gradient-to-t from-paper via-paper to-transparent md:static md:px-0 md:pt-0 md:pb-5 md:bg-none">
        <div className="w-full max-w-3xl mx-auto">{body}</div>
      </div>
    </>
  );
}
