import { GLAZE_LIBRARY } from "@/lib/materials/glazes";
import type { GlazeRecipe } from "@/types";

export async function GET() {
  return Response.json({
    glazes: GLAZE_LIBRARY,
    count: GLAZE_LIBRARY.length,
  });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  // Basic validation — ensure required fields exist
  const glaze = body as Partial<GlazeRecipe>;

  if (!glaze.id || !glaze.name || !glaze.colorHex) {
    return Response.json(
      {
        error: "Missing required fields: id, name, colorHex.",
        required: ["id", "name", "colorHex", "surface", "coneMin", "coneMax"],
      },
      { status: 422 }
    );
  }

  // Stub: no Prisma connection yet — return success with the submitted glaze
  // TODO: Replace with `await prisma.glazeRecipe.create({ data: glaze })` when DB is connected.
  const saved: GlazeRecipe = {
    id: glaze.id,
    name: glaze.name,
    colorHex: glaze.colorHex,
    surface: glaze.surface ?? "glossy",
    effects: glaze.effects ?? ["none"],
    specificGravity: glaze.specificGravity ?? 1.45,
    coneMin: glaze.coneMin ?? 6,
    coneMax: glaze.coneMax ?? 6,
    compatibleAtmospheres: glaze.compatibleAtmospheres ?? ["oxidation"],
    ingredients: glaze.ingredients ?? [],
    notes: glaze.notes ?? "",
    isPublic: glaze.isPublic ?? false,
    authorId: glaze.authorId,
  };

  return Response.json(
    { success: true, glaze: saved },
    { status: 201 }
  );
}
