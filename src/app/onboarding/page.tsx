"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/appStore";
import { Button } from "@/components/ui/Button";

// ─── Data ──────────────────────────────────────────────────────────────────────

const PERSONAS = [
  { id: "potter", label: "Potter", icon: "⟳", desc: "Wheel-throwing and kiln-fired work" },
  { id: "sculptor", label: "Sculptor", icon: "◆", desc: "Figurative and abstract forms" },
  { id: "handbuilder", label: "Hand-builder", icon: "✋", desc: "Coil, slab, and pinch work" },
  { id: "tile", label: "Tile Artist", icon: "⊞", desc: "Decorative and architectural tiles" },
  { id: "jewelry", label: "Jewelry Maker", icon: "◎", desc: "Wearable clay and polymer pieces" },
  { id: "educator", label: "Educator", icon: "📚", desc: "Teaching clay arts in a classroom" },
  { id: "hobbyist", label: "Hobbyist", icon: "🌱", desc: "Exploring clay for the joy of it" },
];

const CLAY_TYPES = [
  { id: "stoneware", label: "Fired Stoneware", desc: "High-fire, durable" },
  { id: "porcelain", label: "Fired Porcelain", desc: "Translucent, refined" },
  { id: "air_dry", label: "Air-dry Clay", desc: "No kiln required" },
  { id: "polymer", label: "Polymer Clay", desc: "Oven-cure, great for jewelry" },
  { id: "printable", label: "3D Printable", desc: "Digital clay workflow" },
  { id: "mixed", label: "Mixed / Exploratory", desc: "I work with multiple types" },
];

const TEMPLATES = [
  {
    id: "bowl",
    label: "Wheel-thrown Bowl",
    gradient: "from-clay-200 to-clay-400",
    symbol: "⟳",
    hint: "Classic turned form with foot ring",
  },
  {
    id: "vessel",
    label: "Sculptural Vessel",
    gradient: "from-earth-200 to-earth-400",
    symbol: "◆",
    hint: "Organic, hand-built asymmetric vase",
  },
  {
    id: "tile",
    label: "Tile Panel",
    gradient: "from-sage-100 to-sage-300",
    symbol: "⊞",
    hint: "6-tile repeated relief pattern",
  },
];

// ─── Step components ───────────────────────────────────────────────────────────

