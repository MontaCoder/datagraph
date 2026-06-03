import { loadChat } from "@/lib/chat-store";
import { ChatScreen } from "@/components/chat-screen";
import type { Metadata } from "next";
import { APP_NAME, APP_URL } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const chat = await loadChat(id);
  if (!chat) {
    return {
      title: `Chat not found | ${APP_NAME}`,
      description: "No chat found for this ID.",
    };
  }
  const firstUserMessage = chat.messages.find(
    (msg) => msg.role === "user"
  )?.content;
  const titleText =
    chat.title?.trim() ||
    (firstUserMessage ? `Chat "${firstUserMessage}"` : "Chat");

  return {
    title: `${titleText} | ${APP_NAME}`,
    description: chat.csvHeaders
      ? `Chat about CSV columns: ${chat.csvHeaders.join(", ")}`
      : "Chat with your CSV using AI",
    openGraph: {
      images: [`${APP_URL}/og.jpg`],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const chat = await loadChat(id);

  return (
    <ChatScreen
      id={id}
      initialMessages={chat?.messages}
      uploadedFile={{
        url: chat?.csvFileUrl || "",
        content: chat?.csvFileContent || undefined,
        csvHeaders: chat?.csvHeaders || [],
        csvRows: chat?.csvRows || [],
      }}
    />
  );
}
