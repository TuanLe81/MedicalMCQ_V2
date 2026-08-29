"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MOCK_FLASHCARDS } from "@/lib/mock-data";
import { FlashcardViewer } from "@/components/flashcard/flashcard-viewer";
import { AuthGuard } from "@/components/auth-guard";
import { ArrowLeft, Stethoscope, Sparkles } from "lucide-react";

export default function FlashcardsPage() {
  const params = useParams();
  const deckTitle = "Flashcard Cơ Chế Thuốc Tim Mạch & Cấp Cứu";

  return (
    <AuthGuard
      featureTitle="Học Thẻ Flashcard 3D Spaced Repetition"
      featureDescription="Vui lòng đăng nhập để lật thẻ 3D, đánh giá mức độ ghi nhớ và lưu lại chuỗi ôn tập lặp lại ngắt quãng."
    >
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/folders"
              className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 uppercase">
                  Flashcard 3D
                </span>
                <span className="text-xs text-muted-foreground">Dược Lý Lâm Sàng</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                {deckTitle}
              </h1>
            </div>
          </div>
        </div>

        {/* 3D Flashcard Player */}
        <FlashcardViewer cards={MOCK_FLASHCARDS} deckTitle={deckTitle} />
      </div>
    </AuthGuard>
  );
}
