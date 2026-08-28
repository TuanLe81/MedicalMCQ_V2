import React from "react";
import { BloomLevel } from "@/types";
import { BLOOM_TAXONOMY_MAP } from "@/constants/bloom";
import { cn } from "@/lib/utils";
import { BrainCircuit } from "lucide-react";

interface BloomBadgeProps {
  level: BloomLevel;
  showDesc?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function BloomBadge({ level, showDesc = false, className, size = "md" }: BloomBadgeProps) {
  const info = BLOOM_TAXONOMY_MAP[level] || BLOOM_TAXONOMY_MAP.REMEMBERING;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold border transition-all shadow-xs",
        info.bgLight,
        info.borderColor,
        info.colorClass,
        sizeClasses[size],
        className
      )}
      title={`${info.vietnameseName}: ${info.shortDesc}`}
    >
      <BrainCircuit className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      <span>{info.vietnameseName}</span>
      {showDesc && (
        <span className="hidden sm:inline text-muted-foreground font-normal text-[11px] border-l pl-1.5 border-border/80">
          {info.shortDesc}
        </span>
      )}
    </div>
  );
}

