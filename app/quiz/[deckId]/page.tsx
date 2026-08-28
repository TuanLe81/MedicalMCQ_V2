"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MOCK_MCQ_QUESTIONS } from "@/lib/mock-data";
import { MCQQuestion, QuizResult } from "@/types";
import { QuestionCard } from "@/components/mcq/question-card";
import { QuizTimer } from "@/components/mcq/quiz-timer";
import { QuizResultModal } from "@/components/mcq/quiz-result-modal";
import { calculateBloomMatrix } from "@/lib/utils";
import {
  BrainCircuit,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  Sparkles,
  Settings2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();

  const deckTitle = "Bộ Đề MCQ Suy Tim & Bệnh Mạch Vành (Chuẩn Bloom)";
  const questions: MCQQuestion[] = MOCK_MCQ_QUESTIONS;

  // Configuration States
  const [timerMinutes, setTimerMinutes] = useState<number>(10);
  const [isExamStarted, setIsExamStarted] = useState<boolean>(true);
  const [isExamMode, setIsExamMode] = useState<boolean>(false); // false = immediate feedback; true = test mode

  // In-Quiz States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<{ [index: number]: number }>({});
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [reviewMode, setReviewMode] = useState<boolean>(false);

  // Handle Option Click
  const handleSelectOption = (optionIndex: number) => {
    if (hasSubmitted && !isExamMode) return; // Locked in study mode after selection

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  // Submit and Calculate Score + Bloom Matrix
  const handleSubmitQuiz = () => {
    if (hasSubmitted) return;

    let correct = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correct += 1;
      }
    });

    const total = questions.length;
    const incorrect = total - correct;
    const percentage = Math.round((correct / total) * 100);
    const bloomMatrix = calculateBloomMatrix(questions, userAnswers);

    const result: QuizResult = {
      deckId: (params?.deckId as string) || "deck_cardio_01",
      deckTitle,
      totalQuestions: total,
      correctCount: correct,
      incorrectCount: incorrect,
      scorePercentage: percentage,
      timeSpentSeconds: timerMinutes * 60,
      bloomMatrix,
      userAnswers,
    };

    setQuizResult(result);
    setHasSubmitted(true);
  };

  const handleRetake = () => {
    setUserAnswers({});
    setHasSubmitted(false);
    setQuizResult(null);
    setReviewMode(false);
    setCurrentQuestionIndex(0);
  };

  const handleReview = () => {
    setReviewMode(true);
    setQuizResult(null);
  };

  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/folders"
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 uppercase">
                MCQ Y Khoa
              </span>
              <span className="text-xs text-muted-foreground">Nội Tim Mạch</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
              {deckTitle}
            </h1>
          </div>
        </div>

        {/* Timer Config & Controls */}
        <div className="flex items-center gap-3">
          {!hasSubmitted && (
            <div className="w-44">
              <QuizTimer
                initialSeconds={timerMinutes * 60}
                isActive={!hasSubmitted}
                onTimeUp={handleSubmitQuiz}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mode Switcher & Timer Setting Ribbon */}
      {!hasSubmitted && !reviewMode && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground">Chế độ hiển thị:</span>
            <button
              type="button"
              onClick={() => setIsExamMode(false)}
              className={cn(
                "px-2.5 py-1 rounded-lg font-bold transition-all",
                !isExamMode
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-background text-muted-foreground border border-border"
              )}
            >
              Hiện giải thích & Viền Xanh/Đỏ ngay
            </button>
            <button
              type="button"
              onClick={() => setIsExamMode(true)}
              className={cn(
                "px-2.5 py-1 rounded-lg font-bold transition-all",
                isExamMode
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-background text-muted-foreground border border-border"
              )}
            >
              Chế độ Thi (Hiện sau khi nộp)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-semibold text-muted-foreground">Hẹn giờ:</span>
            {[5, 10, 15, 30].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setTimerMinutes(mins)}
                className={cn(
                  "px-2 py-0.5 rounded-md font-bold transition-all",
                  timerMinutes === mins
                    ? "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {mins}p
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Question Component */}
      {currentQ && (
        <QuestionCard
          question={currentQ}
          questionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          selectedOption={userAnswers[currentQuestionIndex] ?? null}
          onSelectOption={handleSelectOption}
          isExamMode={isExamMode}
          hasSubmitted={hasSubmitted || reviewMode}
          onAskAI={(q) => {
            router.push(`/ai-tutor?questionId=${q.id}`);
          }}
        />
      )}

      {/* Bottom Navigation & Question Palette */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card shadow-xs">
        {/* Previous / Next buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted disabled:opacity-40 text-xs font-semibold text-foreground transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Câu trước</span>
          </button>

          <button
            type="button"
            disabled={currentQuestionIndex === questions.length - 1}
            onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted disabled:opacity-40 text-xs font-semibold text-foreground transition-all"
          >
            <span>Câu tiếp</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Question Numbers Quick Palette */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {questions.map((q, idx) => {
            const isAnswered = userAnswers[idx] !== undefined;
            const isCurrent = idx === currentQuestionIndex;
            const isCorrect = userAnswers[idx] === q.correctIndex;

            let badgeStyle = "bg-muted text-muted-foreground border-border";

            if ((hasSubmitted || reviewMode || !isExamMode) && isAnswered) {
              badgeStyle = isCorrect
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-400 font-bold"
                : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-400 font-bold";
            } else if (isAnswered) {
              badgeStyle = "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-400 font-bold";
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentQuestionIndex(idx)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold border transition-all",
                  badgeStyle,
                  isCurrent && "ring-2 ring-sky-500 ring-offset-2 scale-110 shadow-xs"
                )}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Submit Quiz Action Button */}
        <div className="w-full sm:w-auto">
          {!hasSubmitted && !reviewMode ? (
            <button
              type="button"
              onClick={handleSubmitQuiz}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all"
            >
              <Send className="h-4 w-4" />
              <span>Nộp Bài ({answeredCount}/{questions.length})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRetake}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Làm Lại Từ Đầu</span>
            </button>
          )}
        </div>
      </div>

      {/* Quiz Result Modal (Triggered on submit or time up) */}
      {quizResult && (
        <QuizResultModal
          result={quizResult}
          onRetake={handleRetake}
          onReview={handleReview}
        />
      )}
    </div>
  );
}

