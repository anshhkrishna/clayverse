"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Users,
  Grid3x3,
  FlaskConical,
  Settings,
  ChevronLeft,
  ChevronRight,
  Circle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/stores/studioStore";
import type { ModelingMode } from "@/types";

const NAV_ITEMS = [
  { href: "/studio", label: "Studio", icon: Layers },
  { href: "/community", label: "Community", icon: Users },
  { href: "/gallery", label: "Gallery", icon: Grid3x3 },
  { href: "/materials", label: "Materials", icon: FlaskConical },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

const MODES: { value: ModelingMode; label: string; symbol: string }[] = [
  { value: "wheel", label: "Wheel", symbol: "⟳" },
  { value: "handbuilding", label: "Hand-build", symbol: "✋" },
  { value: "sculpting", label: "Sculpt", symbol: "◆" },
  { value: "tile", label: "Tile", symbol: "⊞" },
  { value: "jewelry", label: "Jewelry", symbol: "◎" },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { project, isDirty, isSaving, canvasView, setMode } = useStudioStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
      className={cn(
        "relative flex h-full flex-col bg-clay-50 border-r border-earth-200",
        "overflow-hidden shrink-0"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-earth-100 px-4 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-500 rounded-lg"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-clay-500">
            <span className="text-xs font-bold text-white">C</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-display text-base font-semibold text-earth-900 whitespace-nowrap overflow-hidden"
              >
                Clayverse
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 p-2 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium",
                  "transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-500",
                  isActive
                    ? "bg-clay-100 text-clay-700"
                    : "text-earth-600 hover:bg-earth-50 hover:text-earth-800"
                )}
                title={collapsed ? label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>

        {/* Mode switcher */}
        <div className="mt-4">
          {!collapsed && (
            <p className="px-2.5 pb-1.5 text-xs font-semibold uppercase tracking-wider text-earth-400">
              Mode
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            {MODES.map((mode) => {
              const isActive = canvasView.mode === mode.value;
              return (
                <button
                  key={mode.value}
                  onClick={() => setMode(mode.value)}
                  title={collapsed ? mode.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-left w-full",
                    "transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-500",
                    isActive
                      ? "bg-clay-500 text-white"
                      : "text-earth-600 hover:bg-earth-50 hover:text-earth-800"
                  )}
                >
                  <span className="h-4 w-4 shrink-0 flex items-center justify-center text-sm leading-none">
                    {mode.symbol}
                  </span>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {mode.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Project info */}
      {project && (
        <div className="border-t border-earth-100 p-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {isSaving ? (
              <Circle className="h-3 w-3 shrink-0 text-kiln-500 animate-pulse" />
            ) : isDirty ? (
              <Circle className="h-3 w-3 shrink-0 text-earth-400" />
            ) : (
              <CheckCircle2 className="h-3 w-3 shrink-0 text-sage-500" />
            )}
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col min-w-0 overflow-hidden"
                >
                  <span className="text-xs font-medium text-earth-700 truncate">
                    {project.name}
                  </span>
                  <span className="text-xs text-earth-400">
                    {isSaving ? "Saving…" : isDirty ? "Unsaved changes" : "Saved"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute -right-3 top-[4.5rem] z-10",
          "flex h-6 w-6 items-center justify-center rounded-full",
          "bg-clay-50 border border-earth-200 text-earth-500",
          "hover:bg-clay-100 hover:text-earth-700 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-500"
        )}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </motion.aside>
  );
}
