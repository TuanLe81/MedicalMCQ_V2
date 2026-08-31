"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { useAuth } from "@/lib/auth-context";
import { Flame, CheckCircle2, Calendar, Sparkles, Award, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function DailyCheckinCard() {
  const { user, checkInDaily } = useAuth();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSuccessAnim, setIsSuccessAnim] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const isCheckedInToday = user?.lastCheckInDate === todayStr;
  const currentStreak = user?.streakCount || 0;

  const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const currentDayIndex = (new Date().getDay() + 6) % 7; // 0 for Monday ... 6 for Sunday

  const handleCheckIn = () => {
    const res = checkInDaily();
    if (res.success) {
      setIsSuccessAnim(true);
      setFeedbackMessage(res.message || "Điểm danh thành công!");

      // Fire celebratory medical confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#0284c7", "#6366f1", "#f59e0b", "#10b981"],
        });
      } catch (e) {
        // fallback
      }

      setTimeout(() => setFeedbackMessage(null), 5000);
    } else {
      setFeedbackMessage(res.message || "Bạn đã điểm danh hôm nay rồi!");
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  return (
    <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl border border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-br from-amber-500/10 via-card to-amber-500/5 shadow-md space-y-5">
      {/* Top Badge & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs">
          <Calendar className="h-4 w-4" />
          <span>ĐIỂM DANH HỌC Y HẰNG NGÀY</span>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-bold border border-amber-300 dark:border-amber-800">
          +10 điểm BXH / ngày
        </span>
      </div>

      {/* Main Streak Counter Visual */}
      <div className="flex items-center gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30">
          <Flame className={cn("h-9 w-9 fill-white text-white", isCheckedInToday ? "animate-bounce" : "opacity-90")} />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              {currentStreak}
            </span>
            <span className="text-sm font-bold text-muted-foreground">Ngày Liên Tục</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {isCheckedInToday
              ? "✓ Đã giữ chuỗi hôm nay! Quay lại vào ngày mai để tiếp tục."
              : "Bấm nút điểm danh bên dưới để giữ vững chuỗi và thăng hạng!"}
          </p>
        </div>
      </div>

      {/* 7-Day Visual Week Progress */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
          Tiến Độ Tuần Này:
        </span>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {daysOfWeek.map((day, idx) => {
            const isToday = idx === currentDayIndex;
            const isPast = idx < currentDayIndex;
            const isDone = (isToday && isCheckedInToday) || (isPast && currentStreak > (currentDayIndex - idx));

            return (
              <div
                key={day}
                className={cn(
                  "flex flex-col items-center justify-center py-2 rounded-xl border text-xs font-bold transition-all",
                  isDone
                    ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                    : isToday
                    ? "border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                    : "border-border bg-muted/40 text-muted-foreground"
                )}
              >
                <span className="text-[10px] opacity-80">{day}</span>
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5" />
                ) : (
                  <span className="text-[10px] mt-0.5 opacity-60">•</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={handleCheckIn}
          disabled={isCheckedInToday}
          className={cn(
            "w-full py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md",
            isCheckedInToday
              ? "bg-emerald-600/90 text-white cursor-default shadow-emerald-600/20"
              : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25 hover:scale-[1.01]"
          )}
        >
          {isCheckedInToday ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>Đã Điểm Danh Hôm Nay ({currentStreak} Ngày 🔥)</span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 fill-white" />
              <span>Điểm Danh Ngay (+10 Điểm BXH)</span>
            </>
          )}
        </button>

        {feedbackMessage && (
          <p className="text-center text-xs font-bold text-amber-700 dark:text-amber-300 animate-in fade-in">
            {feedbackMessage}
          </p>
        )}
      </div>
    </div>
  );
}

