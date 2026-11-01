import { cerebrasClient } from "@/lib/clients";
import {
  streamText,
  generateId,
  type ModelMessage,
  type AssistantContent,
  type TextPart,
  wrapLanguageModel,
  extractReasoningMiddleware,
  toUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
import { DbMessage, loadChat, saveNewMessage } from "@/lib/chat-store";
import { limitMessages } from "@/lib/limits";
import { generateCodePrompt } from "@/lib/prompts";
import { CHAT_MODELS } from "@/lib/models";
import { z } from "zod";

const bodySchema = z.object({
  id: z.string().min(1).max(128),
  message: z.string().min(1).max(8000),
  model: z.string().max(128).optional(),
});

// The persisted text of an assistant reply. ModelMessage content may be a
// plain string or a part array (e.g. reasoning extracted by the middleware
// alongside text), so join the text parts for non-string content.
function extractAssistantText(content: AssistantContent): string {
  if (typeof content === "string") return content;
  return content
    .filter((part): part is TextPart => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export async function POST(req: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }
  const { id, message, model } = body;

  // read header used to flag auto error-resolution retries (not for bypassing limits)
  const errorResolved = req.headers.get("X-Auto-Error-Resolved");

  // Use IP address as a simple user fingerprint. Enforce the limit on every
  // request — including auto-retries — so the header can't be used to bypass it.
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  try {
    await limitMessages(ip);
  } catch {
    return new Response("Too many messages. Daily limit reached.", {
      status: 429,
    });
  }

  const chat = await loadChat(id);

  const newUserMessage: DbMessage = {
    id: generateId(),
    role: "user",
    content: message,
    parts: [{ type: "text", text: message }],
    createdAt: new Date(),
    isAutoErrorResolution: errorResolved === "true",
  };

  // Save the new user message
  await saveNewMessage({ id, message: newUserMessage });

  const coreMessagesForStream = [
    ...(chat?.messages || []),
    newUserMessage,
  ]
    .filter((msg) => msg.role === "user" || msg.role === "assistant")
    .slice(-20)
    .map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

  // Start timing
  const start = Date.now();

  // Determine which model to use

  const defaultModel = CHAT_MODELS.find((m) => m.isDefault)?.model;

  const selectedModelSlug = typeof model === "string" ? model : undefined;

  const selectedModel =
    (selectedModelSlug &&
      CHAT_MODELS.find((m) => m.slug === selectedModelSlug)?.model) ||
    defaultModel;

  if (!selectedModel) {
    return new Response("Invalid model selected", { status: 400 });
  }

  try {
    // Create a new model instance based on selectedModel
    const modelInstance = wrapLanguageModel({
      model: cerebrasClient(selectedModel),
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    });

    const stream = streamText({
      model: modelInstance,
      instructions: generateCodePrompt({
        csvFileUrl: chat?.csvFileUrl || "",
        csvHeaders: chat?.csvHeaders || [],
        csvRows: chat?.csvRows || [],
      }),
      messages: coreMessagesForStream.filter(
        (msg) => msg.role !== "system"
      ) as ModelMessage[],
      onError: (error) => {
        console.error("Error:", error);
      },
      async onEnd({ responseMessages }) {
        // End timing
        const duration = (Date.now() - start) / 1000;

        if (responseMessages.length > 1) {
          return;
        }

        const coreMsg = responseMessages[0];
        if (!coreMsg || coreMsg.role !== "assistant") {
          return;
        }

        const textContent = extractAssistantText(coreMsg.content);

        const responseMessage: DbMessage = {
          id: generateId(),
          role: "assistant",
          content: textContent,
          parts: [{ type: "text", text: textContent }],
          createdAt: new Date(),
          duration,
          model: selectedModel,
        };

        try {
          await saveNewMessage({ id, message: responseMessage });
        } catch (saveErr) {
          // stream is already sent; log so the failure isn't silent
          console.error("Failed to persist assistant message:", saveErr);
        }
      },
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: stream.stream }),
    });
  } catch (err) {
    console.error(err);
    return new Response("Error generating response", { status: 500 });
  }
}
