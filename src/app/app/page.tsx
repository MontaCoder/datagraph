"use client";

import React, { Suspense, useState, useCallback } from "react";
import { Header } from "@/components/header";
import { UploadArea } from "@/components/upload-area";
import { HeroSection } from "@/components/hero-section";
import { QuestionSuggestionCard } from "@/components/question-suggestion-card";
import { extractCsvData } from "@/lib/csvUtils";
import { createChat } from "@/lib/chat-store";
import { useUploadThing } from "@/lib/uploadthing";
import { PromptInput } from "@/components/PromptInput";
import { toast } from "sonner";
import { useLLMModel } from "@/hooks/useLLMModel";
import { redirect } from "next/navigation";
import Loading from "../chat/[id]/loading";
import { EXAMPLE_FILE_URL } from "@/lib/utils";

export interface SuggestedQuestion {
  id: string;
  text: string;
}

function DatagraphClient({
  setIsLoading,
}: {
  setIsLoading: (load: boolean) => void;
}) {
  const { startUpload } = useUploadThing("csvUploader");
  const { selectedModelSlug } = useLLMModel();
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<
    SuggestedQuestion[]
  >([]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<{ [key: string]: string }[]>([]);
  const [csvFileContent, setCsvFileContent] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  const handleFileUpload = useCallback(
    async (
      file: File | null,
      source: "upload" | "example" = "upload"
    ) => {
      if (file && file.type === "text/csv") {
        setLocalFile(file);
        setIsProcessing(true);

        try {
          const rawContent = source === "example" ? await file.text() : null;
          const { headers, sampleRows } = await extractCsvData(file);

          if (headers.length === 0 || sampleRows.length === 0) {
            toast.warning("Please upload a CSV with headers.");
            setLocalFile(null);
            setCsvFileContent(null);
            setIsProcessing(false);
            return;
          }

          setCsvRows(sampleRows);
          setCsvHeaders(headers);
          setCsvFileContent(rawContent);

          const uploadPromise =
            source === "example"
              ? Promise.resolve([{ url: EXAMPLE_FILE_URL }])
              : startUpload([file]).catch((err) => {
                  console.error("Upload failed:", err);
                  toast.error(
                    "File upload service is not configured. Set UPLOADTHING_TOKEN in .env to enable saved chats."
                  );
                  return null;
                });

          const questionsPromise = fetch("/api/generate-questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ columns: headers }),
          })
            .then((res) => res.json())
            .catch((err) => {
              console.error("Question generation failed:", err);
              return { questions: [] };
            });

          const [uploadedFiles, data] = await Promise.all([
            uploadPromise,
            questionsPromise,
          ]);

          if (uploadedFiles && uploadedFiles.length > 0) {
            setUploadedFileUrl(uploadedFiles[0].url);
          }

          if (data?.questions?.length) {
            setSuggestedQuestions(data.questions);
          }
        } catch (error) {
          console.error("Failed to process CSV file:", error);
          toast.error("Failed to process CSV file");
        } finally {
          setIsProcessing(false);
        }
      }
    },
    [startUpload]
  );

  const handleSuggestionClick = (question: string) => {
    handleSendMessage(question);
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text) return;

    if (!uploadedFileUrl) {
      toast.warning("Please upload a CSV file first.");
      return;
    }

    if (csvHeaders.length === 0) {
      toast.warning("Please upload a CSV with headers.");
      return;
    }

    if (csvRows.length === 0) {
      toast.warning("Please upload a CSV with data.");
      return;
    }

    localStorage.setItem("pendingMessage", text);

    setIsLoading(true);

    const id = await createChat({
      userQuestion: text,
      csvHeaders: csvHeaders,
      csvFileUrl: uploadedFileUrl,
      csvRows: csvRows,
      csvFileContent: csvFileContent,
    });
    redirect(`/chat/${id}?model=${selectedModelSlug}`);
  };

  return (
    <>
      <UploadArea onFileChange={handleFileUpload} uploadedFile={localFile} />

      {/* Prompt input — only shown after a file is uploaded */}
      {localFile && (
        <div className="w-full max-w-xl md:max-w-3xl mx-auto mt-8">
          <PromptInput
            value={inputValue}
            onChange={setInputValue}
            onSend={() => {
              handleSendMessage(inputValue);
            }}
            uploadedFile={{
              name: localFile.name,
              csvHeaders: csvHeaders,
              csvRows: csvRows,
            }}
            textAreaClassName="h-[88px] md:h-[120px]"
            isLLMAnswering={false}
            onStopLLM={() => {}}
          />
        </div>
      )}

      {/* Processing State — generating editorial questions */}
      {isProcessing && (
        <div className="w-full max-w-xl md:max-w-3xl mx-auto mt-12">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ember mb-5 flex items-center gap-2">
            <span className="block size-1.5 rounded-full bg-ember animate-pulse" />
            Drafting questions
          </p>
          <div className="flex flex-col">
            {Array(4)
              .fill(null)
              .map((_, idx) => (
                <QuestionSuggestionCard key={idx} question={""} isLoading />
              ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestedQuestions.length > 0 && !isProcessing && (
        <div className="w-full max-w-xl md:max-w-3xl mx-auto mt-12">
          <div className="flex items-center justify-between mb-5">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ember flex items-center gap-2">
              <span className="block size-1.5 rounded-full bg-ember" />
              Suggested questions
            </p>
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-smoke">
              {suggestedQuestions.length} drafted
            </p>
          </div>
          <div className="flex flex-col">
            {suggestedQuestions.map((suggestion, i) => (
              <QuestionSuggestionCard
                key={suggestion.id}
                question={suggestion.text}
                index={i + 1}
                onClick={() => handleSuggestionClick(suggestion.text)}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function DatagraphApp() {
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-ink relative">
      {/* atmospheric background */}
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-50" />
      <div
        className="fixed inset-x-0 top-0 h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgb(var(--accent-rgb)/0.12), transparent 70%)",
        }}
      />

      <Header />

      <main className="relative flex flex-col items-center px-4 md:px-8 max-w-3xl mx-auto pb-24">
        <div className="flex flex-col items-start pt-16 md:pt-32 pb-10 mx-auto w-full">
          <HeroSection />
        </div>
        <Suspense fallback={<div className="text-smoke">Loading…</div>}>
          <DatagraphClient setIsLoading={setIsLoading} />
        </Suspense>
      </main>
    </div>
  );
}
