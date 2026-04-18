import type { AIMuse, AIMuseResponse } from "@/types";
import { DAILY_PROMPTS } from "./prompts";

// ─── API Calls ────────────────────────────────────────────────────────────────

export async function getMuseSuggestions(input: AIMuse): Promise<AIMuseResponse> {
  const response = await fetch("/api/ai/muse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error ?? `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function refineWithNaturalLanguage(
  instruction: string,
  currentParams: Record<string, number | string>
): Promise<{ parameterChanges: Record<string, number | string>; explanation: string }> {
  const response = await fetch("/api/ai/refine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ instruction, currentParams }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error ?? `Request failed with status ${response.status}`);
  }

  return response.json();
}

// ─── Daily Prompt Helpers ─────────────────────────────────────────────────────

export function getRandomDailyPrompt(): string {
  const index = Math.floor(Math.random() * DAILY_PROMPTS.length);
  return DAILY_PROMPTS[index];
}

export function getTodaysDailyPrompt(): string {
  // Deterministic: use today's date as a seed to pick a consistent daily prompt
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const index = dayOfYear % DAILY_PROMPTS.length;
  return DAILY_PROMPTS[index];
}
