"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, TrendingUp, Clock, RefreshCw } from "lucide-react";
import { ProjectCard } from "./ProjectCard";
import type { CommunityPost, ModelingMode } from "@/types";
import { cn } from "@/lib/utils";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_POSTS: (CommunityPost & { mode: string })[] = [
  {
    id: "post_001",
    projectId: "proj_001",
    authorId: "user_001",
    author: { id: "user_001", name: "Maya Chen", username: "mayachen", avatarUrl: undefined, bio: "Wheel-throwing since 2015", specialty: ["wheel"], location: "Portland, OR", projectCount: 42, followerCount: 381, followingCount: 120, createdAt: new Date("2022-01-01") },
    title: "Morning Mist Tea Bowl Series",
    description: "A series of five tea bowls inspired by Pacific Northwest fog. Glazed with ash and iron oxide.",
    thumbnailUrl: "",
    tags: ["teabowl", "wheel", "ash-glaze"],
    likes: 247,
    remixes: 12,
    views: 1840,
    license: "cc_by",
    createdAt: new Date("2024-02-14"),
    mode: "wheel",
  },
  {
    id: "post_002",
    projectId: "proj_002",
    authorId: "user_002",
    author: { id: "user_002", name: "Tariq Hassan", username: "tariqceramics", avatarUrl: undefined, bio: "", specialty: ["sculpting"], location: "Cairo, Egypt", projectCount: 18, followerCount: 94, followingCount: 55, createdAt: new Date("2021-06-10") },
    title: "Ancient Spirit Vessel",
    description: "Hand-sculpted vessel drawing from ancient Nubian pottery traditions.",
    thumbnailUrl: "",
    tags: ["sculpture", "handbuilt", "terracotta"],
    likes: 189,
    remixes: 4,
    views: 920,
    license: "cc_by_nc",
    createdAt: new Date("2024-03-01"),
    mode: "sculpting",
  },
  {
    id: "post_003",
    projectId: "proj_003",
    authorId: "user_003",
    author: { id: "user_003", name: "Sofia Reyes", username: "sofiaclay", avatarUrl: undefined, bio: "Tile artist & pattern lover", specialty: ["tile"], location: "Mexico City", projectCount: 67, followerCount: 512, followingCount: 210, createdAt: new Date("2020-04-20") },
    title: "Geometric Encaustic Floor Tile Set",
    description: "A 12-tile set based on traditional Moroccan zellij patterns, adapted for modern interiors.",
    thumbnailUrl: "",
    tags: ["tile", "geometric", "pattern"],
    likes: 403,
    remixes: 28,
    views: 3100,
    license: "cc_by_sa",
    createdAt: new Date("2024-01-10"),
    mode: "tile",
  },
  {
    id: "post_004",
    projectId: "proj_004",
    authorId: "user_004",
    author: { id: "user_004", name: "Lena Fischer", username: "lenafischer", avatarUrl: undefined, bio: "", specialty: ["wheel", "handbuilding"], location: "Berlin, Germany", projectCount: 29, followerCount: 208, followingCount: 87, createdAt: new Date("2022-09-05") },
    title: "Coiled Vase — Organic Form",
    description: "Built from thick coils, left partially unsmoothed for texture. Soda-fired at cone 10.",
    thumbnailUrl: "",
    tags: ["coil", "handbuilding", "soda-fire"],
    likes: 134,
    remixes: 7,
    views: 680,
    license: "cc_by",
    createdAt: new Date("2024-02-28"),
    mode: "handbuilding",
  },
  {
    id: "post_005",
    projectId: "proj_005",
    authorId: "user_005",
    author: { id: "user_005", name: "Yuki Tanaka", username: "yukistudio", avatarUrl: undefined, bio: "Jewelry ceramicist", specialty: ["jewelry"], location: "Kyoto, Japan", projectCount: 55, followerCount: 740, followingCount: 160, createdAt: new Date("2019-11-11") },
    title: "Porcelain Moon Earrings",
    description: "Ultra-thin porcelain earrings cast from hand-carved molds. Available as remixable template.",
    thumbnailUrl: "",
    tags: ["jewelry", "porcelain", "earrings"],
    likes: 581,
    remixes: 41,
    views: 4300,
    license: "cc_by",
    createdAt: new Date("2024-03-08"),
    mode: "jewelry",
  },
  {
    id: "post_006",
    projectId: "proj_006",
    authorId: "user_006",
    author: { id: "user_006", name: "Amara Obi", username: "amaraceramics", avatarUrl: undefined, bio: "", specialty: ["wheel"], location: "Lagos, Nigeria", projectCount: 14, followerCount: 63, followingCount: 44, createdAt: new Date("2023-03-18") },
    title: "Terracotta Water Carafe",
    description: "Functional carafe thrown on the wheel. The natural terracotta keeps water cool without refrigeration.",
    thumbnailUrl: "",
    tags: ["functional", "terracotta", "wheel"],
    likes: 98,
    remixes: 3,
    views: 470,
    license: "all_rights",
    createdAt: new Date("2024-03-12"),
    mode: "wheel",
  },
  {
    id: "post_007",
    projectId: "proj_007",
    authorId: "user_007",
    author: { id: "user_007", name: "Bo Park", username: "bopark_clay", avatarUrl: undefined, bio: "Functional stoneware", specialty: ["wheel"], location: "Seoul, South Korea", projectCount: 88, followerCount: 1020, followingCount: 310, createdAt: new Date("2018-07-22") },
    title: "Yunomi Collection — Ash Glaze",
    description: "Set of four yunomi cups thrown at cone 6. Wood ash glaze with copper carbonate undertones.",
    thumbnailUrl: "",
    tags: ["yunomi", "ash-glaze", "functional"],
    likes: 712,
    remixes: 56,
    views: 5600,
    license: "cc_by_sa",
    createdAt: new Date("2024-01-22"),
    mode: "wheel",
  },
  {
    id: "post_008",
    projectId: "proj_008",
    authorId: "user_008",
    author: { id: "user_008", name: "Priya Nair", username: "priyacreates", avatarUrl: undefined, bio: "", specialty: ["sculpting", "handbuilding"], location: "Mumbai, India", projectCount: 21, followerCount: 145, followingCount: 70, createdAt: new Date("2022-12-01") },
    title: "Goddess Form — Slab Build",
    description: "Life-size upper torso sculpture built from thick stoneware slabs. Cone 6 reduction.",
    thumbnailUrl: "",
    tags: ["sculpture", "figure", "slab"],
    likes: 325,
    remixes: 9,
    views: 2100,
    license: "cc_by_nc",
    createdAt: new Date("2024-02-05"),
    mode: "sculpting",
  },
  {
    id: "post_009",
    projectId: "proj_009",
    authorId: "user_009",
    author: { id: "user_009", name: "Carlos Mendez", username: "carlosceramica", avatarUrl: undefined, bio: "Tile muralist", specialty: ["tile"], location: "Barcelona, Spain", projectCount: 33, followerCount: 287, followingCount: 102, createdAt: new Date("2021-05-14") },
    title: "Mediterranean Backsplash Tiles",
    description: "12cm square tiles with a blue-and-white underglazing. Dishwasher safe at cone 06.",
    thumbnailUrl: "",
    tags: ["tile", "mediterranean", "blue-white"],
    likes: 218,
    remixes: 15,
    views: 1500,
    license: "cc_by",
    createdAt: new Date("2024-02-20"),
    mode: "tile",
  },
  {
    id: "post_010",
    projectId: "proj_010",
    authorId: "user_010",
    author: { id: "user_010", name: "Hana Kim", username: "hanakim", avatarUrl: undefined, bio: "Porcelain specialist", specialty: ["wheel"], location: "Vancouver, Canada", projectCount: 46, followerCount: 490, followingCount: 130, createdAt: new Date("2020-09-15") },
    title: "Translucent Porcelain Lamp Shade",
    description: "Thrown then altered. Ultra-thin walls (2 mm) allow light to pass through the clay body.",
    thumbnailUrl: "",
    tags: ["porcelain", "lamp", "translucent"],
    likes: 476,
    remixes: 22,
    views: 3800,
    license: "cc_by",
    createdAt: new Date("2024-03-15"),
    mode: "wheel",
  },
];

