"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  RefreshCw,
  Globe,
  Code2,
  Camera,
  ArrowRight,
  Layers,
  Zap,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

// ─── SVG illustrations ─────────────────────────────────────────────────────────

function PotteryWheelIllustration() {
  return (
    <svg viewBox="0 0 280 280" fill="none" className="w-full h-full" aria-hidden="true">
      {/* Background glow */}
      <circle cx="140" cy="140" r="120" fill="url(#glow)" opacity="0.3" />
      {/* Wheel base */}
      <ellipse cx="140" cy="220" rx="70" ry="14" fill="#d3c9b6" />
      {/* Wheel stand */}
      <rect x="130" y="160" width="20" height="65" rx="5" fill="#b9a98e" />
      {/* Wheel head */}
      <ellipse cx="140" cy="160" rx="55" ry="12" fill="#c0824a" />
      <ellipse cx="140" cy="157" rx="52" ry="9" fill="#cf9d6e" />
      {/* Clay vessel on wheel */}
      <path d="M110 150 Q100 120 108 95 Q116 75 140 72 Q164 75 172 95 Q180 120 170 150 Z" fill="#dfbf9b" />
      <ellipse cx="140" cy="74" rx="28" ry="6" fill="#c0824a" />
      <ellipse cx="140" cy="72" rx="20" ry="4" fill="#a8683b" opacity="0.6" />
      {/* Highlight */}
      <path d="M118 120 Q114 105 119 92" stroke="#fdf8f4" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      {/* Texture rings */}
      <path d="M112 130 Q140 126 168 130" stroke="#c0824a" strokeWidth="1.2" opacity="0.35" strokeLinecap="round" />
      <path d="M110 140 Q140 136 170 140" stroke="#c0824a" strokeWidth="1" opacity="0.25" strokeLinecap="round" />
      {/* Splash particles */}
      <circle cx="85" cy="100" r="3" fill="#cf9d6e" opacity="0.5" />
      <circle cx="195" cy="115" r="4" fill="#dfbf9b" opacity="0.4" />
      <circle cx="78" cy="140" r="2" fill="#c0824a" opacity="0.35" />
      <circle cx="202" cy="90" r="2.5" fill="#dfbf9b" opacity="0.45" />
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c0824a" />
          <stop offset="100%" stopColor="#fdf8f4" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// ─── Mode cards data ────────────────────────────────────────────────────────────

const MODE_CARDS = [
  {
    mode: "Wheel",
    color: "from-clay-200 to-clay-300",
    features: ["Lathe-based forming", "Auto-symmetry", "G-force physics"],
    symbol: "⟳",
  },
  {
    mode: "Hand-build",
    color: "from-earth-200 to-earth-300",
    features: ["Coil & slab tools", "Score & slip joints", "Texture stamps"],
    symbol: "✋",
  },
  {
    mode: "Sculpt",
    color: "from-kiln-100 to-kiln-200",
    features: ["Freeform brushes", "Inflate / flatten", "Symmetry planes"],
    symbol: "◆",
  },
  {
    mode: "Tile",
    color: "from-sage-100 to-sage-200",
    features: ["Pattern repeat tools", "Sgraffito drawing", "Relief modeling"],
    symbol: "⊞",
  },
  {
    mode: "Jewelry",
    color: "from-ash-100 to-ash-200",
    features: ["Ring sizer built-in", "Mold generator", "Scale calibration"],
    symbol: "◎",
  },
];

// ─── Mock community projects ────────────────────────────────────────────────────

const COMMUNITY_PROJECTS = [
  { id: 1, title: "Raku Bowl", author: "MiriamClay", likes: 142, remixes: 23, gradient: "from-clay-200 to-clay-400" },
  { id: 2, title: "Sculptural Vessel", author: "TomaszForm", likes: 89, remixes: 11, gradient: "from-earth-200 to-earth-400" },
  { id: 3, title: "Geometric Tile Set", author: "FloraTile", likes: 207, remixes: 45, gradient: "from-sage-100 to-sage-300" },
  { id: 4, title: "Porcelain Ring", author: "JadeJewel", likes: 63, remixes: 8, gradient: "from-ash-100 to-ash-300" },
  { id: 5, title: "Pinch Vessel", author: "Oluwatobi", likes: 178, remixes: 31, gradient: "from-kiln-100 to-kiln-200" },
  { id: 6, title: "Hand-built Planter", author: "SakuraCeramics", likes: 95, remixes: 14, gradient: "from-clay-100 to-earth-200" },
];

// ─── Pricing tiers ─────────────────────────────────────────────────────────────

const PRICING = [
  {
    name: "Free",
    price: "$0",
    description: "Get started with the basics.",
    features: ["3 active projects", "Wheel & hand-build modes", "Community gallery", "Basic physics sim"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Artist",
    price: "$12",
    description: "For serious studio practice.",
    features: ["Unlimited projects", "All 5 modes", "AI Muse (50/mo)", "Advanced physics", "Export STL/OBJ", "Priority support"],
    cta: "Start Artist",
    highlight: true,
  },
  {
    name: "Studio",
    price: "$30",
    description: "For studios and educators.",
    features: ["Everything in Artist", "Class sessions", "Student sharing", "Unlimited AI Muse", "Team collaboration", "White-label export"],
    cta: "Start Studio",
    highlight: false,
  },
];

// ─── Section helpers ────────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-clay-50 text-earth-900 overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-40 glass border-b border-earth-100">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-clay-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">C</span>
            </div>
            <span className="font-display text-base font-semibold text-earth-900">Clayverse</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-earth-600">
            <Link href="#features" className="hover:text-earth-900 transition-colors">Features</Link>
            <Link href="#modes" className="hover:text-earth-900 transition-colors">Modes</Link>
            <Link href="#community" className="hover:text-earth-900 transition-colors">Community</Link>
            <Link href="#pricing" className="hover:text-earth-900 transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button variant="primary" size="sm" asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
        {/* Animated blobs */}
        <motion.div
          className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-clay-200 to-clay-300 opacity-40 blur-3xl"
          animate={{ scale: [1, 1.08, 1], x: [0, 12, 0], y: [0, -8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-gradient-to-br from-kiln-100 to-kiln-200 opacity-30 blur-3xl"
          animate={{ scale: [1, 1.05, 1], x: [0, -10, 0], y: [0, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute top-1/3 left-1/2 h-64 w-64 rounded-full bg-gradient-to-br from-earth-100 to-earth-200 opacity-25 blur-3xl"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-clay-100 px-3 py-1 text-xs font-medium text-clay-700 mb-5">
                  <span className="h-1.5 w-1.5 rounded-full bg-clay-500" />
                  Now in beta
                </span>
                <h1 className="font-display text-5xl md:text-6xl font-semibold text-earth-950 leading-tight text-balance mb-5">
                  The infinite creative studio for clay.
                </h1>
                <p className="text-lg text-earth-600 mb-8 text-balance">
                  Wheel throwing, sculpting, tiles, jewelry — all in one platform. Physics that thinks like clay, AI that sparks ideas, and a community that shares everything.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" size="lg" asChild>
                    <Link href="/signup">
                      Start creating free
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/gallery">See the community</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="flex justify-center"
            >
              <div className="w-64 h-64 md:w-80 md:h-80">
                <PotteryWheelIllustration />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 bg-white border-y border-earth-100">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn>
            <h2 className="font-display text-3xl font-semibold text-earth-900 text-center mb-3">
              Everything clay deserves
            </h2>
            <p className="text-earth-500 text-center mb-12 max-w-xl mx-auto text-balance">
              Designed from the ground up for ceramic artists — not adapted from something else.
            </p>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Layers className="h-6 w-6 text-clay-500" />,
                title: "Every technique",
                desc: "Wheel throwing, hand-building, sculpting, tile-making, and jewelry — five dedicated modes with tools that match how you actually work.",
                chips: ["Wheel", "Hand-build", "Sculpt", "Tile", "Jewelry"],
              },
              {
                icon: <Zap className="h-6 w-6 text-kiln-500" />,
                title: "Physics that thinks like clay",
                desc: "Real shrinkage rates, warping risk analysis, wall-thickness warnings, and kiln schedule recommendations — before you touch a match.",
                chips: ["Shrinkage", "Warping", "Cracking", "Firing"],
              },
              {
                icon: <Wand2 className="h-6 w-6 text-sage-600" />,
                title: "AI Muse",
                desc: "Describe a form, a feeling, a season — Clayverse suggests shapes, glazes, and techniques. Style transfer brings reference images into clay space.",
                chips: ["Text-to-form", "Style transfer", "Glaze suggest"],
              },
            ].map((feat, i) => (
              <FadeIn key={feat.title} delay={i * 0.1}>
                <div className="rounded-2xl bg-clay-50 border border-earth-100 p-6 clay-shadow flex flex-col gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white border border-earth-100 flex items-center justify-center clay-shadow">
                    {feat.icon}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-earth-900 mb-1.5">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-earth-500 leading-relaxed">{feat.desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {feat.chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full bg-white border border-earth-200 px-2.5 py-0.5 text-xs text-earth-600"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mode showcase ── */}
      <section id="modes" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn>
            <h2 className="font-display text-3xl font-semibold text-earth-900 mb-3">
              Five modes, one studio
            </h2>
            <p className="text-earth-500 mb-8 max-w-xl text-balance">
              Each mode is purpose-built. Switch seamlessly within the same project.
            </p>
          </FadeIn>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
            {MODE_CARDS.map((card, i) => (
              <motion.div
                key={card.mode}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={cn(
                  "flex-none w-56 snap-start rounded-2xl border border-earth-100 overflow-hidden clay-shadow",
                  "bg-gradient-to-br",
                  card.color
                )}
              >
                <div className="h-32 flex items-center justify-center text-5xl opacity-30">
                  {card.symbol}
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-4">
                  <h3 className="font-display text-base font-semibold text-earth-900 mb-2">
                    {card.mode}
                  </h3>
                  <ul className="flex flex-col gap-1">
                    {card.features.map((f) => (
                      <li key={f} className="text-xs text-earth-600 flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-clay-400 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Community preview ── */}
      <section id="community" className="py-20 bg-white border-y border-earth-100">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="font-display text-3xl font-semibold text-earth-900 mb-2">
                  Made by the community
                </h2>
                <p className="text-earth-500 text-balance max-w-md">
                  Every piece is remixable. Learn from others, remix their work, share yours.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/gallery">View all</Link>
              </Button>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {COMMUNITY_PROJECTS.map((proj, i) => (
              <FadeIn key={proj.id} delay={i * 0.07}>
                <div className="group relative rounded-2xl overflow-hidden clay-shadow border border-earth-100 aspect-square cursor-pointer">
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br transition-transform duration-300 group-hover:scale-105",
                      proj.gradient
                    )}
                  />
                  <div className="absolute inset-0 flex flex-col justify-end p-3">
                    <div className="rounded-xl bg-white/85 backdrop-blur-sm p-2.5">
                      <p className="font-display text-sm font-semibold text-earth-900 truncate">
                        {proj.title}
                      </p>
                      <p className="text-xs text-earth-500 mb-1.5">by {proj.author}</p>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-earth-500">
                          <Heart className="h-3 w-3" /> {proj.likes}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-earth-500">
                          <RefreshCw className="h-3 w-3" /> {proj.remixes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn>
            <h2 className="font-display text-3xl font-semibold text-earth-900 text-center mb-2">
              Simple pricing
            </h2>
            <p className="text-earth-500 text-center mb-12">Start free. Scale when you're ready.</p>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PRICING.map((tier, i) => (
              <FadeIn key={tier.name} delay={i * 0.1}>
                <div
                  className={cn(
                    "rounded-2xl border p-6 flex flex-col gap-5",
                    tier.highlight
                      ? "bg-clay-500 border-clay-600 clay-shadow-md text-white"
                      : "bg-clay-50 border-earth-100 clay-shadow"
                  )}
                >
                  <div>
                    <p
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wider mb-1",
                        tier.highlight ? "text-clay-100" : "text-earth-500"
                      )}
                    >
                      {tier.name}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span
                        className={cn(
                          "font-display text-3xl font-semibold",
                          tier.highlight ? "text-white" : "text-earth-900"
                        )}
                      >
                        {tier.price}
                      </span>
                      {tier.price !== "$0" && (
                        <span
                          className={cn(
                            "text-sm",
                            tier.highlight ? "text-clay-100" : "text-earth-500"
                          )}
                        >
                          /mo
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-sm mt-1",
                        tier.highlight ? "text-clay-100" : "text-earth-500"
                      )}
                    >
                      {tier.description}
                    </p>
                  </div>
                  <ul className="flex flex-col gap-2 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full shrink-0",
                            tier.highlight ? "bg-clay-200" : "bg-clay-400"
                          )}
                        />
                        <span className={tier.highlight ? "text-clay-50" : "text-earth-700"}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={tier.highlight ? "secondary" : "outline"}
                    className={cn(
                      "w-full",
                      tier.highlight && "bg-white text-clay-700 hover:bg-clay-50"
                    )}
                    asChild
                  >
                    <Link href="/signup">{tier.cta}</Link>
                  </Button>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-earth-200 bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-full bg-clay-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">C</span>
                </div>
                <span className="font-display text-base font-semibold text-earth-900">Clayverse</span>
              </div>
              <p className="text-sm text-earth-500 text-balance">
                The infinite creative studio for clay artists worldwide.
              </p>
            </div>
            {[
              { heading: "Product", links: ["Studio", "Gallery", "Community", "Pricing"] },
              { heading: "Company", links: ["About", "Blog", "Careers", "Contact"] },
              { heading: "Legal", links: ["Privacy", "Terms", "Cookies"] },
            ].map((col) => (
              <div key={col.heading}>
                <p className="text-xs font-semibold uppercase tracking-wider text-earth-400 mb-3">
                  {col.heading}
                </p>
                <ul className="flex flex-col gap-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-sm text-earth-500 hover:text-earth-800 transition-colors"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-earth-100">
            <p className="text-xs text-earth-400">
              © 2026 Clayverse. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: Globe, label: "Website" },
                { Icon: Code2, label: "GitHub" },
                { Icon: Camera, label: "Instagram" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="rounded-lg p-1.5 text-earth-400 hover:text-earth-700 hover:bg-earth-50 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
