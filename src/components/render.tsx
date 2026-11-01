"use client";

import React, { Fragment, memo, useMemo } from "react";
import { marked, type Token, type Tokens } from "marked";
import { cn } from "@/lib/utils";
import { Panel } from "@/components/ui";

/* ─────────────────────────────────────────────────────────────
   render — how model output becomes pixels. One tokenizer + code
   block (replaces react-syntax-highlighter, ~1.1MB) and one
   marked→React markdown renderer (replaces react-markdown).
   ───────────────────────────────────────────────────────────── */

type SpanKind = "plain" | "kw" | "str" | "com" | "num" | "fn" | "dec";

const SPAN_CLASS: Record<SpanKind, string> = {
  plain: "text-ink-2",
  kw: "text-accent-2",
  str: "text-ink",
  com: "text-muted italic",
  num: "text-ink",
  fn: "text-accent-2",
  dec: "text-muted",
};

const PY_RE =
  /("""[\s\S]*?"""|'''[\s\S]*?''')|(#[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(@[A-Za-z_][\w.]*)|\b(False|None|True|and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b|\b([A-Za-z_]\w*)(?=\s*\()|(\b\d+(?:\.\d+)?\b)/g;
const PY_KINDS: SpanKind[] = ["str", "com", "str", "dec", "kw", "fn", "num"];

const SH_RE =
  /(#[^\n]*)|("(?:\\.|[^"\\])*"|'[^']*')|(\$\{?\w+\}?)|(--[a-zA-Z-]+)|\b(if|then|else|elif|fi|for|while|do|done|in|case|esac|function|echo|cd|export|source|pip|pip3|python|python3|ls|cat|mkdir|rm|cp|mv)\b|\b(\d+(?:\.\d+)?\b)/g;
const SH_KINDS: SpanKind[] = ["com", "str", "num", "fn", "kw", "num"];

function tokenize(src: string, re: RegExp, kinds: SpanKind[]): { text: string; kind: SpanKind }[] {
  const spans: { text: string; kind: SpanKind }[] = [];
  let last = 0;
  re.lastIndex = 0;
  for (let m = re.exec(src); m; m = re.exec(src)) {
    if (m.index > last) spans.push({ text: src.slice(last, m.index), kind: "plain" });
    for (let g = 1; g < m.length; g++) {
      if (m[g] !== undefined) {
        spans.push({ text: m[g], kind: kinds[g - 1] });
        break;
      }
    }
    last = m.index + m[0].length;
    if (m[0].length === 0) re.lastIndex++; // zero-width safety
  }
  if (last < src.length) spans.push({ text: src.slice(last), kind: "plain" });
  return spans;
}

function highlight(code: string, language: string): { text: string; kind: SpanKind }[] {
  if (language === "python") return tokenize(code, PY_RE, PY_KINDS);
  if (language === "bash" || language === "sh" || language === "shell")
    return tokenize(code, SH_RE, SH_KINDS);
  return [];
}

export function CodeBlock({
  code,
  language = "python",
  filename,
  status,
  className,
}: {
  code: string;
  language?: string;
  filename?: string;
  status?: "running" | "ok" | "error";
  className?: string;
}) {
  const spans = highlight(code, language);

  return (
    <Panel
      label={filename || `source, ${language}`}
      live={status === "running"}
      right={
        status ? (
          <span
            className={cn(
              "readout",
              status === "ok" && "text-success",
              status === "error" && "text-error",
              status === "running" && "text-accent"
            )}
          >
            {status}
          </span>
        ) : undefined
      }
      className={className}
      bodyClassName="overflow-x-auto"
    >
      <pre className="readout text-ink-2 px-4 py-3.5 whitespace-pre min-w-max leading-[1.7]">
        {spans.length === 0
          ? code
          : spans.map((s, i) => (
              <span key={i} className={SPAN_CLASS[s.kind]}>
                {s.text}
              </span>
            ))}
      </pre>
    </Panel>
  );
}

/* ═══ markdown — lexed with marked, rendered as React elements.
   Raw HTML is dropped; links open safely; blocks are memoized
   individually so streaming only re-renders the tail. ═══ */

marked.use({ gfm: true, breaks: false });

function renderInline(tokens: Token[] | undefined, keyPrefix: string): React.ReactNode[] {
  if (!tokens) return [];
  return tokens.map((t, i) => {
    const key = `${keyPrefix}-${i}`;
    switch (t.type) {
      case "text": {
        const tok = t as Tokens.Text & { tokens?: Token[] };
        return <Fragment key={key}>{renderInline(tok.tokens ?? [t], key)}</Fragment>;
      }
      case "escape":
        return <span key={key}>{(t as Tokens.Escape).text}</span>;
      case "em":
        return <em key={key}>{renderInline((t as Tokens.Em).tokens, key)}</em>;
      case "strong":
        return <strong key={key}>{renderInline((t as Tokens.Strong).tokens, key)}</strong>;
      case "del":
        return <del key={key}>{renderInline((t as Tokens.Del).tokens, key)}</del>;
      case "codespan": {
        const tok = t as Tokens.Codespan;
        return (
          <code
            key={key}
            className="mono text-[12.5px] bg-paper-3 border border-rule px-1.5 py-0.5 text-accent"
          >
            {tok.text}
          </code>
        );
      }
      case "link": {
        const tok = t as Tokens.Link;
        const external = /^https?:\/\//.test(tok.href);
        return (
          <a
            key={key}
            href={tok.href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {renderInline(tok.tokens, key)}
          </a>
        );
      }
      case "image": {
        const tok = t as Tokens.Image;
        return (
          <a key={key} href={tok.href} target="_blank" rel="noopener noreferrer">
            {tok.text || tok.href}
          </a>
        );
      }
      case "br":
        return <br key={key} />;
      case "html":
        return null; // raw HTML is dropped, matching react-markdown defaults
      default:
        return <span key={key}>{"raw" in t ? (t as { raw: string }).raw : ""}</span>;
    }
  });
}

function renderBlock(token: Token, key: string): React.ReactNode {
  switch (token.type) {
    case "space":
      return null;
    case "heading": {
      const tok = token as Tokens.Heading;
      const Tag = (`h${Math.min(tok.depth, 3)}` as "h1" | "h2" | "h3");
      return <Tag key={key}>{renderInline(tok.tokens, key)}</Tag>;
    }
    case "code": {
      const tok = token as Tokens.Code;
      const lang = (tok.lang || "").split(/\s+/)[0] || "text";
      return (
        <CodeBlock key={key} code={tok.text.replace(/\n$/, "")} language={lang} className="my-3" />
      );
    }
    case "table": {
      const tok = token as Tokens.Table;
      return (
        <table key={key}>
          <thead>
            <tr>
              {tok.header.map((cell, i) => (
                <th key={i}>{renderInline(cell.tokens, `${key}-h${i}`)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tok.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c}>{renderInline(cell.tokens, `${key}-${r}-${c}`)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    case "hr":
      return <hr key={key} />;
    case "blockquote": {
      const tok = token as Tokens.Blockquote;
      return <blockquote key={key}>{tok.tokens.map((t, i) => renderBlock(t, `${key}-${i}`))}</blockquote>;
    }
    case "list": {
      const tok = token as Tokens.List;
      const Tag = tok.ordered ? "ol" : "ul";
      return (
        <Tag key={key}>
          {tok.items.map((item, i) => (
            <li key={i}>{item.tokens.map((t, j) => renderBlock(t, `${key}-${i}-${j}`))}</li>
          ))}
        </Tag>
      );
    }
    case "html":
      return null;
    case "text":
    case "paragraph":
    default: {
      const tok = token as Tokens.Paragraph & { tokens?: Token[] };
      return <p key={key}>{renderInline(tok.tokens, key)}</p>;
    }
  }
}

const MarkdownBlock = memo(
  function MarkdownBlock({ content }: { content: string }) {
    const tokens = useMemo(() => marked.lexer(content), [content]);
    return <>{tokens.map((t, i) => renderBlock(t, `b${i}`))}</>;
  },
  (prev, next) => prev.content === next.content
);

/**
 * Markdown — block-memoized chat markdown. `id` scopes block keys so a
 * streaming message only re-renders its last (unterminated) block.
 */
export const Markdown = memo(function Markdown({
  content,
  id,
}: {
  content?: string;
  id: string;
}) {
  const blocks = useMemo(
    () => (content ? marked.lexer(content).map((t) => t.raw) : []),
    [content]
  );
  return blocks.map((block, index) => (
    <MarkdownBlock key={`${id}-block-${index}`} content={block} />
  ));
});
