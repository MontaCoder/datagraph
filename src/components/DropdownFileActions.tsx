"use client";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { UploadedFile } from "@/lib/utils";
import { CsvPreviewModal } from "./CsvPreviewModal";

/**
 * DropdownFileActions — small ⋯ menu attached to the file chip in the
 * prompt input. Lets the user preview the parsed CSV or download the
 * original file.
 */
export function DropdownFileActions({
  uploadedFile,
}: {
  uploadedFile?: UploadedFile;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const hasPreview =
    !!uploadedFile?.csvHeaders?.length && !!uploadedFile?.csvRows?.length;
  const hasDownload = !!uploadedFile?.url;

  if (!hasPreview && !hasDownload) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="File actions"
            className="inline-flex items-center justify-center size-5 rounded-sm text-graphite hover:text-ember hover:bg-ink transition-colors cursor-pointer"
          >
            <svg width="12" height="3" viewBox="0 0 12 3" fill="none">
              <circle cx="1.5" cy="1.5" r="1" fill="currentColor" />
              <circle cx="6" cy="1.5" r="1" fill="currentColor" />
              <circle cx="10.5" cy="1.5" r="1" fill="currentColor" />
            </svg>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={6}
          className="!p-0 min-w-[160px] bg-surface border-rule"
        >
          {hasDownload && (
            <a
              href={uploadedFile.url}
              download={uploadedFile.name}
              className="block w-full no-underline"
            >
              <DropdownMenuItem className="h-9 px-3 cursor-pointer flex flex-row items-center gap-3 !text-bone hover:!bg-surface-2 focus:!bg-surface-2 rounded-none border-b border-rule">
                <DownloadGlyph />
                <span className="font-mono text-[11px] tracking-[0.06em] text-bone">
                  Download
                </span>
              </DropdownMenuItem>
            </a>
          )}
          {hasPreview && (
            <DropdownMenuItem
              className="h-9 px-3 cursor-pointer flex flex-row items-center gap-3 !text-bone hover:!bg-surface-2 focus:!bg-surface-2 rounded-none"
              onClick={() => setPreviewOpen(true)}
            >
              <PreviewGlyph />
              <span className="font-mono text-[11px] tracking-[0.06em] text-bone">
                Preview rows
              </span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {hasPreview && (
        <CsvPreviewModal
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          headers={uploadedFile.csvHeaders!}
          rows={uploadedFile.csvRows!}
        />
      )}
    </>
  );
}

function DownloadGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1v9m0 0L3.5 6.5M7 10l3.5-3.5M2 13h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

function PreviewGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <ellipse
        cx="7"
        cy="7"
        rx="6"
        ry="3.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="7"
        cy="7"
        r="1.6"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
