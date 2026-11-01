import { loadChat } from "@/lib/chat-store";
import { ChatScreen, ChatSkeleton } from "@/components/chat/screen";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/utils";

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
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const chat = await loadChat(id);
  // Unknown id → branded 404 instead of an orphan empty chat (a message
  // posted there would create a context-less chat).
  if (!chat) notFound();

  return (
    // ChatScreen reads ?model= via useSearchParams — bound in Suspense so
    // the route can still be statically rendered.
    <Suspense fallback={<ChatSkeleton />}>
      <ChatScreen
        id={id}
        initialMessages={chat.messages}
        uploadedFile={{
          url: chat.csvFileUrl || "",
          content: chat.csvFileContent || undefined,
          csvHeaders: chat.csvHeaders || [],
          csvRows: chat.csvRows || [],
        }}
      />
    </Suspense>
  );
}
