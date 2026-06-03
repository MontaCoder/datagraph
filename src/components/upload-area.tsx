"use client";
import Dropzone from "react-dropzone";
import React from "react";
import { toast } from "sonner";
import { cn, EXAMPLE_FILE_URL } from "@/lib/utils";

interface UploadAreaProps {
  onFileChange: (
    file: File | null,
    source?: "upload" | "example"
  ) => void;
  uploadedFile: File | null;
}

/**
 * UploadArea — the editorial drop zone. Reads as a stamped manuscript
 * envelope rather than a dashed-rectangle "drop here" cliche.
 *
 * Hidden once a file is uploaded, since the prompt input becomes the
 * primary surface for interaction.
 */
export function UploadArea({ onFileChange, uploadedFile }: UploadAreaProps) {
  if (uploadedFile) return <></>;

  const onUseExample = async () => {
    try {
      const response = await fetch(EXAMPLE_FILE_URL);
      const blob = await response.blob();
      const file = new File([blob], "products.csv", { type: "text/csv" });
      onFileChange(file, "example");
    } catch {
      toast.error("Failed to load example CSV");
    }
  };

  return (
    <div className="w-full">
      <Dropzone
        multiple={false}
        accept={{ "text/csv": [".csv"] }}
        onDrop={(acceptedFiles) => {
          const file = acceptedFiles[0];
          if (!file) {
            toast.warning("Please upload a CSV file");
            return;
          }
          if (file.size > 30 * 1024 * 1024) {
            toast.warning("File size must be less than 30MB");
            return;
          }
          onFileChange(file, "upload");
        }}
      >
        {({ getRootProps, getInputProps, isDragAccept, isDragReject }) => (
          <div
            {...getRootProps()}
            className={cn(
              "group relative w-full overflow-hidden rounded-sm border transition-all duration-300 cursor-pointer",
              "bg-surface/60 backdrop-blur-sm",
              isDragAccept &&
                "border-ember bg-surface ring-2 ring-ember/40 scale-[1.005]",
              isDragReject && "border-rose bg-rose/10",
              !isDragAccept && !isDragReject && "border-rule hover:border-rule-strong"
            )}
          >
            <input
              required={!uploadedFile}
              aria-label="Upload a CSV file"
              {...getInputProps()}
            />

            {/* the editorial chrome */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-rule bg-surface-2/50">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "block size-1.5 rounded-full transition-colors",
                    isDragAccept ? "bg-ember ember-pulse" : "bg-graphite"
                  )}
                />
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-smoke">
                  ▾ Load a dataset
                </span>
              </div>
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite hidden sm:inline">
                .csv · 30 MB max
              </span>
            </div>

            {/* the body — stamped, big, confident */}
            <div className="px-6 py-10 md:px-10 md:py-14 flex flex-col items-start gap-7">
              <div>
                <h3 className="font-display font-extrabold text-bone text-[28px] md:text-[38px] leading-[1.0] tracking-[-0.03em] mb-3">
                  {isDragAccept
                    ? "Release to plot."
                    : "Drag a CSV in, or click here."}
                </h3>
                <p className="text-paper text-[14px] md:text-[15px] leading-[1.6] max-w-lg">
                  Headers, types, and shape are detected automatically. Nothing
                  is written to disk beyond what&apos;s required to answer your
                  question.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-2 h-11 px-5 rounded-sm font-mono text-[11px] tracking-[0.18em] uppercase transition-all",
                    isDragAccept
                      ? "bg-ember text-ink"
                      : "bg-bone text-ink group-hover:bg-paper group-hover:translate-y-[-1px]"
                  )}
                >
                  <UploadGlyph />
                  Choose a CSV
                </span>
                <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-smoke">
                  ▸ or drop one anywhere on this card
                </span>
              </div>
            </div>

            {/* corner registration marks */}
            <CornerMark className="top-2 left-2" />
            <CornerMark className="top-2 right-2 rotate-90" />
            <CornerMark className="bottom-2 left-2 -rotate-90" />
            <CornerMark className="bottom-2 right-2 rotate-180" />

            {/* drag overlay */}
            {isDragAccept && (
              <div className="absolute inset-0 pointer-events-none border-2 border-ember/60 rounded-sm" />
            )}
          </div>
        )}
      </Dropzone>

      {/* example file link */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={onUseExample}
          className="font-mono text-[11px] tracking-[0.18em] uppercase text-smoke hover:text-ember editorial-link"
        >
          ▸ Use an example CSV instead
        </button>
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite hidden md:inline">
          UTF-8 · 30 MB · headered rows
        </span>
      </div>
    </div>
  );
}

function UploadGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M6 9V1m0 0L2.5 4.5M6 1l3.5 3.5M1.5 11h9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

function CornerMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("absolute pointer-events-none text-rule-strong", className)}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path
          d="M0 1h6M1 0v6"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="square"
        />
      </svg>
    </span>
  );
}