function Step1({
  selected,
  onSelect,
}: {
  selected: string[];
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-earth-900 mb-1">
        What brings you to Clayverse?
      </h2>
      <p className="text-earth-500 mb-6 text-sm">Select all that apply.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {PERSONAS.map((p) => {
          const active = selected.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-500",
                active
                  ? "border-clay-400 bg-clay-100 clay-shadow"
                  : "border-earth-200 bg-white hover:border-earth-300 hover:bg-clay-50"
              )}
            >
              {active && (
                <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-clay-500">
                  <Check className="h-3 w-3 text-white" />
                </span>
              )}
              <span className="text-2xl">{p.icon}</span>
              <span className="text-sm font-medium text-earth-800">{p.label}</span>
              <span className="text-xs text-earth-500 leading-tight">{p.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step2({
  selected,
  onSelect,
}: {
  selected: string[];
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-earth-900 mb-1">
        What kind of clay do you work with?
      </h2>
      <p className="text-earth-500 mb-6 text-sm">Select all that apply.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CLAY_TYPES.map((c) => {
          const active = selected.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={cn(
                "relative flex flex-col gap-1.5 rounded-2xl border p-4 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-500",
                active
                  ? "border-clay-400 bg-clay-100 clay-shadow"
                  : "border-earth-200 bg-white hover:border-earth-300 hover:bg-clay-50"
              )}
            >
              {active && (
                <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-clay-500">
                  <Check className="h-3 w-3 text-white" />
                </span>
              )}
              <span className="text-sm font-semibold text-earth-800">{c.label}</span>
              <span className="text-xs text-earth-500">{c.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step3({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const [hovered, setHovered] = React.useState<string | null>(null);

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-earth-900 mb-1">
        Pick your first project
      </h2>
      <p className="text-earth-500 mb-6 text-sm">
        You can always start from scratch later.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TEMPLATES.map((t) => {
          const active = selected === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              onMouseEnter={() => setHovered(t.id)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                "relative overflow-hidden rounded-2xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-500",
                active
                  ? "border-clay-400 clay-shadow-md scale-[1.02]"
                  : "border-earth-200 hover:border-earth-300 hover:clay-shadow"
              )}
            >
              <div
                className={cn(
                  "h-36 bg-gradient-to-br flex items-center justify-center text-5xl opacity-40 transition-opacity duration-200",
                  t.gradient,
                  (hovered === t.id || active) && "opacity-60"
                )}
              >
                {t.symbol}
              </div>
              <div className="p-3 bg-white border-t border-earth-100 text-left">
                <p className="text-sm font-medium text-earth-800">{t.label}</p>
                <p className="text-xs text-earth-500 mt-0.5">{t.hint}</p>
              </div>
              {active && (
                <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-clay-500">
                  <Check className="h-3.5 w-3.5 text-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step4() {
  return (
    <div className="flex flex-col items-center text-center py-6">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="h-20 w-20 rounded-full bg-clay-500 flex items-center justify-center mb-6"
      >
        <Check className="h-10 w-10 text-white" />
      </motion.div>
      <h2 className="font-display text-3xl font-semibold text-earth-900 mb-3">
        You&apos;re ready!
      </h2>
      <p className="text-earth-500 max-w-sm text-balance mb-2">
        Your studio is set up. Dive in, explore the tools, and start creating.
      </p>
      <p className="text-sm text-earth-400">Everything is saved automatically.</p>
    </div>
  );
}

// ─── Main onboarding page ───────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const [step, setStep] = React.useState(0);
  const [personas, setPersonas] = React.useState<string[]>([]);
  const [clayTypes, setClayTypes] = React.useState<string[]>([]);
  const [template, setTemplate] = React.useState<string | null>(null);
  const [direction, setDirection] = React.useState(1);

  const TOTAL_STEPS = 4;

  const toggleItem = (list: string[], setList: (v: string[]) => void, id: string) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const canNext =
    (step === 0 && personas.length > 0) ||
    (step === 1 && clayTypes.length > 0) ||
    (step === 2 && template !== null) ||
    step === 3;

  const handleNext = () => {
    if (step === TOTAL_STEPS - 1) {
      completeOnboarding();
      router.push("/studio");
      return;
    }
    setDirection(1);
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  return (
    <div
      className="min-h-screen bg-clay-50 flex flex-col items-center justify-center px-4 py-12"
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg, transparent, transparent 40px, rgb(211 201 182 / 0.15) 40px, rgb(211 201 182 / 0.15) 41px)",
      }}
    >
      <div className="w-full max-w-2xl">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === step
                  ? "w-6 bg-clay-500"
                  : i < step
                  ? "w-2 bg-clay-300"
                  : "w-2 bg-earth-200"
              )}
            />
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white border border-earth-100 clay-shadow-md p-6 md:p-8 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {step === 0 && (
                <Step1
                  selected={personas}
                  onSelect={(id) => toggleItem(personas, setPersonas, id)}
                />
              )}
              {step === 1 && (
                <Step2
                  selected={clayTypes}
                  onSelect={(id) => toggleItem(clayTypes, setClayTypes, id)}
                />
              )}
              {step === 2 && (
                <Step3
                  selected={template}
                  onSelect={setTemplate}
                />
              )}
              {step === 3 && <Step4 />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5">
          <div>
            {step > 0 && (
              <Button variant="ghost" onClick={handleBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </Button>
            )}
          </div>
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!canNext}
            rightIcon={step < TOTAL_STEPS - 1 ? <ArrowRight className="h-4 w-4" /> : undefined}
          >
            {step === TOTAL_STEPS - 1 ? "Enter the studio" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
