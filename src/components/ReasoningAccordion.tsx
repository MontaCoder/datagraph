"use client";
import { useEffect, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

import { type ReasoningUIPart } from "ai";

/**
 * ReasoningAccordion — collapsible "Margin notes" panel revealing the
 * model's chain of thought when a reasoning model is in use. Auto-closes
 * once the reply text starts streaming.
 */
export default function ReasoningAccordion({
  reasoning,
  isReasoningOver = false,
}: {
  reasoning?: ReasoningUIPart;
  isReasoningOver?: boolean;
}) {
  const [open, setOpen] = useState<string>("reasoning");

  useEffect(() => {
    if (isReasoningOver) {
      setOpen("");
    }
  }, [isReasoningOver]);

  if (!reasoning?.text) return null;
  return (
    <div className="mb-4">
      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={open}
        onValueChange={setOpen}
      >
        <AccordionItem value="reasoning" className="border-0">
          <AccordionTrigger
            className="
              !no-underline w-full max-w-fit inline-flex items-center justify-between gap-3
              px-3 py-1.5 rounded-sm
              font-mono text-[10px] tracking-[0.18em] uppercase
              bg-surface-2 text-smoke border border-rule
              hover:text-bone hover:border-rule-strong
              data-[state=open]:text-ember data-[state=open]:border-ember/40
            "
          >
            <span className="flex items-center gap-2">
              <span
                className={`block size-1.5 rounded-full ${
                  isReasoningOver ? "bg-graphite" : "bg-ember ember-pulse"
                }`}
              />
              ▾ Margin notes
            </span>
          </AccordionTrigger>
          <AccordionContent
            className="
              overflow-hidden whitespace-pre-wrap mt-2
              border-l-2 border-ember/40 pl-4 ml-1.5
              font-mono text-[12px] leading-[1.65] text-smoke
            "
          >
            {reasoning.text}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
