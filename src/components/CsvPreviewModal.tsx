"use client";
import React from "react";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";

/**
 * CsvPreviewModal — editorial preview of the parsed CSV.
 *
 * Designed as an "appendix" inside the journal, with a stamped header
 * and tabular monospace cells. Sticky header for long tables.
 */
export function CsvPreviewModal({
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay
        className="!bg-ink/80"
        style={{ backdropFilter: "blur(8px)" }}
      />
      <DialogContent className="w-full max-w-none md:max-w-[900px] mx-auto p-0 !bg-surface !border-rule rounded-sm shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-rule bg-surface-2/80">
          <DialogTitle asChild>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ember">
              ▾ CSV preview
            </span>
          </DialogTitle>
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-smoke tabular">
            {rows.length} rows · {headers.length} cols
          </span>
        </div>
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-surface-2">
              <TableRow className="border-rule hover:bg-transparent">
                {headers.map((header, idx) => (
                  <TableHead
                    key={idx}
                    scope="col"
                    className="font-mono text-[10px] tracking-[0.16em] uppercase text-smoke px-4 py-3 text-left whitespace-nowrap border-r border-rule last:border-r-0"
                  >
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rIdx) => (
                <TableRow
                  key={rIdx}
                  className="border-rule hover:bg-surface-2/40"
                >
                  {headers.map((header, cIdx) => (
                    <TableCell
                      key={cIdx}
                      className="font-mono text-[12px] text-bone tabular px-4 py-2.5 whitespace-nowrap border-r border-rule last:border-r-0"
                    >
                      {row[header] ?? (
                        <span className="text-graphite">—</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
