"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Search, Heart, RefreshCw, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

// ─── Mock data ─────────────────────────────────────────────────────────────────

type GalleryMode = "All" | "Wheel" | "Sculpt" | "Tile" | "Jewelry" | "Handbuilding";
type SortOption = "Recent" | "Popular" | "Remixes";

const MOCK_PROJECTS = [
  {
    id: "1",
    title: "Faceted Raku Bowl",
    author: "MiriamClay",
    authorInitials: "MC",
    likes: 142,
    remixes: 23,
    views: 1204,
    mode: "Wheel" as GalleryMode,
    gradient: "from-clay-200 via-clay-300 to-clay-400",
    height: "h-52",
  },
  {
    id: "2",
    title: "Sculptural Forest Vessel",
    author: "TomaszForm",
    authorInitials: "TF",
    likes: 89,
    remixes: 11,
    views: 768,
    mode: "Sculpt" as GalleryMode,
    gradient: "from-earth-200 via-earth-300 to-earth-400",
    height: "h-40",
  },
  {
    id: "3",
    title: "Geometric Tile Set",
    author: "FloraTile",
    authorInitials: "FT",
    likes: 207,
    remixes: 45,
    views: 2341,
    mode: "Tile" as GalleryMode,
    gradient: "from-sage-100 via-sage-200 to-sage-300",
    height: "h-60",
  },
  {
    id: "4",
    title: "Porcelain Stacking Rings",
    author: "JadeJewel",
    authorInitials: "JJ",
    likes: 63,
    remixes: 8,
    views: 492,
    mode: "Jewelry" as GalleryMode,
    gradient: "from-ash-100 via-ash-200 to-ash-300",
    height: "h-44",
  },
  {
    id: "5",
    title: "Coil-built Planter",
    author: "OluwaClay",
    authorInitials: "OC",
    likes: 178,
    remixes: 31,
    views: 1567,
    mode: "Handbuilding" as GalleryMode,
    gradient: "from-kiln-50 via-kiln-100 to-kiln-200",
    height: "h-48",
  },
  {
    id: "6",
    title: "Slab-built Lantern",
    author: "SakuraCeramics",
    authorInitials: "SC",
    likes: 95,
    remixes: 14,
    views: 830,
    mode: "Handbuilding" as GalleryMode,
    gradient: "from-clay-100 via-earth-100 to-earth-200",
    height: "h-56",
  },
  {
    id: "7",
    title: "Yunomi Tea Cup",
    author: "KenshiWheels",
    authorInitials: "KW",
    likes: 312,
    remixes: 67,
    views: 3102,
    mode: "Wheel" as GalleryMode,
    gradient: "from-earth-100 via-clay-200 to-clay-300",
    height: "h-40",
  },
  {
    id: "8",
    title: "Relief Leaf Tile",
    author: "GardenGlaze",
    authorInitials: "GG",
    likes: 54,
    remixes: 9,
    views: 412,
    mode: "Tile" as GalleryMode,
    gradient: "from-sage-200 via-sage-100 to-earth-50",
    height: "h-52",
  },
  {
    id: "9",
    title: "Abstract Figural Bust",
    author: "RodinClub",
    authorInitials: "RC",
    likes: 241,
    remixes: 28,
    views: 2890,
    mode: "Sculpt" as GalleryMode,
    gradient: "from-clay-300 via-earth-200 to-earth-300",
    height: "h-64",
  },
  {
    id: "10",
    title: "Ear Cuff Collection",
    author: "ClayJewelryStudio",
    authorInitials: "CJ",
    likes: 77,
    remixes: 16,
    views: 629,
    mode: "Jewelry" as GalleryMode,
    gradient: "from-ash-200 via-ash-100 to-clay-50",
    height: "h-44",
  },
];

const FILTERS: GalleryMode[] = ["All", "Wheel", "Sculpt", "Tile", "Jewelry", "Handbuilding"];
const SORTS: SortOption[] = ["Recent", "Popular", "Remixes"];

const MODE_BADGE_VARIANTS: Record<string, "default" | "success" | "warning" | "error" | "info"> = {
  Wheel: "info",
  Sculpt: "default",
  Tile: "success",
  Jewelry: "warning",
  Handbuilding: "error",
};

