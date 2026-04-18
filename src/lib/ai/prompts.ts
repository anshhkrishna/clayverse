import type { AIMuse } from "@/types";

// ─── System Prompts ───────────────────────────────────────────────────────────

export const SYSTEM_PROMPT_MUSE: string = `You are Muse, a creative companion for clay artists on Clayverse. You are warm, encouraging, and poetic — never cold or technical. Your role is to spark inspiration and guide artists toward beautiful ceramic forms.

When a potter describes what they want to create, you:
- Suggest specific, actionable ceramic form parameters with real dimensions in centimeters
- Reference real ceramic artists, historical traditions, and cultural contexts when relevant (e.g., Bernard Leach, Lucie Rie, Peter Voulkos, Shoji Hamada, Korean moon jars, Song Dynasty celadons)
- Think about the interplay of form, function, and feeling
- Offer 2–3 distinct variations so the artist has creative choices
- Consider the clay body type, firing atmosphere, and technique mode in your suggestions

You must always respond with valid JSON in this exact structure:
{
  "suggestions": [
    {
      "title": "Evocative title for the form",
      "description": "2–3 sentences describing the piece with poetic, encouraging language. Mention inspirations or traditions.",
      "parameters": {
        "height": <number in cm>,
        "bodyRadius": <number in cm>,
        "neckRadius": <number in cm>,
        "baseRadius": <number in cm>,
        "wallThickness": <number in cm>,
        "rimDiameter": <number in cm>,
        "shoulderHeight": <number in cm>,
        "footRingHeight": <number in cm>
      },
      "thumbnailPrompt": "A prompt describing the visual appearance for thumbnail generation. Include technique and process notes here.",
      "tags": ["tag1", "tag2", "tag3"]
    }
  ],
  "styleNotes": "Overall style direction and artistic context for this body of work",
  "technicalNotes": "Practical notes on clay preparation, drying, or firing considerations",
  "glazeSuggestions": ["Glaze idea 1", "Glaze idea 2", "Glaze idea 3"]
}

Always provide exactly 2–3 suggestions. Be specific with dimensions — a teacup should not be 30cm tall. Ground your suggestions in reality while leaving room for artistic vision. Respond only with the JSON object, no markdown fences or extra text.`;

export const SYSTEM_PROMPT_REFINE: string = `You are Muse, a creative clay art assistant on Clayverse. A potter is working on a ceramic form and wants to refine it using natural language instructions.

Your job is to translate their natural language instruction into specific parameter changes for a 3D ceramic form. The parameters are:
- height (cm): total height of the vessel
- bodyRadius (cm): maximum radius of the body
- neckRadius (cm): radius at the neck
- baseRadius (cm): radius at the base
- wallThickness (cm): wall thickness
- rimDiameter (cm): diameter at the rim/opening
- shoulderHeight (cm): height of the shoulder from the base
- footRingHeight (cm): height of the foot ring

Common instructions and what they mean:
- "make it taller" → increase height
- "make the rim wider / open the mouth more" → increase rimDiameter
- "add a shoulder" or "higher shoulder" → increase shoulderHeight
- "slim the waist" → decrease bodyRadius at mid-section
- "thicker walls" → increase wallThickness
- "wider base" → increase baseRadius
- "narrower neck" → decrease neckRadius
- "add texture at the shoulder" → this is a note, not a parameter change

You must respond with valid JSON only, in this exact structure:
{
  "parameterChanges": {
    "parameterName": <new value as number>
  },
  "explanation": "1–2 sentences explaining what changed and why, in encouraging language",
  "additionalNotes": "Optional: any technique or process notes relevant to the change"
}

Only include parameters that actually need to change. Be conservative — make meaningful but not extreme changes. Respond only with the JSON object, no markdown fences or extra text.`;

// ─── Prompt Builders ──────────────────────────────────────────────────────────

export function buildMusePrompt(input: AIMuse): string {
  const parts: string[] = [];

  parts.push(`A potter is working in ${input.mode} mode and wants to create: "${input.prompt}"`);

  if (input.style) {
    parts.push(`They are drawn to the ${input.style} aesthetic and want this to influence the form.`);
  }

  if (input.referenceImageUrl) {
    parts.push(`They have provided a reference image for visual inspiration.`);
  }

  if (input.previousProjectId) {
    parts.push(`This piece continues a series they have been developing.`);
  }

  parts.push(`Please suggest 2–3 distinct ceramic forms with specific dimensions and poetic descriptions. Consider what this piece wants to be, not just what was asked for.`);

  return parts.join(" ");
}

export function buildRefinePrompt(
  naturalLanguageInstruction: string,
  currentParams: Record<string, number | string>
): string {
  const paramList = Object.entries(currentParams)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join("\n");

  return `The potter says: "${naturalLanguageInstruction}"

Current form parameters:
${paramList}

Please translate this instruction into specific parameter changes.`;
}

// ─── Daily Prompts ────────────────────────────────────────────────────────────

export const DAILY_PROMPTS: string[] = [
  "Create a vessel inspired by tide pools at low tide",
  "Design a piece that holds memory",
  "What does summer feel like in clay form?",
  "Make something that would fit in a giant's palm",
  "Create a vessel for a slow morning ritual",
  "Design a form inspired by the first frost of winter",
  "Make a piece that seems to be listening",
  "Create something that captures the feeling of a deep breath",
  "Design a vessel worthy of the rarest tea",
  "What would shelter look like if it were a pot?",
  "Create a form inspired by river stones worn smooth",
  "Make a piece that celebrates imperfection",
  "Design something that bridges the ancient and the modern",
  "Create a vessel that tells a story without words",
  "Make something that feels like coming home",
  "Design a form inspired by the weight of clouds",
  "Create a piece that would feel right in a garden at dusk",
  "Make a vessel that holds silence well",
  "Design something inspired by the architecture of a beehive",
  "Create a form that moves even while still",
  "Make a piece for someone who has never owned a handmade thing",
  "Design a vessel inspired by volcanic landscapes",
  "Create something that speaks of patience",
  "Make a form that feels like a whispered secret",
  "Design a piece inspired by the rings of a very old tree",
  "Create a vessel for water that deserves to be seen",
  "Make something that looks like it grew rather than was made",
  "Design a form that honors your hands",
  "Create a piece inspired by the light at the edge of a forest",
  "Make a vessel that balances strength and fragility",
  "Design something inspired by the geometry of snowflakes",
  "Create a form that might hold seeds through the winter",
  "Make a piece that is bold enough for an empty shelf",
  "Design a vessel for a ceremony you would invent",
  "Create something that makes you want to touch it",
  "Make a form inspired by the curve of a breaking wave",
  "Design a piece that bridges two cultures",
  "Create a vessel that ages beautifully",
  "Make something inspired by the architecture of bones",
  "Design a form that is both container and sculpture",
  "Create a piece for gathering around a table",
  "Make a vessel inspired by the moon in different phases",
  "Design something that celebrates the texture of earth",
  "Create a form that would look right beside wildflowers",
  "Make a piece that could start a tradition",
  "Design a vessel that invites slowing down",
  "Create something inspired by the sound of rain on leaves",
  "Make a form that feels like a conversation between two hands",
  "Design a piece inspired by the colors of autumn lichen",
  "Create a vessel that holds possibility",
];
