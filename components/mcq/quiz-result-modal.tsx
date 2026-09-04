import React, { useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { QuizResult } from "@/types";
import { BLOOM_TAXONOMY_MAP } from "@/constants/bloom";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BarChart3,
  Sparkles,
  ArrowRight,
  FolderTree,
  BrainCircuit,
} from "lucide-react";
import { formatTime, cn } from "@/lib/utils";

interface QuizResultModalProps {
  result: QuizResult;
  onRetake: () => void;
  onReview: () => void;
}

export function QuizResultModal({
  result,
  onRetake,
  onReview,
}: QuizResultModalProps) {
  useEffect(() => {
    if (result.scorePercentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Confetti fallback
      }
    }
  }, [result.scorePercentage]);

  const bloomKeys = Object.keys(result.bloomMatrix);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header with Trophy & Score */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25">
            <Trophy className="h-8 w-8 text-amber-300" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Kết Quả Bài Luyện Tập MCQ
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {result.deckTitle}
          </p>
        </div>

        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-muted/50 border border-border text-center space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
              Điểm Số
            </span>
            <div className="text-2xl font-black text-sky-600 dark:text-sky-400">
              {result.scorePercentage}%
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Số Câu Đúng</span>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {result.correctCount} / {result.totalQuestions}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 uppercase">
              <XCircle className="h-3.5 w-3.5" />
              <span>Số Câu Sai</span>
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {result.incorrectCount} / {result.totalQuestions}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/50 border border-border text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground uppercase">
              <Clock className="h-3.5 w-3.5" />
              <span>Thời Gian</span>
            </div>
            <div className="text-2xl font-black text-foreground font-mono">
              {formatTime(result.timeSpentSeconds)}
            </div>
          </div>
        </div>

        {/* Bloom's Taxonomy Cognitive Breakdown Matrix */}
        <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-sm text-foreground">
                BẢNG MA TRẬN PHÂN TÍCH TƯ DUY BLOOM
              </h3>
            </div>
            <span className="text-xs text-muted-foreground">Tỉ lệ đúng từng mốc</span>
          </div>

          <div className="space-y-3 pt-1">
            {bloomKeys.map((key) => {
              const item = result.bloomMatrix[key];
              const bloomInfo = BLOOM_TAXONOMY_MAP[item.bloomLevel];
              if (!bloomInfo) return null;

              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span className={cn("px-2 py-0.5 rounded-md text-[11px] font-bold", bloomInfo.bgLight, bloomInfo.colorClass)}>
                        {bloomInfo.vietnameseName}
                      </span>
                      <span className="text-muted-foreground font-normal text-[11px] hidden sm:inline">
                        {bloomInfo.shortDesc}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {item.correct}/{item.total} câu
                      </span>
                      <span className={cn("font-bold", bloomInfo.colorClass)}>
                        {item.total > 0 ? `${item.percentage}%` : "Chưa có"}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar per Bloom level */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        bloomInfo.badgeBg
                      )}
                      style={{ width: `${item.total > 0 ? item.percentage : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onRetake}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-background hover:bg-muted font-semibold text-xs sm:text-sm text-foreground transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Làm Lại Đề Này</span>
          </button>

          <button
            type="button"
            onClick={onReview}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all"
          >
            <span>Xem Lại Lời Giải & Câu Sai</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