// ─── Project card ──────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: (typeof MOCK_PROJECTS)[0] }) {
  const [hovered, setHovered] = React.useState(false);
  const [liked, setLiked] = React.useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.3 }}
      className="relative group rounded-2xl overflow-hidden border border-earth-100 clay-shadow cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      <div
        className={cn(
          "bg-gradient-to-br transition-transform duration-300 group-hover:scale-105",
          project.gradient,
          project.height
        )}
      />

      {/* Hover overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-earth-950/50 flex items-center justify-center gap-2 transition-opacity duration-200",
          hovered ? "opacity-100" : "opacity-0"
        )}
      >
        <button className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-earth-800 hover:bg-clay-50 transition-colors">
          <Eye className="h-3.5 w-3.5" />
          View
        </button>
        <button
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            liked
              ? "bg-clay-500 text-white"
              : "bg-white text-earth-800 hover:bg-clay-50"
          )}
          onClick={(e) => {
            e.stopPropagation();
            setLiked((v) => !v);
          }}
        >
          <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} />
          {liked ? "Liked" : "Like"}
        </button>
        <button className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-earth-800 hover:bg-clay-50 transition-colors">
          <RefreshCw className="h-3.5 w-3.5" />
          Remix
        </button>
      </div>

      {/* Info */}
      <div className="bg-white p-3 border-t border-earth-100">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-medium text-earth-900 truncate">{project.title}</p>
          <Badge variant={MODE_BADGE_VARIANTS[project.mode] ?? "default"} className="shrink-0 text-[10px]">
            {project.mode}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Avatar name={project.author} size="sm" />
            <span className="text-xs text-earth-500 truncate">{project.author}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1 text-xs text-earth-400">
              <Heart className={cn("h-3 w-3", liked && project.id === project.id && "fill-clay-500 text-clay-500")} />
              {project.likes + (liked ? 1 : 0)}
            </span>
            <span className="flex items-center gap-1 text-xs text-earth-400">
              <RefreshCw className="h-3 w-3" />
              {project.remixes}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main gallery component ────────────────────────────────────────────────────

export function GalleryClient() {
  const [search, setSearch] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState<GalleryMode>("All");
  const [sortBy, setSortBy] = React.useState<SortOption>("Recent");

  const filtered = React.useMemo(() => {
    let result = MOCK_PROJECTS;

    if (activeFilter !== "All") {
      result = result.filter((p) => p.mode === activeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q)
      );
    }

    if (sortBy === "Popular") {
      result = [...result].sort((a, b) => b.likes - a.likes);
    } else if (sortBy === "Remixes") {
      result = [...result].sort((a, b) => b.remixes - a.remixes);
    }

    return result;
  }, [search, activeFilter, sortBy]);

  // Split into masonry columns
  const col1 = filtered.filter((_, i) => i % 3 === 0);
  const col2 = filtered.filter((_, i) => i % 3 === 1);
  const col3 = filtered.filter((_, i) => i % 3 === 2);

  return (
    <div className="min-h-screen bg-clay-50">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-earth-100 px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-display text-xl font-semibold text-earth-900">
                Community Gallery
              </h1>
              <p className="text-xs text-earth-500">{filtered.length} projects</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="w-48">
                <Input
                  placeholder="Search projects…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search className="h-3.5 w-3.5" />}
                  className="h-8 text-xs"
                />
              </div>
              {/* Sort */}
              <div className="flex rounded-lg border border-earth-200 bg-white overflow-hidden">
                {SORTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium transition-colors",
                      s === sortBy
                        ? "bg-clay-500 text-white"
                        : "text-earth-600 hover:bg-earth-50"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-500",
                  f === activeFilter
                    ? "bg-clay-500 text-white"
                    : "bg-white border border-earth-200 text-earth-600 hover:border-earth-300 hover:text-earth-800"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Masonry grid */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-earth-100 flex items-center justify-center mb-4 text-2xl">
              🏺
            </div>
            <p className="font-display text-base font-semibold text-earth-700 mb-1">
              No projects found
            </p>
            <p className="text-sm text-earth-400">
              Try a different filter or search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-start">
            <div className="flex flex-col gap-4">
              {col1.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
            <div className="flex flex-col gap-4 md:mt-8">
              {col2.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
            <div className="flex flex-col gap-4 md:mt-4">
              {col3.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
