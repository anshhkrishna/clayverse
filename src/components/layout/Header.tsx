"use client";

import * as React from "react";
import { Zap, Download, Share2, LogOut, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/stores/studioStore";
import { useAppStore } from "@/stores/appStore";
import { ModeSelector } from "./ModeSelector";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/Dropdown";
import type { ModelingMode } from "@/types";

export function Header() {
  const { project, isDirty, canvasView, setMode, toggleSimulationPanel, toggleExportPanel } =
    useStudioStore();
  const { user } = useAppStore();

  const [projectName, setProjectName] = React.useState(
    project?.name ?? "Untitled Project"
  );
  const [editing, setEditing] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (project?.name) setProjectName(project.name);
  }, [project?.name]);

  React.useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleNameBlur = () => {
    setEditing(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Escape") {
      setEditing(false);
    }
  };

  return (
    <header
      className={cn(
        "h-14 flex items-center gap-3 px-4 border-b border-earth-200",
        "glass sticky top-0 z-30"
      )}
    >
      {/* Left: project name */}
      <div className="flex items-center gap-2 min-w-0 flex-shrink-0 w-48">
        {editing ? (
          <input
            ref={inputRef}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            className={cn(
              "text-sm font-medium text-earth-800 bg-white border border-clay-300 rounded-md px-2 py-0.5",
              "focus:outline-none focus:ring-2 focus:ring-clay-500 w-full"
            )}
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-sm font-medium text-earth-800 truncate hover:text-clay-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-500 rounded px-1"
            title="Click to rename"
          >
            {projectName}
          </button>
        )}
        {isDirty && (
          <span
            className="h-2 w-2 rounded-full bg-kiln-500 shrink-0 animate-pulse"
            title="Unsaved changes"
          />
        )}
      </div>

      {/* Center: mode tabs */}
      <div className="flex-1 flex justify-center">
        <ModeSelector
          value={canvasView.mode}
          onModeChange={(mode: ModelingMode) => setMode(mode)}
        />
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Zap className="h-3.5 w-3.5" />}
          onClick={toggleSimulationPanel}
        >
          Simulate
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleExportPanel}
          title="Export"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" title="Share">
          <Share2 className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-500">
              <Avatar
                name={user?.name ?? "User"}
                src={user?.avatarUrl}
                size="sm"
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {user && (
              <>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-earth-800">{user.name}</p>
                    <p className="text-xs text-earth-500">@{user.username}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem icon={<User className="h-4 w-4" />}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem icon={<Settings className="h-4 w-4" />}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              icon={<LogOut className="h-4 w-4" />}
              destructive
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
