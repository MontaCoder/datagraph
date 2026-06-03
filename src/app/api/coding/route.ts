import { runPython } from "@/lib/coding";
import { NextRequest, NextResponse } from "next/server";
import { saveNewMessage } from "@/lib/chat-store";
import { generateId } from "ai";
import { limitCodeRuns } from "@/lib/limits";
import { z } from "zod";

const bodySchema = z.object({
  code: z.string().min(1).max(20000),
  session_id: z.string().max(128).optional(),
  id: z.string().max(128).optional(),
  files: z
    .array(
      z.object({
        name: z.string().min(1).max(256),
        encoding: z.string().max(32).optional(),
        content: z.string(),
      })
    )
    .max(5)
    .optional(),
});

export async function POST(req: NextRequest) {
  // Rate-limit the expensive sandbox path (separate, more generous bucket)
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  try {
    await limitCodeRuns(ip);
  } catch {
    return NextResponse.json(
      { error: "Too many code executions. Daily limit reached." },
      { status: 429 }
    );
  }

  try {
    let parsed: z.infer<typeof bodySchema>;
    try {
      parsed = bodySchema.parse(await req.json());
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    const { code, session_id, files, id } = parsed;

    const start = Date.now();
    const result = await runPython(code, session_id, files, {
      signal: req.signal,
    });

    const end = Date.now();
    const duration = (end - start) / 1000;

    if (req.signal.aborted) {
      // client cancelled; nothing to persist
      return new Response("Request aborted", { status: 200 });
    }

    // Persist the code execution output as an assistant message in the chat history
    if (id && !req.signal.aborted) {
      const isSuccessful = result.status === "success";
      const toolCallMessage = {
        id: generateId(),
        role: "assistant" as const,
        content: isSuccessful
          ? "Code execution complete."
          : "Code execution failed.",
        parts: [
          {
            type: "text" as const,
            text: isSuccessful
              ? "Code execution complete."
              : "Code execution failed.",
          },
        ],
        createdAt: new Date(),
        duration,
        toolCall: {
          toolInvocation: {
            toolName: "runCode",
            // args: code, // maybe we don't save code also here cause it's already in the previous llm message
            state: "result",
            result: result,
          },
        },
      };
      await saveNewMessage({ id, message: toolCallMessage });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Code execution route error:", error);
    return NextResponse.json(
      { error: "Code execution failed" },
      { status: 500 }
    );
  }
}
