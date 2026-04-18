"use client";

import { useState } from "react";
import { Heart, RefreshCw, Eye } from "lucide-react";
import type { CommunityPost } from "@/types";
import { cn, formatRelativeTime } from "@/lib/utils";

// ─── Mode badge colors ────────────────────────────────────────────────────────

const MODE_LABELS: Record<string, string> = {
  wheel: "Wheel",
  handbuilding: "Hand-building",
  sculpting: "Sculpting",
  tile: "Tile",
  jewelry: "Jewelry",
  mixed: "Mixed",
};

const MODE_COLORS: Record<string, string> = {
  wheel: "bg-clay-100 text-clay-700",
  handbuilding: "bg-earth-100 text-earth-700",
  sculpting: "bg-sage-100 text-sage-700",
  tile: "bg-kiln-100 text-kiln-700",
  jewelry: "bg-ash-100 text-ash-700",
  mixed: "bg-clay-100 text-clay-700",
};

// ─── License badge ────────────────────────────────────────────────────────────

const LICENSE_LABELS: Record<string, string> = {
  cc_by: "CC BY",
  cc_by_sa: "CC BY-SA",
  cc_by_nc: "CC BY-NC",
  cc_by_nc_sa: "CC BY-NC-SA",
  all_rights: "© All Rights",
  paid_commercial: "Commercial",
};

// ─── Gradient thumbnails ──────────────────────────────────────────────────────

const THUMB_GRADIENTS = [
  "from-clay-300 to-earth-400",
  "from-kiln-300 to-clay-500",
  "from-sage-300 to-earth-500",
  "from-ash-300 to-clay-400",
  "from-clay-400 to-kiln-500",
  "from-earth-300 to-sage-400",
];

function gradientForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return THUMB_GRADIENTS[Math.abs(hash) % THUMB_GRADIENTS.length];
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProjectCardProps {
  post: CommunityPost & { mode?: string };
  onLike?: (id: string) => void;
  onRemix?: (id: string) => void;
  onView?: (id: string) => void;
  isLiked?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProjectCard({
  post,
  onLike,
  onRemix,
  onView,
  isLiked = false,
}: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(post.likes);

  const gradient = gradientForId(post.id);
  const mode = (post as CommunityPost & { mode?: string }).mode ?? "wheel";
  const modeLabel = MODE_LABELS[mode] ?? "Unknown";
  const modeColor = MODE_COLORS[mode] ?? MODE_COLORS.wheel;
  const licenseLabel = LICENSE_LABELS[post.license] ?? post.license;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked((prev) => !prev);
    setLikeCount((c) => c + (liked ? -1 : 1));
    onLike?.(post.id);
  };

  const handleRemix = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemix?.(post.id);
  };

  const handleView = () => {
    onView?.(post.id);
  };

  return (
    <div
      className="group relative rounded-xl overflow-hidden bg-white border border-clay-200 clay-shadow hover:clay-shadow-md transition-all duration-200 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleView}
    >
      {/* Thumbnail — 4:3 aspect ratio */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {post.thumbnailUrl ? (
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={cn("w-full h-full bg-gradient-to-br", gradient)} />
        )}

        {/* Mode badge — top left */}
        <div className="absolute top-2 left-2">
          <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-semibold", modeColor)}>
            {modeLabel}
          </span>
        </div>

        {/* License badge — bottom right */}
        <div className="absolute bottom-2 right-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/40 text-white backdrop-blur-sm">
            {licenseLabel}
          </span>
        </div>

        {/* Author avatar + name — bottom left */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full overflow-hidden border border-white/60 bg-clay-200 flex-shrink-0">
            {post.author.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={post.author.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-clay-600">
                {post.author.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className="text-[11px] text-white font-medium drop-shadow-sm truncate max-w-[80px]">
            {post.author.name}
          </span>
        </div>

        {/* Hover overlay with action buttons */}
        <div
          className={cn(
            "absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center gap-2 transition-opacity duration-200",
            hovered ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <button
            onClick={handleView}
            className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-clay-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            <Eye size={13} />
            View
          </button>
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
              liked
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-white/90 hover:bg-white text-clay-800"
            )}
          >
            <Heart size={13} className={liked ? "fill-current" : ""} />
            {liked ? "Liked" : "Like"}
          </button>
          <button
            onClick={handleRemix}
            className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-clay-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            <RefreshCw size={13} />
            Remix
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="p-3">
        <h3 className="font-semibold text-clay-900 text-sm leading-snug line-clamp-2 mb-2">
          {post.title}
        </h3>

        {/* Stats row */}
        <div className="flex items-center justify-between text-xs text-clay-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Heart size={11} className={cn(liked ? "fill-red-400 text-red-400" : "")} />
              {likeCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw size={11} />
              {post.remixes.toLocaleString()}
            </span>
          </div>
          <span className="text-clay-300">{formatRelativeTime(post.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
