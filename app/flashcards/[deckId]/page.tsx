"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MOCK_FLASHCARDS } from "@/lib/mock-data";
import { FlashcardItem } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { FlashcardViewer } from "@/components/flashcard/flashcard-viewer";
import { AuthGuard } from "@/components/auth-guard";
import { ArrowLeft, Stethoscope, Sparkles, Layers, FolderTree, PlusCircle, Plus } from "lucide-react";

export default function FlashcardsPage() {
  const params = useParams();
  const { user, getUserDecks } = useAuth();

  const [deckTitle, setDeckTitle] = useState("Bộ Thẻ Flashcard 3D Y Khoa");
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const userDecks = getUserDecks("FLASHCARD");
      const matched = userDecks.find((d) => d.id === params?.deckId);

      if (matched && matched.flashcards && matched.flashcards.length > 0) {
        setDeckTitle(matched.title);
        setCards(matched.flashcards);
      } else if (user?.isDemo || params?.deckId === "deck_pharm_01") {
        setDeckTitle("Flashcard Cơ Chế Thuốc Tim Mạch & Cấp Cứu (Demo)");
        setCards(MOCK_FLASHCARDS);
      } else {
        setCards([]);
      }
    } catch (e) {
      setCards([]);
    } finally {
      setIsLoading(false);
    }
  }, [params?.deckId, user]);

  return (
    <AuthGuard
      featureTitle="Học Thẻ Flashcard 3D Spaced Repetition"
      featureDescription="Vui lòng đăng nhập để lật thẻ 3D, đánh giá mức độ ghi nhớ và lưu lại chuỗi ôn tập lặp lại ngắt quãng."
    >
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* EMPTY FLASHCARD DECK STATE */}
        {!isLoading && cards.length === 0 ? (
          <div className="p-10 sm:p-16 rounded-3xl border-2 border-dashed border-border bg-card/60 text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-purple-50 dark:bg-purple-950 text-purple-600 shadow-inner">
              <Layers className="h-8 w-8" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl sm:text-2xl font-black text-foreground">
                Bộ Thẻ Flashcard Hiện Đang Trống
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Tài khoản của bạn chưa có thẻ flashcard nào trong bộ đề này. Hãy chuyển sang <strong>Cây Thư Mục</strong> để tạo thư mục mới hoặc <strong>Tạo Thẻ Flashcard 3D</strong>!
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/folders"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02]"
              >
                <FolderTree className="h-4 w-4" />
                <span>Chuyển Đến Cây Thư Mục</span>
              </Link>

              <Link
                href="/create"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-border bg-card hover:bg-muted font-bold text-xs sm:text-sm text-foreground transition-all"
              >
                <PlusCircle className="h-4 w-4 text-purple-600" />
                <span>Tạo Thẻ Flashcard Mới</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <Link
                  href="/flashcards"
                  className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                  title="Quay lại danh sách bộ thẻ Flashcard"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 uppercase">
                      Flashcard 3D ({cards.length} thẻ)
                    </span>
                    <span className="text-xs text-muted-foreground">Spaced Repetition</span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                    {deckTitle}
                  </h1>
                </div>
              </div>

              {/* Action: Append More Cards */}
              <Link
                href={`/create?appendDeckId=${params?.deckId}&type=FLASHCARD`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs transition-all shadow-2xs self-start sm:self-center"
                title="Nạp thêm thẻ vào bộ flashcard này"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Nạp Thêm Thẻ</span>
              </Link>
            </div>

            {/* 3D Flashcard Player */}
            <FlashcardViewer cards={cards} deckTitle={deckTitle} />
          </>
        )}
      </div>
    </AuthGuard>
  );
}
