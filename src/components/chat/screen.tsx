"use client";

import { useChat } from "@ai-sdk/react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type UIMessage, DefaultChatTransport } from "ai";
import {
  CodeInterpreterResponseData,
  CodeInterpreterOutput,
} from "@/lib/coding";
import { DbMessage } from "@/lib/chat-store";
import {
  cn,
  extractCodeFromText,
  formatLLMTimestamp,
  UploadedFile,
} from "@/lib/utils";
import { useLLMModel } from "@/hooks/useLLMModel";
import { useDraftedInput } from "@/hooks/useDraftedInput";
import { CHAT_MODELS } from "@/lib/models";
import { Markdown, CodeBlock } from "@/components/render";
import { Composer } from "./composer";
import { Figure, RunMonitor, Stdout, Trace } from "./tools";
import { LiveDot, Skeleton } from "@/components/ui";

/* ─────────────────────────────────────────────────────────────
   screen — the chat: streaming transcript, the code-execution
   loop, the context readout, the composer. business logic is the
   ai sdk 7 migration, untouched; the dress is lumen.
   ───────────────────────────────────────────────────────────── */

const MAX_AUTO_ERROR_RESOLUTION_ATTEMPTS = 2;
const BOTTOM_THRESHOLD = 48;

type Message = UIMessage & {
  content?: string;
  createdAt?: Date;
  isThinking?: boolean;
  toolCall?: {
    toolInvocation: {
      toolName: string;
      args: string;
      state: string;
      // loosely-typed: real results are CodeInterpreterResponseData, but the
      // cancelled/failed UI states construct partial result objects
      result?: unknown;
    };
  };
  duration?: number;
  model?: string;
  isAutoErrorResolution?: boolean;
};

function getMessageText(message: Message): string {
  if (message.content) return message.content;
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function friendlyRequestError(error: Error): string {
  const raw = error?.message ?? "";
  if (/too many messages|daily limit|rate.?limit|429/i.test(raw)) {
    return "today's message credits are spent. the window resets daily; the count lives in the rail.";
  }
  return raw || "the request failed. please try again.";
}

/* follow the stream while the reader is at the bottom; never force-resume */
function useChatScroll(followKey: string | number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  const atBottomRef = useRef(true);
  const lastScrollAt = useRef(0);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    endRef.current?.scrollIntoView({ behavior });
    lastScrollAt.current = Date.now();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const bottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD;
      atBottomRef.current = bottom;
      setAtBottom(bottom);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // land at the end of a restored conversation once, without animation
  useEffect(() => {
    const el = containerRef.current;
    if (el && el.scrollHeight > 0) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    if (!atBottomRef.current) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior =
      reduce || Date.now() - lastScrollAt.current < 400 ? "auto" : "smooth";
    const raf = requestAnimationFrame(() => scrollToBottom(behavior));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followKey]);

  return { containerRef, endRef, atBottom, scrollToBottom };
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : "Copy message"}
      className="label hover:text-ink transition-colors cursor-pointer"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          if (timeout.current) clearTimeout(timeout.current);
          timeout.current = setTimeout(() => setCopied(false), 2000);
        } catch {
          // clipboard unavailable
        }
      }}
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}

function AutoRepairBanner({ waiting }: { waiting: boolean }) {
  return (
    <div className="mt-4 max-w-[580px] px-4 py-3 border border-error/40 bg-error/5 rounded-card">
      <p className="label text-error mb-1">errata</p>
      <p className="text-[13.5px] leading-[1.6] text-ink-2">
        a small mistake in the previous code. drafting a correction now; the
        model usually self-corrects within one or two attempts.
      </p>
      {waiting && (
        <p className="label mt-2 flex items-center gap-2">
          <LiveDot tone="accent" /> drafting
        </p>
      )}
    </div>
  );
}

