"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  online?: boolean;
}

const sizeMap = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
  xl: "h-14 w-14 text-lg",
};

const onlineSizeMap = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2.5 w-2.5",
  xl: "h-3 w-3",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Avatar({
  className,
  src,
  alt,
  name,
  size = "md",
  online,
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const showFallback = !src || imgError;
  const initials = name ? getInitials(name) : "?";

  return (
    <div className={cn("relative inline-flex shrink-0", className)} {...props}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full overflow-hidden",
          "border-2 border-earth-200 bg-earth-100",
          sizeMap[size]
        )}
      >
        {!showFallback && src ? (
          <img
            src={src}
            alt={alt ?? name ?? "Avatar"}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="font-medium text-earth-600 select-none leading-none">
            {initials}
          </span>
        )}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-white",
            onlineSizeMap[size],
            online ? "bg-sage-500" : "bg-earth-400"
          )}
        />
      )}
    </div>
  );
}

export { Avatar };
