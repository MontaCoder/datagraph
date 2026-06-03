"use client";

import React from "react";
import {
  Prism as SyntaxHighlighter,
  createElement,
} from "react-syntax-highlighter";

/**
 * CodeRender — editorial code viewer.
 *
 * We bypass react-syntax-highlighter's bundled themes so the code renders
 * in our exact palette: bone text on ink, ember keywords/strings, smoke
 * comments. This keeps every code block visually consistent with the rest
 * of the typography on the page.
 */
const editorialTheme: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': {
    color: "var(--paper)",
    fontFamily: "var(--font-mono), ui-monospace, monospace",
    fontSize: "12.5px",
    lineHeight: 1.7,
    background: "transparent",
    textShadow: "none",
  },
  'pre[class*="language-"]': {
    color: "var(--paper)",
    fontFamily: "var(--font-mono), ui-monospace, monospace",
    fontSize: "12.5px",
    lineHeight: 1.7,
    background: "transparent",
    margin: 0,
    padding: 0,
    overflow: "auto",
    textShadow: "none",
  },
  comment: { color: "var(--smoke)", fontStyle: "italic" },
  prolog: { color: "var(--smoke)" },
  doctype: { color: "var(--smoke)" },
  cdata: { color: "var(--smoke)" },
  punctuation: { color: "var(--rule-strong)" },
  property: { color: "var(--storm)" },
  tag: { color: "var(--ember)" },
  boolean: { color: "var(--saffron)" },
  number: { color: "var(--saffron)" },
  constant: { color: "var(--saffron)" },
  symbol: { color: "var(--saffron)" },
  selector: { color: "var(--moss)" },
  "attr-name": { color: "var(--storm)" },
  string: { color: "var(--ember-soft)" },
  char: { color: "var(--ember-soft)" },
  builtin: { color: "var(--storm)" },
  inserted: { color: "var(--moss)" },
  operator: { color: "var(--paper)" },
  entity: { color: "var(--ember)" },
  url: { color: "var(--ember)" },
  ".language-css .token.string": { color: "var(--ember-soft)" },
  ".style .token.string": { color: "var(--ember-soft)" },
  atrule: { color: "var(--ember)" },
  "attr-value": { color: "var(--ember-soft)" },
  keyword: { color: "var(--ember)" },
  function: { color: "var(--bone)" },
  "class-name": { color: "var(--bone)" },
  regex: { color: "var(--ember-soft)" },
  important: { color: "var(--rose)" },
  variable: { color: "var(--storm)" },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
  parameter: { color: "var(--paper)" },
  deleted: { color: "var(--rose)" },
};

export function CodeRender({
  code,
  language,
  theme: _theme = "dark",
  filename,
  status,
}: {
  code: string;
  language: string;
  theme?: "light" | "dark";
  filename?: string;
  status?: "running" | "executed" | "error";
}) {
  return (
    <div className="border border-rule rounded-sm overflow-hidden bg-surface-2/60">
      {/* file chrome */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-rule bg-surface-2/80">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-smoke">
            ▸ {filename || `source · ${language}`}
          </span>
        </div>
        {status && (
          <span
            className={`font-mono text-[10px] tracking-[0.18em] uppercase flex items-center gap-1.5 ${
              status === "executed"
                ? "text-moss"
                : status === "error"
                ? "text-rose"
                : "text-ember"
            }`}
          >
            <span
              className={`block size-1.5 rounded-full ${
                status === "executed"
                  ? "bg-moss"
                  : status === "error"
                  ? "bg-rose"
                  : "bg-ember ember-pulse"
              }`}
            />
            {status}
          </span>
        )}
      </div>

      <SyntaxHighlighter
        language={language}
        style={editorialTheme}
        customStyle={{
          padding: "16px 18px",
          background: "transparent",
          fontSize: "12.5px",
          margin: 0,
        }}
        showLineNumbers={language === "python"}
        lineNumberStyle={{
          minWidth: "2.2em",
          paddingRight: "1em",
          color: "var(--graphite)",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          userSelect: "none",
          opacity: 0.7,
        }}
        lineProps={{ style: { flexWrap: "wrap" } }}
        renderer={({ rows, stylesheet, useInlineStyles }) => {
          return rows.map((row, index) => {
            const children = row.children;
            const lineNumberElement = children?.shift();
            if (lineNumberElement) {
              row.children = [
                lineNumberElement,
                {
                  children,
                  properties: {
                    className: [],
                    style: { whiteSpace: "pre-wrap", wordBreak: "break-all" },
                  },
                  tagName: "span",
                  type: "element",
                },
              ];
            }
            return createElement({
              node: row,
              stylesheet,
              useInlineStyles,
              key: index,
            });
          });
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