// ─── Filters & sorts ──────────────────────────────────────────────────────────

type FilterMode = "all" | ModelingMode;
type SortMode = "recent" | "popular" | "remixes";

const FILTERS: { id: FilterMode; label: string }[] = [
  { id: "all", label: "All" },
  { id: "wheel", label: "Wheel" },
  { id: "handbuilding", label: "Hand-building" },
  { id: "sculpting", label: "Sculpting" },
  { id: "tile", label: "Tile" },
  { id: "jewelry", label: "Jewelry" },
];

const SORTS: { id: SortMode; label: string; icon: React.ReactNode }[] = [
  { id: "recent", label: "Most Recent", icon: <Clock size={13} /> },
  { id: "popular", label: "Most Liked", icon: <TrendingUp size={13} /> },
  { id: "remixes", label: "Most Remixed", icon: <RefreshCw size={13} /> },
];

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden border border-clay-200 bg-white clay-shadow animate-pulse">
      <div className="aspect-[4/3] bg-clay-100" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-clay-100 rounded w-3/4" />
        <div className="h-3 bg-clay-100 rounded w-1/2" />
        <div className="flex justify-between mt-2">
          <div className="h-3 bg-clay-100 rounded w-16" />
          <div className="h-3 bg-clay-100 rounded w-10" />
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CommunityFeedProps {
  initialFilter?: FilterMode;
}

