"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { MOCK_USER } from "@/lib/mock-data";
import { BloomRadarChart } from "@/components/dashboard/bloom-radar-chart";
import { StreakCard } from "@/components/dashboard/streak-card";
import { RecentSessions } from "@/components/dashboard/recent-sessions";
import {
  GraduationCap,
  BookOpen,
  FolderTree,
  Bot,
  PlusCircle,
  Award,
  Sparkles,
  TrendingUp,
  BrainCircuit,
  LogIn,
} from "lucide-react";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const currentUser = user || MOCK_USER;

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl border border-border bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 backdrop-blur-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-xs">
              {currentUser.medicalSchool}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              {currentUser.role === "RESIDENT_DOCTOR" ? "Bác Sĩ Nội Trú" : `Sinh viên Y${currentUser.yearOfStudy || 4}`}
            </span>
            {currentUser.username && (
              <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-mono">
                @{currentUser.username}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            Bảng Điều Khiển Học Tập: {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Theo dõi tiến độ ôn luyện, năng lực tư duy Bloom và lịch sử làm bài thi thử của tài khoản
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Biên Soạn / Import</span>
          </Link>
          <Link
            href="/ai-tutor"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs sm:text-sm border border-indigo-200 dark:border-indigo-800 transition-all"
          >
            <Bot className="h-4 w-4 text-indigo-600" />
            <span>Hỏi MediAI</span>
          </Link>
        </div>
      </div>

      {/* Grid: Streak Counter & Summary Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <StreakCard streakCount={currentUser.streakCount} />
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl border border-border bg-card shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Tổng Số Câu Đã Làm</span>
            <div className="text-3xl font-black text-sky-600 dark:text-sky-400 mt-2">
              {currentUser.totalQuestionsAnswered}
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              +24 câu trong tuần này
            </span>
          </div>

          <div className="p-5 rounded-3xl border border-border bg-card shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Tỉ Lệ Trả Lời Đúng</span>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              {currentUser.overallAccuracy}%
            </div>
            <span className="text-[11px] text-muted-foreground mt-1">
              Trung bình toàn hệ thống: 72%
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-5 rounded-3xl border border-border bg-card shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Cấp Độ Bloom Mạnh Nhất</span>
            <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-2">
              1. Nhớ & 2. Hiểu
            </div>
            <span className="text-[11px] text-sky-600 dark:text-sky-400 font-bold mt-1">
              Nền tảng sinh lý học rất vững
            </span>
          </div>
        </div>
      </div>

      {/* Bloom's Taxonomy Cognitive Matrix Chart */}
      <BloomRadarChart user={currentUser} />

      {/* Recent Sessions */}
      <RecentSessions />
    </div>
  );
}
