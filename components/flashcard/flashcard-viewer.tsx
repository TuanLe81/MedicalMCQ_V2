"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FlashcardViewerProps {
  cards: FlashcardItem[];
  deckTitle: string;
}

export function FlashcardViewer({ cards, deckTitle }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [studiedCount, setStudiedCount] = useState<Record<string, number>>({});

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center p-12 bg-card rounded-3xl border border-border">
        <p className="text-muted-foreground">Chưa có thẻ Flashcard nào trong bộ đề này.</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleRate = (confidence: "EASY" | "MEDIUM" | "HARD") => {
    setStudiedCount((prev) => ({
      ...prev,
      [currentCard.id]: (prev[currentCard.id] || 0) + 1,
    }));
    handleNext();
  };

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto w-full space-y-6">
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between px-2">
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {deckTitle}
          </span>
          <div className="text-sm font-bold text-foreground">
            Thẻ {currentIndex + 1} / {cards.length}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <BloomBadge level={currentCard.bloomLevel} size="sm" />
          {currentCard.specialty && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-semibold">
              {currentCard.specialty}
            </span>
          )}
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative w-full h-[360px] sm:h-[400px] cursor-pointer perspective-1000 select-none group"
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="relative w-full h-full transform-style-3d rounded-3xl shadow-lg border border-border group-hover:border-sky-300 dark:group-hover:border-sky-700 transition-colors"
        >
          {/* FRONT OF CARD */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-b from-card to-muted/30 rounded-3xl p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/60 pb-3">
              <span className="font-semibold uppercase flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                <BrainCircuit className="h-4 w-4" />
                <span>MẶT TRƯỚC (CÂU HỎI / TRIỆU CHỨNG)</span>
              </span>
              <span className="text-[11px] bg-muted px-2 py-0.5 rounded-full">
                Nhấn vào thẻ để lật
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center text-center px-4">
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
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-b from-sky-50/50 to-card dark:from-sky-950/20 dark:to-card rounded-3xl p-8 flex flex-col justify-between border-2 border-sky-500/50">
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
    </div>
  );
}

