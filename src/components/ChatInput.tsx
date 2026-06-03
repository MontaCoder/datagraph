"use client";

import type React from "react";
import { useUserLimits } from "@/hooks/UserLimitsContext";
import { PromptInput } from "./PromptInput";
import { UploadedFile } from "@/lib/utils";

/**
 * ChatInput — wrapper for the PromptInput in the chat-screen context.
 * Pinned to the bottom on mobile; flows naturally on desktop.
 */
export function ChatInput({
  isLLMAnswering,
  value,
  onChange,
  onSend,
  uploadedFile,
  onStopLLM,
  placeholder = "Ask a follow-up…",
}: {
  isLLMAnswering: boolean;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStopLLM: () => void;
  uploadedFile?: UploadedFile;
  placeholder?: string;
}) {
  const { refetch } = useUserLimits();

  const handleSendMessage = async () => {
    if (value.trim() === "") return;
    onSend();
    setTimeout(() => {
      refetch();
    }, 1000);
  };

  return (
    <>
      {/* mobile spacer so messages don't hide behind fixed input */}
      <div className="h-[140px] w-full md:hidden" />

      {/* desktop: in-flow at the bottom of chat. mobile: fixed bottom */}
      <div
        className="
          fixed bottom-0 inset-x-0 z-20 px-4 pt-3 pb-4 bg-gradient-to-t from-ink via-ink to-transparent
          md:relative md:bottom-auto md:inset-x-auto md:px-0 md:pt-0 md:pb-5 md:bg-transparent md:from-transparent
        "
      >
        <div className="w-full max-w-3xl mx-auto md:px-0">
          <PromptInput
            isLLMAnswering={isLLMAnswering}
            value={value}
            onChange={onChange}
            onSend={handleSendMessage}
            uploadedFile={uploadedFile}
            placeholder={placeholder}
            onStopLLM={onStopLLM}
            textAreaClassName="h-[60px] md:h-[80px]"
          />
        </div>
      </div>
    </>
  );
}