export function ChatScreen({
  uploadedFile,
  id,
  initialMessages,
}: {
  uploadedFile: UploadedFile;
  id?: string;
  initialMessages?: DbMessage[];
}) {
  const { selectedModelSlug } = useLLMModel();

  const modelContextLength = CHAT_MODELS.find(
    (m) => m.slug === selectedModelSlug
  )?.contextLength;

  const attachedFiles = uploadedFile.content
    ? [
        {
          name: uploadedFile.url?.startsWith("/")
            ? uploadedFile.url
            : "/products-100.csv",
          encoding: "utf-8",
          content: uploadedFile.content,
        },
      ]
    : undefined;

  const { messages, setMessages, sendMessage, regenerate, clearError, stop, status, error } =
    useChat<Message>({
      id,
      messages: initialMessages || [],
      transport: new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ id: chatId, messages: chatMessages }) => {
          const last = chatMessages[chatMessages.length - 1];
          const text = last.parts
            .filter((p) => p.type === "text")
            .map((p) => (p as { text: string }).text)
            .join("");
          return { body: { message: text, id: chatId, model: selectedModelSlug } };
        },
      }),
      onError: () => {
        // the failed send stays in the transcript; retry regenerates from it
        setIsCodeRunning(false);
      },
      onFinish: async ({ message }) => {
        const code = extractCodeFromText(getMessageText(message as Message));

        if (code) {
          setMessages((prev) => [
            ...prev,
            {
              id: message.id + "_tool_call",
              role: "assistant",
              content: "",
              parts: [{ type: "text", text: "" }],
              isThinking: true,
              toolCall: {
                toolInvocation: { toolName: "runCode", args: code, state: "start" },
              },
            } as Message,
          ]);

          setIsCodeRunning(true);
          codeAbort.current = new AbortController();
          let result;
          try {
            const response = await fetch("/api/coding", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code, id, files: attachedFiles }),
              signal: codeAbort.current.signal,
            });

            if (!response.ok) {
              let serverMessage = `Code execution failed (HTTP ${response.status}).`;
              try {
                const data = await response.json();
                serverMessage = data?.error || data?.message || serverMessage;
              } catch {
                // non-json body — keep the http fallback message
              }
              if (response.status === 429) {
                // rate-limited: surface it, and don't burn auto-retry credits
                setIsCodeRunning(false);
                codeAbort.current = null;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === message.id + "_tool_call"
                      ? {
                          ...msg,
                          isThinking: false,
                          content: "Code execution limit reached.",
                          parts: [{ type: "text", text: "Code execution limit reached." }],
                          toolCall: {
                            toolInvocation: {
                              toolName: "runCode",
                              args: code,
                              state: "result",
                              result: { outputs: [{ type: "error", data: serverMessage }] },
                            },
                          },
                        } as Message
                      : msg
                  )
                );
                return;
              }
              failToolCall(message.id, code, serverMessage);
              return;
            }

            result = await response.json();
          } catch (err) {
            const e = err as { name?: string; message?: string };
            if (e.name === "AbortError") {
              setToolCall(message.id, code, "Code execution cancelled.", { outputs: [] });
              setIsCodeRunning(false);
              codeAbort.current = null;
              return;
            }
            failToolCall(message.id, code, e.message ?? "Unknown error");
            return;
          }

          const errorOutput = Array.isArray(result.outputs)
            ? result.outputs.find(
                (o: CodeInterpreterOutput) => o.type === "error" || o.type === "stderr"
              )
            : undefined;
          const responseErrors = Array.isArray(result.errors) ? result.errors : [];
          const errorOccurred =
            Boolean(errorOutput) ||
            result.status !== "success" ||
            Boolean(result.error_message) ||
            responseErrors.length > 0;
          const errorMessage =
            errorOutput?.data ||
            result.error_message ||
            responseErrors[0]?.message ||
            "Unknown error";

          if (errorOccurred) {
            if (autoRepairAttempts.current < MAX_AUTO_ERROR_RESOLUTION_ATTEMPTS) {
              autoRepairAttempts.current += 1;
              const prompt = `The following error occurred when running the code you provided: ${errorMessage}. Please try to fix the code and try again.`;
              setTimeout(() => {
                sendMessage(
                  { text: prompt },
                  {
                    headers: {
                      "Content-Type": "application/json",
                      "X-Auto-Error-Resolved": "true",
                    },
                  }
                );
              }, 1000);
            } else {
              console.warn("Auto error resolution limit reached for this chat.");
            }
          } else {
            autoRepairAttempts.current = 0;
          }

          setToolCall(
            message.id,
            code,
            errorOccurred ? "Code execution failed." : "Code execution complete.",
            result
          );
          setIsCodeRunning(false);
          codeAbort.current = null;
        }
      },
    });

  const [isCodeRunning, setIsCodeRunning] = useState(false);
  const codeAbort = useRef<AbortController | null>(null);
  const autoRepairAttempts = useRef(0);
  const [creditsSignal, setCreditsSignal] = useState(0);

  /* tool-call helpers (the setMessages shapes the loop needs) */
  const setToolCall = (
    messageId: string,
    code: string,
    content: string,
    result: unknown
  ) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId + "_tool_call"
          ? {
              ...msg,
              isThinking: false,
              content,
              parts: [{ type: "text", text: content }],
              toolCall: {
                toolInvocation: {
                  toolName: "runCode",
                  args: code,
                  state: "result",
                  result,
                },
              },
            } as Message
          : msg
      )
    );
  };
  const failToolCall = (messageId: string, code: string, messageText: string) => {
    setToolCall(messageId, code, `Code execution failed: ${messageText}`, {
      outputs: [{ type: "error", data: messageText }],
    });
    setIsCodeRunning(false);
    codeAbort.current = null;
  };

  const didSendPending = useRef(false);
  useEffect(() => {
    if (!didSendPending.current && messages.length === 0 && typeof window !== "undefined") {
      const pending = localStorage.getItem("pendingMessage");
      if (pending) {
        sendMessage({ text: pending });
        localStorage.removeItem("pendingMessage");
        didSendPending.current = true;
      }
    }
  }, [sendMessage, messages.length]);

  const [inputValue, setInputValue, clearInputValue] = useDraftedInput(
    id ? `chatInputDraft-${id}` : "chatInputDraft"
  );

  const prevStatus = useRef(status);
  useEffect(() => {
    if (prevStatus.current === "streaming" && status === "ready") {
      setCreditsSignal((s) => s + 1);
    }
    prevStatus.current = status;
  }, [status]);

  const lastMessage = messages.length
    ? (messages[messages.length - 1] as Message)
    : undefined;
  const followKey = `${messages.length}|${isCodeRunning ? "r" : "i"}|${
    lastMessage ? getMessageText(lastMessage).length : 0
  }|${status}`;
  const { containerRef, endRef, atBottom, scrollToBottom } = useChatScroll(followKey);

  // approximate token count: 1 token ≈ 3 chars
  const tokenInfo = useMemo(() => {
    if (!modelContextLength) return { tokens: 0, percent: 0, max: 0 };
    const text = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => getMessageText(m as Message))
      .join("\n");
    const tokens = Math.ceil(text.length / 3);
    return {
      tokens,
      percent: Math.min(100, (tokens / modelContextLength) * 100),
      max: modelContextLength,
    };
  }, [messages, modelContextLength]);

  const isBusy = status === "submitted" || status === "streaming" || isCodeRunning;
  const showRequestError = !!error && status !== "submitted" && status !== "streaming";
  const autoRepairActive =
    lastMessage?.role === "user" &&
    getMessageText(lastMessage).startsWith(
      "The following error occurred when running the code you provided:"
    );

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col w-full h-dvh">
      <div className="relative flex flex-col md:ml-14 flex-1 min-h-0">
        {/* context readout */}
        <div className="w-full flex justify-center py-3 z-10 border-b border-rule/60">
          <div className="w-full max-w-3xl px-4 md:px-6 flex items-center justify-between">
            <span className="label">
              context <span className="readout text-ink-2">{tokenInfo.percent.toFixed(1)}%</span>
            </span>
            <span className="readout text-muted">
              {tokenInfo.tokens.toLocaleString()} / {tokenInfo.max.toLocaleString()} tokens
            </span>
          </div>
        </div>

        {/* transcript */}
        <div
          className="flex-1 overflow-y-auto px-4 md:px-6 pb-4 flex flex-col mx-auto max-w-3xl w-full"
          ref={containerRef}
          role="log"
          aria-live="polite"
          aria-label="Conversation"
        >
          {messages.length === 0 && !isBusy && !error && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 fade-in">
              <p className="display text-[32px] md:text-[40px] text-ink leading-[1.02]">
                plot something.
              </p>
              <p className="label mt-4 max-w-[38ch] leading-[1.7]">
                ask a question about the attached dataset below; the model
                writes the python and hands back the chart.
              </p>
            </div>
          )}

          {messages.map((message, idx) => {
            const current = message as Message;
            const results =
              current.toolCall?.toolInvocation.toolName === "runCode"
                ? (current.toolCall?.toolInvocation.result as CodeInterpreterResponseData)
                : undefined;
            const stdOut = results?.outputs?.find((r) => r.type === "stdout");
            const errorCode = results?.outputs?.find(
              (r) => r.type === "error" || r.type === "stderr"
            );
            const image = results?.outputs?.find(
              (r) =>
                r.type === "display_data" &&
                typeof r.data === "object" &&
                Boolean(r.data["image/png"])
            );
            const isLast = messages.length - 1 === idx;
            const isUser = current.role === "user";
            const reasoning = current.parts.find((p) => p.type === "reasoning");
            const code =
              current.toolCall?.toolInvocation.toolName === "runCode"
                ? (current.toolCall.toolInvocation.args as string)
                : null;

            return (
              <div
                key={current.id}
                className={cn("flex flex-col fade-in", isUser ? "items-end" : "items-start", idx === 0 ? "pt-4" : "mt-8")}
              >
                {isUser ? (
                  getMessageText(current).startsWith(
                    "The following error occurred when running the code you provided:"
                  ) ? (
                    <AutoRepairBanner waiting={isLast && isBusy} />
                  ) : (
                    <div className="flex flex-col items-end gap-1 max-w-[80%] md:max-w-[60%]">
                      <span className="label">you</span>
                      <div className="px-4 py-2.5 bg-paper-2 border border-rule rounded-card text-ink text-[14.5px] leading-[1.55] text-right">
                        {getMessageText(current)}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="label text-ink">datagraph</span>
                      {current?.model && (
                        <span className="readout text-muted">
                          {
                            CHAT_MODELS.find(
                              (m) => m.model === current.model || m.slug === current.model
                            )?.title?.toLowerCase()
                          }
                        </span>
                      )}
                    </div>

                    {reasoning?.text ? <ReasoningNote text={reasoning.text} over={!!getMessageText(current)} /> : null}

                    <div className="prose">
                      <Markdown id={current.id} content={getMessageText(current)} />
                    </div>

                    {current.isThinking && <RunMonitor />}

                    {current.toolCall?.toolInvocation.state === "result" && (
                      <div className="mt-4 space-y-3">
                        {code && (
                          <CodeBlock
                            code={code}
                            language="python"
                            filename="solution · python"
                            status={errorCode ? "error" : "ok"}
                          />
                        )}
                        {errorCode ? (
                          <Trace data={errorCode.data as string} />
                        ) : (
                          <>
                            {stdOut && <Stdout data={stdOut.data as string} />}
                            {image && (
                              <Figure imageData={image.data as { [key: string]: string }} />
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {getMessageText(current) && (
                      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-rule/60">
                        <span className="readout text-muted" suppressHydrationWarning>
                          {typeof current.duration === "number" && (
                            <span>{current.duration.toFixed(2)}s · </span>
                          )}
                          {current.createdAt && formatLLMTimestamp(current.createdAt)}
                        </span>
                        <CopyButton text={getMessageText(current)} />
                      </div>
                    )}
                  </div>
                )}

                {isLast && status === "submitted" && !autoRepairActive && (
                  <div className="w-full mt-3 flex items-center gap-2.5">
                    <LiveDot tone="accent" />
                    <p className="label">
                      reading<span className="caret" />
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {/* request-level failure */}
          {showRequestError && (
            <div className="mt-6 fade-in border border-error/40 bg-error/5 rounded-card overflow-hidden">
              <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[13px] leading-[1.6] text-ink-2 max-w-[52ch]">
                  {friendlyRequestError(error as Error)}
                </p>
                {!isBusy && (
                  <button
                    type="button"
                    onClick={() => {
                      clearError();
                      regenerate();
                    }}
                    className="btn min-h-9 text-[13px]"
                  >
                    retry
                  </button>
                )}
              </div>
            </div>
          )}

          <div ref={endRef} />

          {!atBottom && messages.length > 0 && (
            <div className="sticky bottom-4 z-10 mt-4 flex justify-center pointer-events-none">
              <button
                type="button"
                onClick={() => scrollToBottom("smooth")}
                className="pointer-events-auto inline-flex items-center gap-2 px-3.5 py-2 bg-paper-2 border border-rule rounded-pill shadow-card label hover:text-ink cursor-pointer"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M5 1v8M1 5.5 5 9l4-3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
                </svg>
                jump to latest
              </button>
            </div>
          )}
        </div>

        <Composer
          value={inputValue}
          onChange={setInputValue}
          onSend={() => {
            autoRepairAttempts.current = 0;
            const text = inputValue;
            clearInputValue();
            sendMessage({ text });
          }}
          onStop={() => {
            if (status === "submitted" || status === "streaming") return stop();
            if (isCodeRunning && codeAbort.current) {
              codeAbort.current.abort();
              setIsCodeRunning(false);
            }
          }}
          isAnswering={isBusy}
          uploadedFile={
            uploadedFile && {
              url: uploadedFile.url,
              content: uploadedFile.content,
              csvHeaders: uploadedFile.csvHeaders,
              csvRows: uploadedFile.csvRows,
            }
          }
          fixedOnMobile
          creditsSignal={creditsSignal}
        />
      </div>
    </div>
  );
}

/* margin notes — a native disclosure, lowercased */
function ReasoningNote({ text, over }: { text: string; over: boolean }) {
  const [open, setOpen] = useState(!over);
  const [wasOver, setWasOver] = useState(over);

  // collapse once the answer starts streaming — state adjusted during render
  // (https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
  if (over !== wasOver) {
    setWasOver(over);
    if (over) setOpen(false);
  }

  return (
    <div className="mb-4">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-pill border label transition-colors cursor-pointer",
          open
            ? "text-ink border-rule-2 bg-paper-3"
            : "text-muted border-rule hover:text-ink"
        )}
      >
        {open ? "hide" : "show"} margin notes
      </button>
      {open && (
        <div className="mt-2 border-l border-accent pl-4 ml-1 readout leading-[1.7] whitespace-pre-wrap">
          {text}
        </div>
      )}
    </div>
  );
}

/* chat page skeleton mirror */
export function ChatSkeleton() {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col w-full h-dvh">
      <div className="flex flex-col md:ml-14 flex-1 min-h-0">
        <div className="w-full flex justify-center py-3 border-b border-rule/60">
          <div className="w-full max-w-3xl px-4 md:px-6 flex items-center justify-between">
            <span className="label flex items-center gap-2">
              <LiveDot tone="accent" /> loading session
            </span>
            <span className="readout text-muted">0 / 0 tokens</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 md:px-6 pt-4 pb-4 flex flex-col mx-auto max-w-3xl w-full gap-8 fade-in">
          <div className="flex flex-col items-end gap-1.5">
            <span className="label">you</span>
            <Skeleton className="px-4 py-3 rounded-card min-w-[120px] h-10 w-[60%]" />
          </div>
          {[["80%", "60%"], ["70%", "90%", "50%"]].map((lines, i) => (
            <div key={i} className="flex flex-col items-start w-full">
              <div className="flex items-center gap-2 mb-3">
                <span className="label text-ink">datagraph</span>
              </div>
              <div className="space-y-2.5 w-full max-w-xl">
                {lines.map((w, j) => (
                  <Skeleton key={j} className="h-3" style={{ width: w }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
