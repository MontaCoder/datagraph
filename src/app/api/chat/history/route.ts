import { loadChat } from "@/lib/chat-store";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  ids: z.array(z.string().min(1).max(128)).max(100),
});

export async function POST(req: NextRequest) {
  try {
    let ids: string[];
    try {
      ids = bodySchema.parse(await req.json()).ids;
    } catch {
      return NextResponse.json(
        { error: "ids must be an array of up to 100 strings" },
        { status: 400 }
      );
    }
    const results = [];
    for (const id of ids) {
      const chat = await loadChat(id);
      if (chat && chat.title) {
        results.push({
          id,
          title: chat.title,
          createdAt: chat.createdAt || new Date(),
        });
      } else if (chat) {
        // fallback: use first user message as title
        const userMsg = chat.messages.find((msg) => msg.role === "user");
        results.push({ id, title: userMsg?.content || id });
      }
    }

    return NextResponse.json(
      results.sort((a, b) => {
        if (!b?.createdAt || !a?.createdAt) return 0;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })
    );
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
