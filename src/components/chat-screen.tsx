"use client";

import { useChat } from "@ai-sdk/react";
import React, { useEffect, useState, useRef } from "react";
import { Header } from "@/components/header";
import { ChatInput } from "@/components/ChatInput";
import { MemoizedMarkdown } from "./MemoizedMarkdown";
import {
  CodeInterpreterResponseData,
  CodeInterpreterOutput,
} from "@/lib/coding";
import { type UIMessage, DefaultChatTransport } from "ai";
import { ImageFigure } from "./chatTools/ImageFigure";
import { TerminalOutput } from "./chatTools/TerminalOutput";
import { ErrorOutput } from "./chatTools/ErrorOutput";
import { useAutoScroll } from "../hooks/useAutoScroll";
import { useDraftedInput } from "../hooks/useDraftedInput";
import { DbMessage } from "@/lib/chat-store";
import {
  cn,
  extractCodeFromText,
  formatLLMTimestamp,
  UploadedFile,
} from "@/lib/utils";
import { ErrorBanner } from "./ui/ErrorBanner";
import { ThinkingIndicator } from "./ui/ThinkingIndicator";
import ReasoningAccordion from "./ReasoningAccordion";
import { useLLMModel } from "@/hooks/useLLMModel";
import { CodeRunning } from "./chatTools/CodeRunning";
import { CHAT_MODELS } from "@/lib/models";
import { CodeRender } from "./code-render";

const MAX_AUTO_ERROR_RESOLUTION_ATTEMPTS = 2;

