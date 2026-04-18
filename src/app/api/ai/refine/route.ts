import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT_REFINE, buildRefinePrompt } from "@/lib/ai/prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { instruction, currentParams } = body as {
      instruction: string;
      currentParams: Record<string, number | string>;
    };

    if (!instruction || typeof instruction !== "string") {
      return Response.json({ error: "Missing instruction" }, { status: 400 });
    }
    if (!currentParams || typeof currentParams !== "object") {
      return Response.json({ error: "Missing currentParams" }, { status: 400 });
    }

    const userPrompt = buildRefinePrompt(instruction, currentParams);

    let rawContent = "";

    try {
      const message = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: SYSTEM_PROMPT_REFINE,
        messages: [{ role: "user", content: userPrompt }],
      });

      const firstBlock = message.content[0];
      if (firstBlock.type === "text") {
        rawContent = firstBlock.text;
      }
    } catch (apiError) {
      console.error("Anthropic API error:", apiError);
      return Response.json(
        {
          parameterChanges: {},
          explanation: "Muse is resting for a moment. Please try again shortly.",
          additionalNotes: "",
        }
      );
    }

    // Strip markdown fences
    const stripped = rawContent
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    let parsed: {
      parameterChanges?: Record<string, number | string>;
      explanation?: string;
      additionalNotes?: string;
    };

    try {
      parsed = JSON.parse(stripped);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Raw:", rawContent.slice(0, 200));
      return Response.json(
        {
          parameterChanges: {},
          explanation: "Muse couldn't quite understand that instruction. Could you try rephrasing it?",
          additionalNotes: "",
        }
      );
    }

    return Response.json({
      parameterChanges: parsed.parameterChanges ?? {},
      explanation: parsed.explanation ?? "",
      additionalNotes: parsed.additionalNotes ?? "",
    });
  } catch (error) {
    console.error("Refine route error:", error);
    return Response.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
