"use client";

import React from "react";
import { Flame, Calendar, Award, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCardProps {
  streakCount: number;
}

export function StreakCard({ streakCount }: StreakCardProps) {
  const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const completedDays = [true, true, true, true, true, true, true]; // Mock current week active

  return (
    <div className="p-6 rounded-3xl border border-border bg-gradient-to-br from-card via-card to-amber-500/5 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-xs">
            <Flame className="h-7 w-7 fill-amber-500 animate-bounce" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">
              {streakCount} Ngày Liên Tiếp
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              Bạn đang có phong độ học tập xuất sắc!
            </span>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold">
          <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
          <span>Top 5% Sinh Viên Y</span>
        </span>
      </div>

      {/* 7 Days Tracker */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
          <span>Tuần Này</span>
          <span className="text-amber-600 dark:text-amber-400 font-bold">7/7 Ngày Hoàn Thành</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {daysOfWeek.map((day, idx) => (
            <div
              key={idx}
              className={cn(
                "flex flex-col items-center justify-center py-2.5 rounded-xl border text-xs font-bold transition-all",
                completedDays[idx]
                  ? "bg-amber-500 text-white border-amber-600 shadow-xs shadow-amber-500/20"
                  : "bg-muted text-muted-foreground border-border"
              )}
            >
              <span>{day}</span>
              <Flame className="h-3.5 w-3.5 fill-white text-white mt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

