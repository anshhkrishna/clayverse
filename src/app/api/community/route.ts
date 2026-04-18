import { prisma } from "@/lib/db";

// GET /api/community — community stats and featured posts
export async function GET() {
  try {
    const [totalPosts, totalUsers, featuredPosts] = await Promise.all([
      prisma.communityPost.count(),

      prisma.user.count(),

      // Featured = most-liked posts in the last 30 days
      prisma.communityPost.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
          project: { isPublic: true },
        },
        orderBy: { likes: { _count: "desc" } },
        take: 6,
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
                },
              },
            },
          },
          _count: { select: { likes: true } },
        },
      }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const featured = featuredPosts.map((post: any) => ({
      id: post.id,
      projectId: post.projectId,
      title: post.title,
      thumbnailUrl: post.thumbnailUrl,
      tags: post.tags,
      license: post.license,
      createdAt: post.createdAt,
      likes: post._count.likes,
      mode: post.project.mode,
      author: post.project.author,
    }));

    return Response.json({
      stats: {
        totalPosts,
        totalUsers,
      },
      featured,
    });
  } catch (error) {
    console.error("[GET /api/community]", error);
    // Return graceful fallback when DB is unavailable
    return Response.json(
      {
        stats: { totalPosts: 0, totalUsers: 0 },
        featured: [],
        warning: "Community data unavailable — the database may not be running.",
      },
      { status: 503 }
    );
  }
}
