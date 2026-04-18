import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/community/posts — list public community posts
// Query params: page, limit, mode, sort (recent|popular|remixes), search
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const skip = (page - 1) * limit;
  const mode = searchParams.get("mode") ?? null;
  const sort = searchParams.get("sort") ?? "recent"; // recent | popular | remixes
  const search = searchParams.get("search") ?? null;

  try {
    // Build the where clause
    const whereProject: Record<string, unknown> = { isPublic: true };
    if (mode) whereProject.mode = mode;

    const wherePost: Record<string, unknown> = {
      project: whereProject,
    };

    if (search) {
      wherePost.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    // Determine ordering
    let orderBy: Record<string, unknown>;
    if (sort === "popular") {
      orderBy = { likes: { _count: "desc" } };
    } else if (sort === "remixes") {
      orderBy = { project: { remixes: { _count: "desc" } } };
    } else {
      orderBy = { createdAt: "desc" };
    }

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where: wherePost,
        orderBy,
        skip,
        take: limit,
        include: {
          project: {
            select: {
              id: true,
              mode: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                  specialty: true,
                },
              },
              remixes: { select: { id: true } },
              remixedFromId: true,
            },
          },
          _count: {
            select: { likes: true },
          },
        },
      }),
      prisma.communityPost.count({ where: wherePost }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatted = posts.map((post: any) => ({
      id: post.id,
      projectId: post.projectId,
      title: post.title,
      description: post.description,
      thumbnailUrl: post.thumbnailUrl,
      tags: post.tags,
      views: post.views,
      license: post.license,
      createdAt: post.createdAt,
      likes: post._count.likes,
      remixes: post.project.remixes.length,
      mode: post.project.mode,
      remixedFromId: post.project.remixedFromId,
      author: post.project.author,
    }));

    return Response.json({
      posts: formatted,
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
    console.error("[GET /api/community/posts]", error);
    return Response.json(
      { error: "Failed to fetch posts. The database may not be available." },
      { status: 503 }
    );
  }
}

// POST /api/community/posts — publish a project to community (requires auth)
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
    projectId,
    title,
    description,
    thumbnailUrl,
    tags = [],
    license = "cc_by",
  } = body;

  if (!projectId || typeof projectId !== "string") {
    return Response.json({ error: "projectId is required" }, { status: 400 });
  }
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return Response.json({ error: "title is required" }, { status: 400 });
  }

  try {
    // Verify the project exists and belongs to this user
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { authorId: true, post: { select: { id: true } } },
    });

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.authorId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    if (project.post) {
      return Response.json(
        { error: "This project is already published to the community" },
        { status: 409 }
      );
    }

    // Make the project public and create the community post atomically
    const [, post] = await prisma.$transaction([
      prisma.project.update({
        where: { id: projectId },
        data: { isPublic: true },
      }),
      prisma.communityPost.create({
        data: {
          projectId,
          title: (title as string).trim(),
          description: typeof description === "string" ? description : null,
          thumbnailUrl: typeof thumbnailUrl === "string" ? thumbnailUrl : null,
          tags: Array.isArray(tags) ? (tags as string[]) : [],
          license: typeof license === "string" ? license : "cc_by",
        },
      }),
    ]);

    return Response.json({ post }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/community/posts]", error);
    return Response.json(
      { error: "Failed to publish post. The database may not be available." },
      { status: 503 }
    );
  }
}
