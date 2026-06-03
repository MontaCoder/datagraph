import { NextResponse } from "next/server";
import { generateObject, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { cerebrasClient } from "@/lib/clients";
import { generateQuestionsPrompt } from "@/lib/prompts";

const questionSchema = z.object({
  id: z.string(),
  text: z
    .string()
    .describe("A question that can be asked about the provided CSV columns."),
});

/**
 * Generate 3 starter questions for a freshly uploaded CSV.
 *
 * Note on the cerebras `zai-glm-4.7` model: it is a reasoning model that
 * burns its output budget on chain-of-thought before emitting JSON. The
 * previous `maxOutputTokens: 1024` consistently produced
 * `finishReason: 'length'` with `textTokens: 0`. We raise the cap and
 * serve a graceful fallback so a model hiccup never breaks the upload.
 */
const FALLBACK_QUESTIONS = (columns: string[]) => {
  const a = columns[0] ?? "first column";
  const b = columns[1] ?? columns[0] ?? "second column";
  const c = columns[2] ?? columns[1] ?? columns[0] ?? "third column";
  return [
    { id: "q1", text: `What's the distribution of values across ${a}?` },
    { id: "q2", text: `Show ${a} grouped by ${b}, plotted.` },
    { id: "q3", text: `Are there any outliers or anomalies in ${c}?` },
  ];
};

export async function POST(req: Request) {
  let columns: string[] = [];
  try {
    const body = await req.json();
    columns = body?.columns ?? [];

    if (!Array.isArray(columns) || columns.length === 0) {
      return NextResponse.json(
        { error: 'Invalid input: "columns" array is required.' },
        { status: 400 }
      );
    }

    // bound the input so a malformed/huge payload can't blow up the prompt
    columns = columns
      .filter((c): c is string => typeof c === "string")
      .slice(0, 500)
      .map((c) => c.slice(0, 200));

    if (columns.length === 0) {
      return NextResponse.json(
        { error: 'Invalid input: "columns" must be strings.' },
        { status: 400 }
      );
    }

    const { object: generatedQuestions } = await generateObject({
      model: cerebrasClient("zai-glm-4.7"),
      output: "array",
      schema: questionSchema,
      // give the reasoning model headroom for chain-of-thought + output
      maxOutputTokens: 4096,
      maxRetries: 1,
      prompt: generateQuestionsPrompt({ csvHeaders: columns }),
    });

    const trimmed = (generatedQuestions ?? []).slice(0, 3);
    if (trimmed.length === 0) {
      // model produced no questions, serve fallback so upload UX continues
      return NextResponse.json(
        { questions: FALLBACK_QUESTIONS(columns), fallback: true },
        { status: 200 }
      );
    }

    return NextResponse.json({ questions: trimmed }, { status: 200 });
  } catch (error) {
    // graceful fallback for the common reasoning-token-exhausted case
    if (NoObjectGeneratedError.isInstance(error)) {
      console.warn(
        "[generate-questions] model returned no object (likely length cutoff); serving fallback."
      );
      return NextResponse.json(
        { questions: FALLBACK_QUESTIONS(columns), fallback: true },
        { status: 200 }
      );
    }
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { questions: FALLBACK_QUESTIONS(columns), fallback: true },
      { status: 200 }
    );
  }
}
