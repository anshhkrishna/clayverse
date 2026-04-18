import Anthropic from "@anthropic-ai/sdk";
import type { AIMuse, AIMuseResponse, AIFormSuggestion } from "@/types";
import { SYSTEM_PROMPT_MUSE, buildMusePrompt, DAILY_PROMPTS } from "@/lib/ai/prompts";
import { generateId } from "@/lib/utils";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function getTodaysDailyPrompt(): string {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];
}

function buildFallbackResponse(input: AIMuse): AIMuseResponse {
  const fallbackSuggestion: AIFormSuggestion = {
    title: "Classic Vessel Form",
    description:
      "A timeless vessel with gentle proportions, inspired by centuries of ceramic tradition. Let your hands guide the clay to find its own rightness.",
    parameters: {
      height: 18,
      bodyRadius: 8,
      neckRadius: 4,
      baseRadius: 5,
      wallThickness: 0.8,
      rimDiameter: 8,
      shoulderHeight: 12,
      footRingHeight: 1.2,
    },
    thumbnailPrompt:
      "A classic ceramic vessel with earthy stoneware glaze, soft neutral tones, wheel-thrown",
    tags: ["classic", "vessel", "wheel-thrown", input.mode],
  };

  return {
    id: generateId(),
    suggestions: [fallbackSuggestion],
    dailyPrompt: getTodaysDailyPrompt(),
    styleNotes: "A grounding place to begin — a form that asks only to be made well.",
    technicalNotes:
      "Ensure even wall thickness throughout. Compress the base thoroughly before pulling walls.",
    glazeSuggestions: [
      "Simple celadon — lets the form speak",
      "Iron tenmoku with wax resist",
      "Wood ash matte glaze",
    ],
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input: AIMuse = body.input;

    if (!input?.prompt) {
      return Response.json({ error: "Missing input.prompt" }, { status: 400 });
    }

    const userPrompt = buildMusePrompt(input);

    let rawContent = "";

    try {
      const message = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        system: SYSTEM_PROMPT_MUSE,
        messages: [{ role: "user", content: userPrompt }],
      });

      const firstBlock = message.content[0];
      if (firstBlock.type === "text") {
        rawContent = firstBlock.text;
      }
    } catch (apiError) {
      console.error("Anthropic API error:", apiError);
      return Response.json(buildFallbackResponse(input));
    }

    // Strip markdown fences if Claude wrapped the JSON
    const stripped = rawContent
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    let parsed: {
      suggestions?: AIFormSuggestion[];
      styleNotes?: string;
      technicalNotes?: string;
      glazeSuggestions?: string[];
    };

    try {
      parsed = JSON.parse(stripped);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Raw:", rawContent.slice(0, 200));
      return Response.json(buildFallbackResponse(input));
    }

    const response: AIMuseResponse = {
      id: generateId(),
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      dailyPrompt: getTodaysDailyPrompt(),
      styleNotes: parsed.styleNotes ?? "",
      technicalNotes: parsed.technicalNotes ?? "",
      glazeSuggestions: Array.isArray(parsed.glazeSuggestions) ? parsed.glazeSuggestions : [],
    };

    return Response.json(response);
  } catch (error) {
    console.error("Muse route error:", error);
    return Response.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
