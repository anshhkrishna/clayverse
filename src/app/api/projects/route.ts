import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/projects — list the authenticated user's projects with pagination
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const skip = (page - 1) * limit;

  try {
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: { authorId: session.user.id },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        include: {
          versions: {
            orderBy: { versionNumber: "desc" },
            take: 1,
          },
          _count: {
            select: { likes: true, remixes: true },
          },
        },
      }),
      prisma.project.count({ where: { authorId: session.user.id } }),
    ]);

    return Response.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("[GET /api/projects]", error);
    return Response.json(
      { error: "Failed to fetch projects. The database may not be available." },
      { status: 503 }
    );
  }
}

// POST /api/projects — create a new project
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    name,
    description,
    mode = "wheel",
    status = "draft",
    clayBodyId,
    glazeRecipeIds = [],
    tags = [],
    isPublic = false,
    thumbnailUrl,
    remixedFromId,
    sceneData,
  } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return Response.json({ error: "Project name is required" }, { status: 400 });
  }

  try {
    const project = await prisma.project.create({
      data: {
        name: (name as string).trim(),
        description: typeof description === "string" ? description : null,
        mode: typeof mode === "string" ? mode : "wheel",
        status: typeof status === "string" ? status : "draft",
        clayBodyId: typeof clayBodyId === "string" ? clayBodyId : null,
        glazeRecipeIds: Array.isArray(glazeRecipeIds) ? (glazeRecipeIds as string[]) : [],
        tags: Array.isArray(tags) ? (tags as string[]) : [],
        isPublic: typeof isPublic === "boolean" ? isPublic : false,
        thumbnailUrl: typeof thumbnailUrl === "string" ? thumbnailUrl : null,
        authorId: session.user.id,
        remixedFromId: typeof remixedFromId === "string" ? remixedFromId : null,
        sceneData: typeof sceneData === "string" ? sceneData : null,
      },
    });

    return Response.json({ project }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/projects]", error);
    return Response.json(
      { error: "Failed to create project. The database may not be available." },
      { status: 503 }
    );
  }
}
