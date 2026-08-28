"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Clock, ArrowRight, FileQuestion, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export function RecentSessions() {
  const mockSessions = [
    {
      id: "sess_1",
      title: "Bộ Đề MCQ Suy Tim & Bệnh Mạch Vành",
      type: "MCQ",
      specialty: "Nội Tim Mạch",
      score: "83.3%",
      correct: "5/6 câu",
      time: "8 phút 45 giây",
      date: "Hôm nay, 14:30",
      link: "/quiz/deck_cardio_01",
    },
    {
      id: "sess_2",
      title: "Flashcard Cơ Chế Thuốc Tim Mạch & Cấp Cứu",
      type: "FLASHCARD",
      specialty: "Dược Lý Lâm Sàng",
      score: "100%",
      correct: "4/4 thẻ",
      time: "4 phút 10 giây",
      date: "Hôm qua, 20:15",
      link: "/flashcards/deck_pharm_01",
    },
    {
      id: "sess_3",
      title: "MCQ Viêm Phổi & Kháng Sinh Liệu Pháp",
      type: "MCQ",
      specialty: "Nội Hô Hấp",
      score: "80.0%",
      correct: "12/15 câu",
      time: "18 phút 20 giây",
      date: "25/08/2026",
      link: "/quiz/deck_cardio_01",
    },
  ];

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h3 className="font-bold text-base text-foreground">
          Lịch Sử Làm Bài & Ôn Tập Gần Đây
        </h3>
        <Link
          href="/folders"
          className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
        >
          <span>Xem tất cả</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {mockSessions.map((session) => (
          <div
            key={session.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border/70 bg-background/50 hover:bg-background transition-all"
          >
            <div className="flex items-start sm:items-center gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold",
                  session.type === "MCQ"
                    ? "bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400"
                    : "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400"
                )}
              >
                {session.type === "MCQ" ? (
                  <FileQuestion className="h-4 w-4" />
                ) : (
                  <Layers className="h-4 w-4" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-sm text-foreground">
                    {session.title}
                  </h4>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                    {session.specialty}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {session.date} • {session.time}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/60">
              <div className="text-right">
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 block">
                  {session.score}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {session.correct}
                </span>
              </div>

              <Link
                href={session.link}
                className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all"
              >
                Làm Lại
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

