import { Suspense } from "react";
import { Users, Globe, Flame, ExternalLink } from "lucide-react";
import { CommunityFeed } from "@/components/community/CommunityFeed";

// ─── Server-side metadata ─────────────────────────────────────────────────────

export const metadata = {
  title: "Clay Commons — Clayverse",
  description: "Discover and share handcrafted clay designs with the Clayverse community.",
};

// ─── Sidebar mock data ────────────────────────────────────────────────────────

const TRENDING_TAGS = [
  "wheel-throwing",
  "ash-glaze",
  "porcelain",
  "functional",
  "soda-fire",
  "terracotta",
  "raku",
  "tile-design",
  "jewelry",
  "sculptural",
];

const TOP_CREATORS = [
  { name: "Bo Park", username: "bopark_clay", works: 88, followers: "1.0k", specialty: "Wheel" },
  { name: "Yuki Tanaka", username: "yukistudio", works: 55, followers: "740", specialty: "Jewelry" },
  { name: "Sofia Reyes", username: "sofiaclay", works: 67, followers: "512", specialty: "Tile" },
  { name: "Hana Kim", username: "hanakim", works: 46, followers: "490", specialty: "Wheel" },
  { name: "Maya Chen", username: "mayachen", works: 42, followers: "381", specialty: "Wheel" },
];

// ─── Subcomponents ────────────────────────────────────────────────────────────

function TrendingTagsSidebar() {
  return (
    <div className="bg-white border border-clay-200 rounded-2xl p-5 clay-shadow">
      <div className="flex items-center gap-2 mb-4">
        <Flame size={15} className="text-kiln-500" />
        <h3 className="font-display font-semibold text-clay-800 text-sm">Trending Tags</h3>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TRENDING_TAGS.map((tag) => (
          <button
            key={tag}
            className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-clay-50 text-clay-600 border border-clay-200 hover:bg-clay-100 hover:border-clay-300 transition-colors"
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
}

function TopCreatorsSidebar() {
  return (
    <div className="bg-white border border-clay-200 rounded-2xl p-5 clay-shadow">
      <div className="flex items-center gap-2 mb-4">
        <Users size={15} className="text-sage-600" />
        <h3 className="font-display font-semibold text-clay-800 text-sm">Top Creators</h3>
      </div>
      <div className="space-y-3">
        {TOP_CREATORS.map((creator, i) => (
          <div key={creator.username} className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-clay-300 w-4 flex-shrink-0">
              {i + 1}
            </span>
            {/* Avatar placeholder */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-clay-300 to-earth-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {creator.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-clay-800 truncate">{creator.name}</p>
              <p className="text-[10px] text-clay-400 truncate">
                {creator.works} works &middot; {creator.specialty}
              </p>
            </div>
            <span className="text-[10px] text-clay-400 flex-shrink-0">{creator.followers}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunityStatsBar() {
  return (
    <div className="flex items-center gap-6 text-sm text-clay-500">
      <div className="flex items-center gap-1.5">
        <Globe size={14} className="text-clay-400" />
        <span>Open ceramic design community</span>
      </div>
      <div className="hidden sm:flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-sage-400 inline-block" />
        <span>All skill levels welcome</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-clay-50">
      {/* Page header */}
      <div className="bg-white border-b border-clay-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-clay-900 tracking-tight">
                Clay Commons
              </h1>
              <p className="text-clay-500 mt-1 text-sm leading-relaxed max-w-lg">
                Discover wheel-thrown vessels, hand-built sculptures, tile patterns, and ceramic jewelry shared by artists around the world.
              </p>
              <div className="mt-3">
                <CommunityStatsBar />
              </div>
            </div>

            {/* Share your work CTA */}
            <a
              href="/studio"
              className="inline-flex items-center gap-2 bg-clay-500 hover:bg-clay-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm flex-shrink-0"
            >
              Share your work
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">
          {/* Feed — center / main column */}
          <main className="flex-1 min-w-0">
            <Suspense
              fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl aspect-[4/3] bg-clay-100 animate-pulse" />
                  ))}
                </div>
              }
            >
              <CommunityFeed />
            </Suspense>
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col gap-5 w-64 flex-shrink-0">
            <TrendingTagsSidebar />
            <TopCreatorsSidebar />

            {/* Community values card */}
            <div className="bg-gradient-to-br from-clay-500 to-earth-600 rounded-2xl p-5 text-white">
              <h3 className="font-display font-semibold mb-2 text-sm">Open by default</h3>
              <p className="text-xs leading-relaxed text-clay-100">
                Clayverse believes ceramic knowledge should be shared freely. Most works here are licensed for remixing and learning.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
