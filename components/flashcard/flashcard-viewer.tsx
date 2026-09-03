"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FlashcardItem } from "@/types";
import { BloomBadge } from "../mcq/bloom-badge";
import {
  Rotate3D,
  HelpCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  BrainCircuit,
  Shuffle,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FlashcardViewerProps {
  cards: FlashcardItem[];
  deckTitle: string;
}

export function FlashcardViewer({ cards: initialCards, deckTitle }: FlashcardViewerProps) {
  const [cards, setCards] = useState<FlashcardItem[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [studiedCount, setStudiedCount] = useState<Record<string, number>>({});
  const [shuffleToast, setShuffleToast] = useState(false);

  useEffect(() => {
    setCards(initialCards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [initialCards]);

  const currentCard = cards && cards.length > 0 ? cards[currentIndex] : null;

  const handleNext = () => {
    if (!cards || cards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    if (!cards || cards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleRate = (confidence: "EASY" | "MEDIUM" | "HARD") => {
    if (!currentCard) return;
    setStudiedCount((prev) => ({
      ...prev,
      [currentCard.id]: (prev[currentCard.id] || 0) + 1,
    }));
    handleNext();
  };

  // Fisher-Yates Algorithm for Random Flashcard Shuffling
  const handleShuffle = () => {
    if (!cards || cards.length === 0) return;
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setShuffleToast(true);
    setTimeout(() => setShuffleToast(false), 2500);
  };

  // Reset to original order
  const handleResetOrder = () => {
    setCards(initialCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  // Keyboard Navigation: Space = Flip, Arrows = Prev/Next, 1/2/3 = Rate, H = Hint
  useEffect(() => {
    if (!cards || cards.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "1") {
        e.preventDefault();
        handleRate("HARD");
      } else if (e.key === "2") {
        e.preventDefault();
        handleRate("MEDIUM");
      } else if (e.key === "3") {
        e.preventDefault();
        handleRate("EASY");
      } else if (e.key.toLowerCase() === "h") {
        e.preventDefault();
        setShowHint((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cards?.length, currentIndex, currentCard]);

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center p-12 bg-card rounded-3xl border border-border">
        <p className="text-muted-foreground">Chưa có thẻ Flashcard nào trong bộ đề này.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto w-full space-y-6">
      {/* Header Bar with Shuffle Button */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {deckTitle}
          </span>
          <div className="text-sm font-bold text-foreground">
            Thẻ {currentIndex + 1} / {cards.length}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {currentCard && <BloomBadge level={currentCard.bloomLevel} size="sm" />}
          {currentCard?.specialty && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
              {currentCard.specialty}
            </span>
          )}

          {/* Shuffle Button */}
          <button
            type="button"
            onClick={handleShuffle}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800 transition-all hover:scale-105 shadow-xs"
            title="Xáo trộn ngẫu nhiên thứ tự các thẻ Flashcard"
          >
            <Shuffle className="h-3.5 w-3.5" />
            <span>Xáo Trộn Thẻ</span>
          </button>
        </div>
      </div>

      {/* Shuffle Notification Toast */}
      {shuffleToast && (
        <div className="px-4 py-2 rounded-2xl bg-purple-600 text-white text-xs font-bold shadow-lg shadow-purple-600/20 flex items-center gap-2 animate-in fade-in zoom-in-95">
          <Shuffle className="h-4 w-4" />
          <span>Đã xáo trộn ngẫu nhiên toàn bộ {cards.length} thẻ Flashcard! 🔀</span>
        </div>
      )}

      {/* 3D Flip Card Container */}
      {currentCard && (
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative w-full h-[360px] sm:h-[400px] cursor-pointer perspective-1000 select-none group"
        >
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative w-full h-full transform-style-3d rounded-3xl shadow-lg border border-border group-hover:border-purple-300 dark:group-hover:border-purple-700 transition-colors"
          >
            {/* FRONT OF CARD */}
            <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-b from-card to-muted/30 rounded-3xl p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/60 pb-3">
                <span className="font-semibold uppercase flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                  <BrainCircuit className="h-4 w-4" />
                  <span>MẶT TRƯỚC (CÂU HỎI / TRIỆU CHỨNG)</span>
                </span>
                <span className="text-[11px] bg-muted px-2 py-0.5 rounded-full">
                  Nhấn vào thẻ để lật
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center text-center px-4 overflow-y-auto">
                <p className="text-lg sm:text-xl font-bold text-foreground leading-relaxed">
                  {currentCard.front}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/60">
                {currentCard.hint ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHint(!showHint);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>{showHint ? `Gợi ý: ${currentCard.hint}` : "Xem gợi ý lâm sàng"}</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Rotate3D className="h-3.5 w-3.5" />
                  <span>Lật mặt sau</span>
                </div>
              </div>
            </div>

            {/* BACK OF CARD */}
            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-b from-purple-50/50 to-card dark:from-purple-950/20 dark:to-card rounded-3xl p-8 flex flex-col justify-between border-2 border-purple-500/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/60 pb-3">
                <span className="font-semibold uppercase flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>MẶT SAU (CƠ CHẾ / LỜI GIẢI ĐÁP)</span>
                </span>
                <span className="text-[11px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  Đáp án chuẩn y khoa
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center text-center px-4 overflow-y-auto">
                <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed whitespace-pre-line">
                  {currentCard.back}
                </p>
              </div>

              <div className="flex items-center justify-center pt-3 border-t border-border/60 text-xs text-muted-foreground">
                <span>Đánh giá mức độ nhớ của bạn bên dưới</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Navigation & Spaced Repetition Buttons */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="p-2.5 rounded-2xl border border-border bg-card hover:bg-muted text-foreground transition-all"
            aria-label="Thẻ trước"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-2.5 rounded-2xl border border-border bg-card hover:bg-muted text-foreground transition-all"
            aria-label="Thẻ sau"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Spaced Repetition Rating Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleRate("HARD")}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900 transition-all"
          >
            Chưa Nhớ (Lặp lại)
          </button>
          <button
            type="button"
            onClick={() => handleRate("MEDIUM")}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-900 transition-all"
          >
            Nhớ Tạm (3 Ngày)
          </button>
          <button
            type="button"
            onClick={() => handleRate("EASY")}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            Đã Thuộc (7 Ngày)
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint Pill Bar */}
      <div className="hidden sm:flex items-center justify-center gap-3 pt-2 text-[11px] text-muted-foreground/80">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/60 text-[10px] font-mono font-bold text-foreground">Space</kbd>
          Lật thẻ
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/60 text-[10px] font-mono font-bold text-foreground">← / →</kbd>
          Trước / Sau
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/60 text-[10px] font-mono font-bold text-foreground">1, 2, 3</kbd>
          Đánh giá nhớ
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/60 text-[10px] font-mono font-bold text-foreground">H</kbd>
          Gợi ý
        </span>
      </div>
    </div>
  );
}
