"use server";
import { UIMessage as AIMsg, generateText } from "ai";
import { generateId } from "ai";
import { redis, cerebrasClient } from "./clients"; // Import your redis client
import { generateTitlePrompt } from "./prompts";
const CHAT_KEY_PREFIX = "chat:";

// Extend the UIMessage type to include duration for Redis persistence
export type DbMessage = AIMsg & {
  content?: string;
  createdAt?: Date;
  duration?: number;
  model?: string; // which model was used to generate this message
  isAutoErrorResolution?: boolean; // if true then this message is an automatic error resolution prompt
};

type ChatData = {
  messages: DbMessage[];
  csvFileUrl: string | null;
  csvFileContent?: string | null;
  csvHeaders: string[] | null;
  csvRows: { [key: string]: string }[] | null;
  title: string | null; // inferring the title of the chat based on csvHeaders and first user messages
  createdAt?: Date;
  // ...future fields
};

export async function createChat({
  userQuestion,
  csvHeaders,
  csvRows,
  csvFileUrl,
  csvFileContent,
}: {
  userQuestion: string;
  csvHeaders: string[];
  csvRows: { [key: string]: string }[];
  csvFileUrl: string;
  csvFileContent?: string | null;
}): Promise<string> {
  const id = generateId();

  // use userQuestion to generate a title for the chat
  const { text: title } = await generateText({
    model: cerebrasClient("zai-glm-4.7"),
    prompt: generateTitlePrompt({ csvHeaders, userQuestion }),
    maxOutputTokens: 100,
  });

  const initial: ChatData = {
    messages: [],
    csvHeaders,
    csvRows,
    csvFileUrl,
    csvFileContent: csvFileContent ?? null,
    title,
    createdAt: new Date(),
  };
  await redis.set(`${CHAT_KEY_PREFIX}${id}`, JSON.stringify(initial));
  return id;
}

export async function loadChat(id: string): Promise<ChatData | null> {
  const value = await redis.get(`${CHAT_KEY_PREFIX}${id}`);
  if (!value) return null;
  try {
    return typeof value === "string" ? JSON.parse(value) : (value as ChatData);
  } catch {
    return null;
  }
}

export async function saveNewMessage({
  id,
  message,
}: {
  id: string;
  message: DbMessage;
}): Promise<void> {
  const chat = await loadChat(id);
  if (chat) {
    const updatedMessages = [...(chat.messages || []), message];
    await redis.set(
      `${CHAT_KEY_PREFIX}${id}`,
      JSON.stringify({
        ...chat,
        messages: updatedMessages,
      })
    );
  } else {
    // If chat does not exist, create a new one with this message
    const newChat: ChatData = {
      messages: [message],
      csvHeaders: null,
      csvRows: null,
      csvFileUrl: null,
      csvFileContent: null,
      title: null,
    };
    await redis.set(`${CHAT_KEY_PREFIX}${id}`, JSON.stringify(newChat));
  }
}
