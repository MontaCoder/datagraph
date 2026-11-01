"use client";

import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createChat } from "@/lib/chat-store";
import { useUploadThing } from "@/lib/uploadthing";
import { extractCsvData } from "@/lib/csvUtils";
import { useLLMModel } from "@/hooks/useLLMModel";
import { cn, EXAMPLE_FILE_URL } from "@/lib/utils";
import { AppRail } from "@/components/chrome";
import { Composer } from "@/components/chat/composer";
import { ChatSkeleton } from "@/components/chat/screen";
import { LiveDot, Skeleton, UploadGlyph } from "@/components/ui";

/* ─────────────────────────────────────────────────────────────
   /app — load a dataset, get drafted questions, start a session.
   ───────────────────────────────────────────────────────────── */

const MAX_FILE_BYTES = 30 * 1024 * 1024;

interface SuggestedQuestion {
  id: string;
  text: string;
}

function UploadCard({ onFile }: { onFile: (file: File) => void }) {
  const [dragging, setDragging] = useState<false | "accept" | "reject">(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const depth = useRef(0);

  const accept = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) {
      toast.warning("Please upload a CSV file");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.warning("File size must be less than 30MB");
      return;
    }
    onFile(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload a CSV file: click or drag and drop"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        depth.current += 1;
        const item = e.dataTransfer.items?.[0];
        setDragging(item && item.type !== "text/csv" ? "reject" : "accept");
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        e.preventDefault();
        depth.current -= 1;
        if (depth.current <= 0) {
          depth.current = 0;
          setDragging(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        depth.current = 0;
        setDragging(false);
        accept(e.dataTransfer.files);
      }}
      className={cn(
        "group relative w-full border rounded-card bg-paper-2 transition-colors cursor-pointer text-left",
        dragging === "accept"
          ? "border-accent"
          : dragging === "reject"
          ? "border-error bg-error/5"
          : "border-rule hover:border-rule-2"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        aria-label="Upload a CSV file"
        className="sr-only"
        onChange={(e) => accept(e.target.files)}
      />
      <div className="flex items-center justify-between px-5 py-3 border-b border-rule">
        <span className="label text-ink-2 flex items-center gap-2.5">
          {dragging === "accept" && <LiveDot tone="accent" />}
          load a dataset
        </span>
        <span className="label hidden sm:inline">.csv, 30 mb max</span>
      </div>
      <div className="px-6 py-10 md:px-10 md:py-12">
        <h2 className="display text-[30px] md:text-[40px] leading-[1.02]">
          {dragging === "accept" ? "release to plot." : "drag a csv in, or click here."}
        </h2>
        <p className="text-muted text-[14.5px] leading-[1.65] max-w-lg mt-3">
          headers, types, and shape are detected automatically. nothing is
          written to disk beyond what&apos;s required to answer your question.
        </p>
        <span className="inline-flex items-center gap-2.5 h-11 px-5 mt-7 rounded-pill bg-accent text-accent-ink text-sm font-medium group-hover:bg-accent-2 transition-colors">
          <UploadGlyph /> choose a csv
        </span>
        <span className="label ml-4 hidden sm:inline">
          or drop one anywhere on this card
        </span>
      </div>
    </div>
  );
}

function SuggestionRow({
  question,
  index,
  loading,
  onClick,
}: {
  question?: string;
  index?: number;
  loading?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick || loading}
      className={cn(
        "relative w-full text-left flex items-baseline gap-4 px-4 py-4 border-b border-rule transition-colors",
        onClick && !loading ? "hover:bg-paper-2 cursor-pointer" : "cursor-default"
      )}
    >
      <span className="readout text-muted shrink-0">
        {loading ? "··" : String(index).padStart(2, "0")}
      </span>
      {loading ? (
        <Skeleton className="h-3.5 flex-1 max-w-[320px]" />
      ) : (
        <span className="text-[14.5px] text-ink-2 flex-1">{question}</span>
      )}
      <span
        aria-hidden="true"
        className="absolute left-0 bottom-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full"
      />
    </button>
  );
}

function Workspace({ setLoading }: { setLoading: (v: boolean) => void }) {
  const { startUpload } = useUploadThing("csvUploader");
  const { selectedModelSlug } = useLLMModel();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [localFile, setLocalFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<SuggestedQuestion[]>([]);
  const [input, setInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<{ [key: string]: string }[]>([]);
  const [csvContent, setCsvContent] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File, source: "upload" | "example" = "upload") => {
      const isCsv = file.type === "text/csv" || file.name.endsWith(".csv");
      if (!isCsv) {
        toast.warning("Please upload a CSV file");
        return;
      }
      setLocalFile(file);
      setProcessing(true);
      try {
        const rawContent = source === "example" ? await file.text() : null;
        const { headers, sampleRows } = await extractCsvData(file);
        if (headers.length === 0 || sampleRows.length === 0) {
          toast.warning("Please upload a CSV with headers.");
          setLocalFile(null);
          setCsvContent(null);
          return;
        }
        setCsvRows(sampleRows);
        setCsvHeaders(headers);
        setCsvContent(rawContent);

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
          .then((r) => r.json())
          .catch(() => ({ questions: [] }));

        const [uploaded, data] = await Promise.all([uploadPromise, questionsPromise]);
        if (uploaded && uploaded.length > 0) setFileUrl(uploaded[0].url);
        if (data?.questions?.length) setQuestions(data.questions);
      } catch (err) {
        console.error("Failed to process CSV file:", err);
        toast.error("Failed to process CSV file");
      } finally {
        setProcessing(false);
      }
    },
    [startUpload]
  );

  // "?example=1" (from the landing footer) auto-loads the sample dataset
  const didAutoLoad = useRef(false);
  useEffect(() => {
    if (didAutoLoad.current || localFile || searchParams.get("example") !== "1") return;
    didAutoLoad.current = true;
    fetch(EXAMPLE_FILE_URL)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.blob();
      })
      .then((blob) =>
        handleFile(new File([blob], "products.csv", { type: "text/csv" }), "example")
      )
      .catch(() => {
        // the manual control still exists on the card
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, localFile]);

  const startSession = async (text: string) => {
    const question = text.trim();
    if (!question) return;
    if (!fileUrl) {
      toast.warning("Please upload a CSV file first.");
      return;
    }
    localStorage.setItem("pendingMessage", question);
    setLoading(true);

    let id: string;
    try {
      id = await createChat({
        userQuestion: question,
        csvHeaders,
        csvFileUrl: fileUrl,
        csvRows,
        csvFileContent: csvContent,
      });
    } catch (err) {
      console.error("Failed to create chat:", err);
      toast.error("Could not start the session. Please try again.");
      localStorage.removeItem("pendingMessage");
      setLoading(false);
      return;
    }
    router.push(`/chat/${id}?model=${selectedModelSlug}`);
  };

  const hasFile = !!localFile;

  return (
    <>
      {!hasFile && <UploadCard onFile={(f) => handleFile(f)} />}

      {hasFile && (
        <Composer
          value={input}
          onChange={setInput}
          onSend={() => startSession(input)}
          onStop={() => {}}
          uploadedFile={{
            name: localFile?.name,
            csvHeaders,
            csvRows,
          }}
          size="lg"
          autoFocus
        />
      )}

      {processing && (
        <div className="mt-10">
          <p className="label flex items-center gap-2.5 mb-3">
            <LiveDot tone="accent" /> drafting questions
          </p>
          <div className="border-t border-rule">
            {Array.from({ length: 4 }).map((_, i) => (
              <SuggestionRow key={i} loading />
            ))}
          </div>
        </div>
      )}

      {!processing && questions.length > 0 && (
        <div className="mt-10">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="display text-[22px] text-ink">opening questions</h2>
            <span className="readout text-muted">{questions.length} drafted</span>
          </div>
          <div className="border-t border-rule">
            {questions.map((q, i) => (
              <SuggestionRow
                key={q.id}
                question={q.text}
                index={i + 1}
                onClick={() => startSession(q.text)}
              />
            ))}
          </div>
        </div>
      )}

      {hasFile && !processing && questions.length === 0 && fileUrl && (
        <div className="mt-10">
          <p className="label">no drafted questions; write your own above.</p>
        </div>
      )}
    </>
  );
}

export default function DatagraphApp() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <AppRail />

      <main className="flex flex-col px-4 md:px-6 max-w-3xl mx-auto pb-24 w-full">
        <div className="pt-12 md:pt-24 pb-10">
          <h1 className="display text-[38px] md:text-[52px] leading-[1.0] rise-in">
            what do you want to plot?
          </h1>
          <p
            className="lead text-muted mt-4 rise-in"
            style={{ animationDelay: "80ms" }}
          >
            load a file, ask in your own words, read the answer.
          </p>
        </div>

        <Suspense fallback={<Skeleton className="h-40 rounded-card" />}>
          <Workspace setLoading={setLoading} />
        </Suspense>
      </main>

      {/* session-creation overlay: on top of the page so a failed
          createChat doesn't wipe the uploaded file */}
      {loading && (
        <div className="fixed inset-0 z-[400] bg-paper overflow-hidden">
          <ChatSkeleton />
        </div>
      )}
    </div>
  );
}
