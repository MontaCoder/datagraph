"use client";

import React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ChatModel } from "@/lib/models";
import { cn } from "@/lib/utils";

export function ModelDropdown({
  models,
  value,
  onChange,
}: {
  models: ChatModel[];
  value?: string;
  onChange: (model: string) => void;
}) {
  const selectedModel = models.find((m) => m.slug === value);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "flex flex-row items-center gap-2 px-2.5 py-1.5",
          "rounded-sm bg-surface-2 !border !border-rule hover:!border-rule-strong",
          "!h-[28px] min-w-[148px] cursor-pointer transition-colors"
        )}
      >
        <span className="flex items-center gap-2 min-w-0">
          {selectedModel && (
            <img
              src={selectedModel.logo}
              alt={selectedModel.title}
              width={14}
              height={14}
              className="w-3.5 h-3.5 object-contain rounded-sm opacity-90"
            />
          )}
          <span className="font-mono text-[11px] text-bone tracking-wide truncate">
            {selectedModel ? selectedModel.title : "Select model"}
          </span>
        </span>
      </SelectTrigger>
      <SelectContent className="bg-surface !border-rule">
        {models.map((m) => (
          <SelectItem
            key={m.model}
            value={m.slug}
            className="!text-bone focus:!bg-surface-2 focus:!text-bone"
          >
            <span className="flex items-center gap-2">
              <img
                src={m.logo}
                alt={m.title}
                width={14}
                height={14}
                className="w-3.5 h-3.5 object-contain rounded-sm"
              />
              <span className="font-mono text-[11px] text-bone tracking-wide truncate">
                {m.title}
                {m.hasReasoning && (
                  <span title="Has reasoning" className="ml-1.5 text-ember">
                    ✦
                  </span>
                )}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