export type Message = UIMessage & {
  content?: string;
  createdAt?: Date;
  isThinking?: boolean;
  isUser?: boolean;
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
    (model) => model.slug === selectedModelSlug
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

  const { messages, setMessages, sendMessage, stop, status } = useChat<Message>({
    id,
    messages: initialMessages || [],
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ id: chatId, messages: chatMessages }) => {
        const lastMessage = chatMessages[chatMessages.length - 1];
        const text = lastMessage.parts
          .filter((p) => p.type === "text")
          .map((p) => (p as { text: string }).text)
          .join("");
        return {
          body: {
            message: text,
            id: chatId,
            model: selectedModelSlug,
          },
        };
      },
    }),
    onFinish: async ({ message }) => {
      const code = extractCodeFromText(getMessageText(message as Message));

      if (code) {
        setMessages((prev) => {
          return [
            ...prev,
            {
              id: message.id + "_tool_call",
              role: "assistant",
              content: "",
              parts: [{ type: "text", text: "" }],
              isThinking: true,
              toolCall: {
                toolInvocation: {
                  toolName: "runCode",
                  args: code,
                  state: "start",
                },
              },
            } as Message,
          ];
        });

        setIsCodeRunning(true);
        codeAbortController.current = new AbortController();
        let result;
        try {
          const response = await fetch("/api/coding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, id, files: attachedFiles }),
            signal: codeAbortController.current.signal,
          });

          result = await response.json();
        } catch (error) {
          const err = error as { name?: string; message?: string };
          const messageText = err.message ?? "Unknown error";
          if (err.name === "AbortError") {
            setIsCodeRunning(false);
            setMessages((prev) =>
              prev.map((msg) => {
                if (msg.id === message.id + "_tool_call") {
                  return {
                    ...msg,
                    isThinking: false,
                    content: "Code execution cancelled.",
                    parts: [
                      { type: "text", text: "Code execution cancelled." },
                    ],
                    toolCall: {
                      toolInvocation: {
                        toolName: "runCode",
                        args: code,
                        state: "result",
                        result: { outputs: [] },
                      },
                    },
                  } as Message;
                }
                return msg;
              })
            );
            return;
          } else {
            setIsCodeRunning(false);
            setMessages((prev) =>
              prev.map((msg) => {
                if (msg.id === message.id + "_tool_call") {
                  return {
                    ...msg,
                    isThinking: false,
                    content: `Code execution failed: ${messageText}`,
                    parts: [
                      {
                        type: "text",
                        text: `Code execution failed: ${messageText}`,
                      },
                    ],
                    toolCall: {
                      toolInvocation: {
                        toolName: "runCode",
                        args: code,
                        state: "result",
                        result: {
                          outputs: [{ type: "error", data: messageText }],
                        },
                      },
                    },
                  } as Message;
                }
                return msg;
              })
            );
            return;
          }
        }

        const errorOutput = Array.isArray(result.outputs)
          ? result.outputs.find(
              (output: CodeInterpreterOutput) =>
                output.type === "error" || output.type === "stderr"
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
          if (
            autoErrorResolutionAttemptsRef.current <
            MAX_AUTO_ERROR_RESOLUTION_ATTEMPTS
          ) {
            autoErrorResolutionAttemptsRef.current += 1;

            const errorResolutionPrompt = `The following error occurred when running the code you provided: ${errorMessage}. Please try to fix the code and try again.`;

            setTimeout(() => {
              sendMessage(
                { text: errorResolutionPrompt },
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
          autoErrorResolutionAttemptsRef.current = 0;
        }

        setMessages((prev) => {
          return prev.map((msg) => {
            if (msg.id === message.id + "_tool_call") {
              return {
                ...msg,
                isThinking: false,
                content: errorOccurred
                  ? "Code execution failed."
                  : "Code execution complete.",
                parts: [
                  {
                    type: "text",
                    text: errorOccurred
                      ? "Code execution failed."
                      : "Code execution complete.",
                  },
                ],
                toolCall: {
                  toolInvocation: {
                    toolName: "runCode",
                    args: code,
                    state: "result",
                    result: result,
                  },
                },
              } as Message;
            }
            return msg;
          });
        });
        setIsCodeRunning(false);
        codeAbortController.current = null;
      }
    },
  });

  const didAppendPending = React.useRef(false);
  useEffect(() => {
    if (
      !didAppendPending.current &&
      messages.length === 0 &&
      typeof window !== "undefined"
    ) {
      const pending = localStorage.getItem("pendingMessage");
      if (pending) {
        sendMessage({ text: pending });
        localStorage.removeItem("pendingMessage");
        didAppendPending.current = true;
      }
    }
  }, [sendMessage, messages.length]);

  const [inputValue, setInputValue, clearInputValue] = useDraftedInput(
    id ? `chatInputDraft-${id}` : "chatInputDraft"
  );

  const [isCodeRunning, setIsCodeRunning] = useState(false);
  const codeAbortController = useRef<AbortController | null>(null);
  const autoErrorResolutionAttemptsRef = useRef(0);
  const { messagesContainerRef, messagesEndRef } = useAutoScroll({
    status,
    isCodeRunning,
  });

  // Approximate token count: 1 token ≈ 3 chars
  const [tokenInfo, setTokenInfo] = useState({
    tokens: 0,
    percent: 0,
    max: modelContextLength || 0,
  });

  useEffect(() => {
    if (!modelContextLength) return;
    const text = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => getMessageText(m as Message))
      .join("\n");
    const approxTokens = Math.ceil(text.length / 3);
    const percent = Math.min(100, (approxTokens / modelContextLength) * 100);
    setTokenInfo({ tokens: approxTokens, percent, max: modelContextLength });
  }, [messages, modelContextLength]);

  return (
    <div className="min-h-screen bg-ink flex flex-col w-full h-screen relative">
      {/* atmospheric background */}
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-40" />

      <Header chatId={id} />

      {/* Context usage rail */}
      <div className="w-full flex justify-center py-3 z-10">
        <div className="w-full max-w-3xl px-4 md:ml-[80px]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-smoke flex items-center gap-2">
              <span
                className={cn(
                  "block size-1.5 rounded-full",
                  tokenInfo.percent > 80
                    ? "bg-rose"
                    : tokenInfo.percent > 50
                    ? "bg-saffron"
                    : "bg-moss"
                )}
              />
              Context · {tokenInfo.percent.toFixed(1)}%
            </span>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite tabular">
              {tokenInfo.tokens.toLocaleString()} / {tokenInfo.max.toLocaleString()} tokens
            </span>
          </div>
          <div className="w-full h-[2px] bg-rule rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500",
                tokenInfo.percent > 80
                  ? "bg-rose"
                  : tokenInfo.percent > 50
                  ? "bg-saffron"
                  : "bg-ember"
              )}
              style={{ width: `${tokenInfo.percent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative flex flex-col md:ml-[60px] flex-1 min-h-0">
        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-4 md:px-6 pb-4 flex flex-col mx-auto max-w-3xl w-full"
          ref={messagesContainerRef}
        >
          {messages.map((message, messageIdx) => {
            const currentMessage = message as Message;

            const codeResults =
              currentMessage.toolCall?.toolInvocation.toolName === "runCode"
                ? (currentMessage.toolCall?.toolInvocation
                    .result as CodeInterpreterResponseData)
                : undefined;

            const stdOut = codeResults?.outputs?.find(
              (result) => result.type === "stdout"
            );

            const errorCode = codeResults?.outputs?.find(
              (result) =>
                result.type === "error" || result.type === "stderr"
            );

            const imagePngBase64 = codeResults?.outputs?.find(
              (result) =>
                result.type === "display_data" &&
                typeof result.data === "object" &&
                Boolean(result.data["image/png"])
            );

            const isThisLastMessage = messages.length - 1 === messageIdx;

            const isUserMessage = currentMessage.role === "user";

            const reasoning = currentMessage.parts.find(
              (part) => part.type === "reasoning"
            );

            const code =
              currentMessage.toolCall?.toolInvocation.toolName === "runCode"
                ? (currentMessage.toolCall.toolInvocation.args as string)
                : null;

            return (
              <div
                key={currentMessage.id}
                className={cn(
                  "flex flex-col fade-in",
                  isUserMessage ? "items-end" : "items-start",
                  // first message: no top margin; otherwise leading rule
                  messageIdx === 0 ? "pt-4" : "mt-8"
                )}
              >
                {isUserMessage ? (
                  <>
                    {getMessageText(currentMessage).startsWith(
                      "The following error occurred when running the code you provided:"
                    ) ? (
                      <ErrorBanner isWaiting={isThisLastMessage} />
                    ) : (
                      <div className="flex flex-col items-end gap-1 max-w-[80%] md:max-w-[60%]">
                        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite mr-0.5">
                          ▸ You
                        </span>
                        <div className="px-4 py-2.5 rounded-sm bg-surface-2 border border-rule text-bone text-[14.5px] leading-[1.55] text-right">
                          {getMessageText(currentMessage)}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full">
                    {/* attribution */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ember flex items-center gap-2">
                        <span className="block size-1.5 rounded-full bg-ember" />
                        ▾ Datagraph
                      </span>
                      <span className="block w-6 h-[1px] bg-rule" />
                      {currentMessage?.model && (
                        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-smoke">
                          {
                            CHAT_MODELS.find(
                              (model) => model.model === currentMessage.model
                            )?.title
                          }
                        </span>
                      )}
                    </div>

                    <ReasoningAccordion
                      reasoning={reasoning}
                      isReasoningOver={
                        !!getMessageText(currentMessage) &&
                        getMessageText(currentMessage).length > 0
                      }
                    />

                    {/* main reply prose */}
                    <div className="prose-editorial">
                      <MemoizedMarkdown
                        id={currentMessage.id}
                        content={getMessageText(currentMessage)}
                      />
                    </div>

                    {/* tool call: code running indicator */}
                    {currentMessage.isThinking && <CodeRunning />}

                    {/* tool call: completed code execution */}
                    {currentMessage.toolCall?.toolInvocation.state === "result" && (
                      <div className="mt-4 space-y-3">
                        {/* echo the executed source */}
                        {code && (
                          <CodeRender
                            code={code}
                            language="python"
                            filename="solution · python"
                            status={errorCode ? "error" : "executed"}
                          />
                        )}
                        {/* outputs */}
                        {errorCode ? (
                          <ErrorOutput data={errorCode.data as string} />
                        ) : (
                          <>
                            {stdOut && (
                              <TerminalOutput data={stdOut.data as string} />
                            )}
                            {imagePngBase64 && (
                              <ImageFigure
                                imageData={
                                  imagePngBase64.data as {
                                    [key: string]: string;
                                  }
                                }
                              />
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* timestamp footnote */}
                    {currentMessage.role === "assistant" &&
                      currentMessage.createdAt && (
                        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-rule">
                          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite tabular">
                            {typeof currentMessage.duration === "number" && (
                              <span className="text-smoke">
                                {currentMessage.duration.toFixed(2)}s ·{" "}
                              </span>
                            )}
                            {formatLLMTimestamp(currentMessage.createdAt)}
                          </span>
                        </div>
                      )}
                  </div>
                )}

                {isThisLastMessage && status === "submitted" && (
                  <div className="w-full mt-3">
                    <ThinkingIndicator />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="md:max-w-3xl md:mx-auto w-full md:px-6 mt-auto">
          <ChatInput
            value={inputValue}
            onChange={(value) => setInputValue(value)}
            onSend={async () => {
              autoErrorResolutionAttemptsRef.current = 0;
              const newMessage = inputValue;
              clearInputValue();
              await sendMessage({ text: newMessage });
            }}
            uploadedFile={
              uploadedFile && {
                url: uploadedFile.url,
                content: uploadedFile.content,
                csvHeaders: uploadedFile.csvHeaders,
                csvRows: uploadedFile.csvRows,
              }
            }
            onStopLLM={() => {
              if (status === "submitted" || status === "streaming") {
                return stop();
              }
              if (isCodeRunning && codeAbortController.current) {
                codeAbortController.current.abort();
                setIsCodeRunning(false);
              }
            }}
            isLLMAnswering={
              status === "submitted" || status === "streaming" || isCodeRunning
            }
          />
        </div>
      </div>
    </div>
  );
}
