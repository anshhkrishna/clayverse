"use client";

import * as React from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export function AppShell({ children, showHeader = true }: AppShellProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [collapsed, setCollapsed] = React.useState(false);

  // Auto-collapse on mobile
  React.useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile]);

  return (
    <div className="flex h-screen overflow-hidden bg-clay-50">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {showHeader && <Header />}
        <main className={cn("flex-1 overflow-auto")}>
          {children}
        </main>
      </div>
    </div>
  );
}
