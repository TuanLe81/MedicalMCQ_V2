"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MOCK_FLASHCARDS } from "@/lib/mock-data";
import { FlashcardItem } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { FlashcardViewer } from "@/components/flashcard/flashcard-viewer";
import { AuthGuard } from "@/components/auth-guard";
import { ArrowLeft, Stethoscope, Sparkles, Layers, FolderTree, PlusCircle } from "lucide-react";

export default function FlashcardsPage() {
  const params = useParams();
  const { user } = useAuth();

  const [deckTitle, setDeckTitle] = useState("Bộ Thẻ Flashcard 3D Y Khoa");
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedCustom = localStorage.getItem("medlearn_custom_decks");
      let foundCards: FlashcardItem[] = [];

      if (storedCustom && params?.deckId) {
        const customDecks = JSON.parse(storedCustom);
        const matched = customDecks.find((d: any) => d.id === params.deckId);
        if (matched && matched.flashcards && matched.flashcards.length > 0) {
          setDeckTitle(matched.title);
          foundCards = matched.flashcards;
        }
      }

      // If no custom flashcard deck found and user is in demo mode, fallback to mock cards
      if (foundCards.length === 0 && user?.isDemo) {
        setDeckTitle("Flashcard Cơ Chế Thuốc Tim Mạch & Cấp Cứu (Demo)");
        foundCards = MOCK_FLASHCARDS;
      }

      setCards(foundCards);
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
                      Flashcard 3D ({cards.length} thẻ)
                    </span>
                    <span className="text-xs text-muted-foreground">Spaced Repetition</span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                    {deckTitle}
                  </h1>
                </div>
              </div>
            </div>

            {/* 3D Flashcard Player */}
            <FlashcardViewer cards={cards} deckTitle={deckTitle} />
          </>
        )}
      </div>
    </AuthGuard>
  );
}
