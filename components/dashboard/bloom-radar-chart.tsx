"use client";

import React from "react";
import { UserProfile, BloomLevel } from "@/types";
import { BLOOM_TAXONOMY_MAP } from "@/constants/bloom";
import { BrainCircuit, Award, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface BloomRadarChartProps {
  user: UserProfile;
}

export function BloomRadarChart({ user }: BloomRadarChartProps) {
  const bloomLevels: BloomLevel[] = [
    "REMEMBERING",
    "UNDERSTANDING",
    "APPLYING",
    "ANALYZING",
    "EVALUATING",
    "CREATING",
  ];

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-foreground font-extrabold text-base sm:text-lg">
            <BrainCircuit className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>NĂNG LỰC TƯ DUY Y KHOA (BLOOM'S TAXONOMY)</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Thống kê tỉ lệ trả lời đúng theo 6 cấp độ tư duy từ Nhớ cơ bản đến Phân tích ca lâm sàng & Sáng tạo
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Độ chuẩn xác chung: {user.overallAccuracy}%
          </span>
        </div>
      </div>

      {/* Bloom Bars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bloomLevels.map((lvl) => {
          const stats = user.bloomTaxonomyStats[lvl];
          const info = BLOOM_TAXONOMY_MAP[lvl];
          if (!stats || !info) return null;

          return (
            <div
              key={lvl}
              className="p-4 rounded-2xl border border-border/80 bg-background/60 hover:bg-background transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-lg text-xs font-bold",
                      info.bgLight,
                      info.colorClass
                    )}
                  >
                    {info.vietnameseName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">
                    {stats.correct}/{stats.total} câu
                  </span>
                  <span className={cn("font-extrabold", info.colorClass)}>
                    {stats.percentage}%
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground line-clamp-1">
                {info.shortDesc}
              </p>

              {/* Progress bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    info.badgeBg
                  )}
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Clinical Diagnostic Insight */}
      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-3">
        <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <span className="font-bold text-indigo-900 dark:text-indigo-200">
            Nhận xét AI Tutor về lộ trình học tập:
          </span>
          <p className="text-foreground/80 leading-relaxed">
            Bạn có nền tảng rất vững ở cấp độ <strong>1. Nhớ (89%)</strong> và <strong>2. Hiểu (87%)</strong>. Hãy tiếp tục giải nhiều ca lâm sàng phức tạp ở cấp độ <strong>4. Phân tích (80%)</strong> và <strong>5. Đánh giá</strong> để sẵn sàng cho kỳ thi Bác sĩ Nội trú và vòng thi OSCE/OSPE!
          </p>
        </div>
      </div>
    </div>
  );
}

