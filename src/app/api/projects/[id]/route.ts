import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/projects/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        versions: {
          orderBy: { versionNumber: "desc" },
        },
        _count: {
          select: { likes: true, remixes: true },
        },
      },
    });

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    // Only the owner can see private projects
    if (!project.isPublic && project.authorId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    return Response.json({ project });
  } catch (error) {
    console.error("[GET /api/projects/[id]]", error);
    return Response.json(
      { error: "Failed to fetch project. The database may not be available." },
      { status: 503 }
    );
  }
}

// PATCH /api/projects/[id] — update a project (owner only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const existing = await prisma.project.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!existing) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    if (existing.authorId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build update payload from allowed fields only
    const {
      name,
      description,
      mode,
      status,
      clayBodyId,
      glazeRecipeIds,
      tags,
      isPublic,
      thumbnailUrl,
      sceneData,
      simulationData,
    } = body;

    const data: Record<string, unknown> = {};
    if (typeof name === "string" && name.trim().length > 0) data.name = name.trim();
    if (typeof description === "string") data.description = description;
    if (typeof mode === "string") data.mode = mode;
    if (typeof status === "string") data.status = status;
    if (typeof clayBodyId === "string") data.clayBodyId = clayBodyId;
    if (Array.isArray(glazeRecipeIds)) data.glazeRecipeIds = glazeRecipeIds;
    if (Array.isArray(tags)) data.tags = tags;
    if (typeof isPublic === "boolean") data.isPublic = isPublic;
    if (typeof thumbnailUrl === "string") data.thumbnailUrl = thumbnailUrl;
    if (typeof sceneData === "string") data.sceneData = sceneData;
    if (typeof simulationData === "string") data.simulationData = simulationData;

    const project = await prisma.project.update({
      where: { id },
      data,
    });

    return Response.json({ project });
  } catch (error) {
    console.error("[PATCH /api/projects/[id]]", error);
    return Response.json(
      { error: "Failed to update project. The database may not be available." },
      { status: 503 }
    );
  }
}

// DELETE /api/projects/[id] (owner only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.project.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!existing) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    if (existing.authorId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.project.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/projects/[id]]", error);
    return Response.json(
      { error: "Failed to delete project. The database may not be available." },
      { status: 503 }
    );
  }
}
