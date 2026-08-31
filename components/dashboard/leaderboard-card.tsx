"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { LeaderboardEntry } from "@/types";
import {
  Trophy,
  Medal,
  Flame,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Award,
  Crown,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function LeaderboardCard() {
  const { getLeaderboard, user } = useAuth();
  const leaderboard: LeaderboardEntry[] = getLeaderboard();

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  const currentUserRank = leaderboard.find((e) => e.isCurrentUser);

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
            <Trophy className="h-4 w-4" />
            <span>BẢNG XẾP HẠNG Y KHOA TOÀN HỆ THỐNG</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            Bảng Phong Thần Bác Sĩ &amp; Sinh Viên Y
          </h2>
          <p className="text-xs text-muted-foreground">
            Điểm xếp hạng được tính dựa trên:{" "}
            <strong className="text-foreground">(Số Ngày Điểm Danh × 10) + (Số Câu Trả Lời Đúng × 5)</strong>
          </p>
        </div>

        {currentUserRank && (
          <div className="px-4 py-2 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-xs font-bold text-sky-800 dark:text-sky-200 flex items-center gap-2">
            <span>Thứ hạng của bạn:</span>
            <span className="px-2 py-0.5 rounded-lg bg-sky-600 text-white font-mono font-black">
              #{currentUserRank.rank} ({currentUserRank.rankScore} điểm)
            </span>
          </div>
        )}
      </div>

      {/* Podium Showcase for Top 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {/* TOP 2 - BẠC */}
        {top2 && (
          <div className="order-2 sm:order-1 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center space-y-2 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-400 text-white text-xs font-black shadow-sm">
              #2
            </div>
            <div className="h-12 w-12 mx-auto rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-foreground">
              {top2.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-xs text-foreground truncate">{top2.name}</div>
              <div className="text-[10px] text-muted-foreground truncate">{top2.medicalSchool}</div>
            </div>
            <div className="pt-1 flex items-center justify-center gap-2 text-xs">
              <span className="font-black text-slate-700 dark:text-slate-300">
                {top2.rankScore} điểm
              </span>
              <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
                {top2.streakCount}d
              </span>
            </div>
          </div>
        )}

        {/* TOP 1 - VÀNG */}
        {top1 && (
          <div className="order-1 sm:order-2 p-5 rounded-2xl border-2 border-amber-400 dark:border-amber-600 bg-gradient-to-b from-amber-500/10 via-card to-amber-500/5 text-center space-y-2.5 relative shadow-md">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white text-xs font-black shadow-md">
              <Crown className="h-4 w-4 fill-white" />
            </div>
            <div className="h-14 w-14 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black text-base shadow-sm">
              {top1.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-black text-sm text-foreground truncate">{top1.name}</div>
              <div className="text-[11px] text-muted-foreground truncate">{top1.medicalSchool}</div>
            </div>
            <div className="pt-1 flex items-center justify-center gap-2 text-xs">
              <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                {top1.rankScore} điểm
              </span>
              <span className="text-[11px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
                {top1.streakCount} ngày
              </span>
            </div>
          </div>
        )}

        {/* TOP 3 - ĐỒNG */}
        {top3 && (
          <div className="order-3 sm:order-3 p-4 rounded-2xl border border-amber-700/40 bg-amber-900/5 text-center space-y-2 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-white text-xs font-black shadow-sm">
              #3
            </div>
            <div className="h-12 w-12 mx-auto rounded-full bg-amber-800/20 text-amber-900 dark:text-amber-200 flex items-center justify-center font-bold text-sm">
              {top3.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-xs text-foreground truncate">{top3.name}</div>
              <div className="text-[10px] text-muted-foreground truncate">{top3.medicalSchool}</div>
            </div>
            <div className="pt-1 flex items-center justify-center gap-2 text-xs">
              <span className="font-black text-amber-800 dark:text-amber-300">
                {top3.rankScore} điểm
              </span>
              <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
                {top3.streakCount}d
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Full Leaderboard Table */}
      <div className="overflow-x-auto rounded-2xl border border-border/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] font-bold border-b border-border/80">
            <tr>
              <th className="py-3 px-4">Hạng</th>
              <th className="py-3 px-4">Thành viên Y Khoa</th>
              <th className="py-3 px-4 text-center">Chuỗi Streak</th>
              <th className="py-3 px-4 text-center">Số Câu Đúng</th>
              <th className="py-3 px-4 text-center">Độ Chính Xác</th>
              <th className="py-3 px-4 text-right">Tổng Điểm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {leaderboard.map((entry) => (
              <tr
                key={entry.id}
                className={cn(
                  "hover:bg-muted/40 transition-colors",
                  entry.isCurrentUser && "bg-sky-50/70 dark:bg-sky-950/40 font-semibold"
                )}
              >
                {/* Rank Badge */}
                <td className="py-3.5 px-4 font-mono font-bold">
                  {entry.rank === 1 ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-[11px]">🥇</span>
                  ) : entry.rank === 2 ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-400 text-white text-[11px]">🥈</span>
                  ) : entry.rank === 3 ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-white text-[11px]">🥉</span>
                  ) : (
                    <span className="text-muted-foreground">#{entry.rank}</span>
                  )}
                </td>

                {/* Name & School */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="font-bold text-foreground flex items-center gap-1.5">
                        <span>{entry.name}</span>
                        {entry.isCurrentUser && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-600 text-white font-bold">
                            Bạn
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {entry.medicalSchool} • {entry.role}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Streak */}
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                    <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    <span>{entry.streakCount} ngày</span>
                  </span>
                </td>

                {/* Correct Answers */}
                <td className="py-3.5 px-4 text-center font-bold text-foreground">
                  {entry.totalCorrectAnswers} / {entry.totalQuestionsAnswered}
                </td>

                {/* Accuracy */}
                <td className="py-3.5 px-4 text-center">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[11px] font-bold",
                      entry.overallAccuracy >= 85
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {entry.overallAccuracy}%
                  </span>
                </td>

                {/* Total Rank Score */}
                <td className="py-3.5 px-4 text-right">
                  <span className="font-black text-sky-600 dark:text-sky-400 text-sm">
                    {entry.rankScore} pts
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