export function CommunityFeed({ initialFilter = "all" }: CommunityFeedProps) {
  const [filter, setFilter] = useState<FilterMode>(initialFilter);
  const [sort, setSort] = useState<SortMode>("recent");
  const [posts, setPosts] = useState<(CommunityPost & { mode: string })[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<(CommunityPost & { mode: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  // Simulate initial load with mock data
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setPosts(MOCK_POSTS);
      setLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Filter + sort + paginate
  useEffect(() => {
    let filtered = posts.filter((p) => filter === "all" || p.mode === filter);

    if (sort === "popular") {
      filtered = [...filtered].sort((a, b) => b.likes - a.likes);
    } else if (sort === "remixes") {
      filtered = [...filtered].sort((a, b) => b.remixes - a.remixes);
    } else {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    setDisplayedPosts(filtered.slice(0, page * PAGE_SIZE));
  }, [posts, filter, sort, page]);

  const totalFiltered = posts.filter((p) => filter === "all" || p.mode === filter).length;
  const hasMore = displayedPosts.length < totalFiltered;

  const handleFilterChange = (f: FilterMode) => {
    setFilter(f);
    setPage(1);
  };

  const handleSortChange = (s: SortMode) => {
    setSort(s);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Filter + sort toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Mode filter pills */}
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => handleFilterChange(f.id)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                filter === f.id
                  ? "bg-clay-500 text-white border-clay-500"
                  : "bg-white text-clay-600 border-clay-200 hover:border-clay-400"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort buttons */}
        <div className="flex items-center gap-1 text-xs text-clay-500">
          <SlidersHorizontal size={13} />
          <span className="mr-1 hidden sm:inline">Sort:</span>
          {SORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSortChange(s.id)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full border transition-colors",
                sort === s.id
                  ? "bg-earth-100 text-earth-700 border-earth-300"
                  : "bg-white text-clay-500 border-clay-200 hover:border-clay-300"
              )}
            >
              {s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : displayedPosts.length === 0 ? (
        <div className="text-center py-20 text-clay-400">
          <p className="text-base font-medium mb-1">No posts yet</p>
          <p className="text-sm">Be the first to share in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedPosts.map((post) => (
            <ProjectCard
              key={post.id}
              post={post}
              onLike={(id) => console.log("like", id)}
              onRemix={(id) => console.log("remix", id)}
              onView={(id) => console.log("view", id)}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {!loading && hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-6 py-2.5 border border-clay-300 text-clay-700 hover:bg-clay-50 rounded-full text-sm font-medium transition-colors"
          >
            Load more
          </button>
        </div>
      )}

      {/* Count */}
      {!loading && displayedPosts.length > 0 && (
        <p className="text-center text-xs text-clay-400 pb-2">
          Showing {displayedPosts.length} of {totalFiltered} works
        </p>
      )}
    </div>
  );
}

export default CommunityFeed;
