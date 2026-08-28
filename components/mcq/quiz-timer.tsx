"use client";

import React, { useEffect, useState } from "react";
import { Timer, AlertTriangle } from "lucide-react";
import { formatTime, cn } from "@/lib/utils";

interface QuizTimerProps {
  initialSeconds: number;
  isActive: boolean;
  onTimeUp: () => void;
  className?: string;
}

export function QuizTimer({
  initialSeconds,
  isActive,
  onTimeUp,
  className,
}: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    setTimeLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isActive) return;

    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft, onTimeUp]);

  const percentage = Math.max(0, (timeLeft / initialSeconds) * 100);
  const isCritical = timeLeft < 60 && timeLeft > 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 p-3 rounded-2xl border bg-card/90 shadow-sm backdrop-blur-sm transition-all",
        isCritical
          ? "border-rose-400 bg-rose-50/60 dark:bg-rose-950/40 animate-pulse"
          : "border-border",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCritical ? (
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 animate-bounce" />
          ) : (
            <Timer className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          )}
          <span className="text-xs font-semibold text-muted-foreground">
            Thời Gian Làm Bài
          </span>
        </div>
        <span
          className={cn(
            "font-mono text-base font-bold tracking-tight",
            isCritical
              ? "text-rose-600 dark:text-rose-400"
              : "text-foreground"
          )}
        >
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full transition-all duration-1000 rounded-full",
            isCritical
              ? "bg-rose-500"
              : percentage > 40
              ? "bg-sky-500"
              : "bg-amber-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

