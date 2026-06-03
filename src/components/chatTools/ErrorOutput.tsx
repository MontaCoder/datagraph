import React, { useState } from "react";

interface ErrorOutputProps {
  data: string;
}

/**
 * ErrorOutput — renders an execution error in the editorial chrome with
 * an expandable trace and a clear "Errata" eyebrow.
 */
export const ErrorOutput: React.FC<ErrorOutputProps> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const lines = data.split("\n");
  const isLong = lines.length > 10;
  const preview = lines.slice(0, 10).join("\n");

  return (
    <div className="mt-4 fade-in border border-rose/40 rounded-sm overflow-hidden bg-rose/5">
      <div className="flex items-center justify-between px-4 py-2 border-b border-rose/40 bg-rose/10">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-rose flex items-center gap-2">
          <span className="block size-1.5 rounded-full bg-rose" />
          ▸ Errata · execution failed
        </span>
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-rose/70">
          {lines.length} lines
        </span>
      </div>
      <div className="px-4 py-3 max-h-[280px] overflow-y-auto">
        <pre className="font-mono text-[12.5px] leading-[1.6] text-rose/90 whitespace-pre-wrap">
          {expanded || !isLong ? data : preview}
        </pre>
      </div>
      {isLong && (
        <button
          className="w-full px-4 py-2.5 border-t border-rose/40 bg-rose/5 hover:bg-rose/10 transition-colors font-mono text-[10px] tracking-[0.18em] uppercase text-rose"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "▾ Show less" : `▸ Show ${lines.length - 10} more lines`}
        </button>
      )}
    </div>
  );
};
