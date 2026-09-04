import React, { useEffect, useState } from "react";
import { Timer, AlertTriangle, Infinity as InfinityIcon } from "lucide-react";
import { formatTime, cn } from "@/lib/utils";

interface QuizTimerProps {
  initialSeconds: number;
  isActive: boolean;
  isUnlimited?: boolean;
  onTimeUp: () => void;
  className?: string;
  onTimerTick?: (elapsedSeconds: number) => void;
}

export function QuizTimer({
  initialSeconds,
  isActive,
  isUnlimited = false,
  onTimeUp,
  className,
  onTimerTick,
}: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    setTimeLeft(initialSeconds);
    setElapsedTime(0);
  }, [initialSeconds, isUnlimited]);

  useEffect(() => {
    if (!isActive) return;

    if (isUnlimited) {
      // Unlimited mode: counts UP
      const timer = setInterval(() => {
        setElapsedTime((prev) => {
          const next = prev + 1;
          if (onTimerTick) onTimerTick(next);
          return next;
        });
      }, 1000);
      return () => clearInterval(timer);
    }

    // Countdown mode
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
        const next = prev - 1;
        if (onTimerTick) onTimerTick(initialSeconds - next);
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isUnlimited, timeLeft, onTimeUp, initialSeconds, onTimerTick]);

  const percentage = isUnlimited ? 100 : Math.max(0, (timeLeft / (initialSeconds || 1)) * 100);
  const isCritical = !isUnlimited && timeLeft < 60 && timeLeft > 0;

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
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {isCritical ? (
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 animate-bounce" />
          ) : isUnlimited ? (
            <InfinityIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          ) : (
            <Timer className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          )}
          <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
            {isUnlimited ? "Thời Gian Làm (Tự Do)" : "Thời Gian Còn Lại"}
          </span>
        </div>
        <span
          className={cn(
            "font-mono text-base font-bold tracking-tight",
            isCritical
              ? "text-rose-600 dark:text-rose-400"
              : isUnlimited
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-foreground"
          )}
        >
          {isUnlimited ? formatTime(elapsedTime) : formatTime(timeLeft)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full transition-all duration-1000 rounded-full",
            isCritical
              ? "bg-rose-500"
              : isUnlimited
              ? "bg-gradient-to-r from-indigo-500 to-purple-500"
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
