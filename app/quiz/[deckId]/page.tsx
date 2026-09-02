"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MOCK_MCQ_QUESTIONS } from "@/lib/mock-data";
import { MCQQuestion, QuizResult } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { AuthGuard } from "@/components/auth-guard";
import { QuestionCard } from "@/components/mcq/question-card";
import { QuizResultModal } from "@/components/mcq/quiz-result-modal";
import { calculateBloomMatrix, formatTime } from "@/lib/utils";
import {
  ArrowLeft,
  Send,
  RotateCcw,
  Sparkles,
  Clock,
  Infinity as InfinityIcon,
  Sliders,
  FolderTree,
  FileQuestion,
  Shuffle,
  Pause,
  Play,
  CheckCircle2,
  AlertCircle,
  ListOrdered,
  ChevronUp,
  Layers,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user, recordQuizSubmission, getUserDecks } = useAuth();

  const [deckTitle, setDeckTitle] = useState("Bộ Đề Luyện Trắc Nghiệm Y Khoa");
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [isLoadingDeck, setIsLoadingDeck] = useState(true);

  // Configuration States: Custom Time Settings
  const [timerMinutes, setTimerMinutes] = useState<number>(15);
  const [customInputMinutes, setCustomInputMinutes] = useState<string>("15");
  const [isUnlimitedTime, setIsUnlimitedTime] = useState<boolean>(false);
  const [isExamMode, setIsExamMode] = useState<boolean>(false); // false = instant feedback; true = test mode
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);
  const [shuffleToast, setShuffleToast] = useState<string | null>(null);

  // In-Quiz States
  const [userAnswers, setUserAnswers] = useState<{ [index: number]: number }>({});
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [reviewMode, setReviewMode] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Pause States
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState<boolean>(false);

  // Load user-scoped deck logic
  useEffect(() => {
    try {
      const userDecks = getUserDecks("MCQ");
      const matched = userDecks.find((d) => d.id === params?.deckId);

      if (matched && matched.questions && matched.questions.length > 0) {
        setDeckTitle(matched.title);
        setQuestions(matched.questions);
      } else if (user?.isDemo || params?.deckId === "deck_cardio_01") {
        setDeckTitle("Bộ Đề MCQ Mẫu: Suy Tim & Bệnh Mạch Vành (Demo)");
        setQuestions(MOCK_MCQ_QUESTIONS);
      } else {
        setQuestions([]);
      }
    } catch (e) {
      setQuestions([]);
    } finally {
      setIsLoadingDeck(false);
    }
  }, [params?.deckId, user]);

  // Timer Tick Effect (Freezes when isPaused is true)
  useEffect(() => {
    if (hasSubmitted || isPaused || isLoadingDeck || questions.length === 0) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);

      if (!isUnlimitedTime) {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hasSubmitted, isPaused, isUnlimitedTime, isLoadingDeck, questions.length]);

  // Handle Option Click
  const handleSelectOption = (questionIdx: number, optionIndex: number) => {
    if (isPaused || (hasSubmitted && !isExamMode)) return;

    setUserAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIndex,
    }));
  };

  // RANDOM SHUFFLE QUESTIONS & CHOICES ALGORITHM (Fisher-Yates)
  const handleShuffleQuiz = () => {
    if (hasSubmitted || isPaused || questions.length === 0) return;

    // 1. Shuffle option choices in each question and accurately re-map the correctIndex
    const shuffledQuestions = questions.map((q) => {
      const originalCorrectText = q.options[q.correctIndex];
      const newOptions = [...q.options];

      for (let i = newOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newOptions[i], newOptions[j]] = [newOptions[j], newOptions[i]];
      }

      const newCorrectIndex = newOptions.indexOf(originalCorrectText);
      return {
        ...q,
        options: newOptions,
        correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
      };
    });

    // 2. Shuffle question order
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
    }

    setQuestions(shuffledQuestions);
    setUserAnswers({});
    setShuffleToast("Đã xáo trộn ngẫu nhiên toàn bộ danh sách câu hỏi & đáp án! 🔀");
    setTimeout(() => setShuffleToast(null), 3000);
  };

  // Toggle Pause State
  const handleTogglePause = () => {
    if (hasSubmitted) return;

    if (!isPaused) {
      // Save current answers to localStorage on pause
      try {
        localStorage.setItem(`quiz_temp_answers_${params?.deckId}`, JSON.stringify(userAnswers));
      } catch (e) {}
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
  };

  // Smooth Scroll to Question
  const scrollToQuestion = (idx: number) => {
    const el = document.getElementById(`question-card-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobilePaletteOpen(false);
  };

  // Submit and Calculate Score + Bloom Matrix + Record to Leaderboard
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
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const bloomMatrix = calculateBloomMatrix(questions, userAnswers);

    const result: QuizResult = {
      deckId: (params?.deckId as string) || "deck_custom",
      deckTitle,
      totalQuestions: total,
      correctCount: correct,
      incorrectCount: incorrect,
      scorePercentage: percentage,
      timeSpentSeconds: isUnlimitedTime ? elapsedSeconds : timerMinutes * 60 - secondsRemaining,
      bloomMatrix,
      userAnswers,
    };

    // Update real-time score in Leaderboard & AuthContext
    recordQuizSubmission(correct, total, bloomMatrix);

    setQuizResult(result);
    setHasSubmitted(true);
    setIsPaused(false);
  };

  const handleRetake = () => {
    setUserAnswers({});
    setHasSubmitted(false);
    setQuizResult(null);
    setReviewMode(false);
    setElapsedSeconds(0);
    setSecondsRemaining(timerMinutes * 60);
    setIsPaused(false);
  };

  const handleReview = () => {
    setReviewMode(true);
    setQuizResult(null);
  };

  const applyCustomTime = (mins: number) => {
    const validMins = Math.max(1, Math.min(300, mins));
    setTimerMinutes(validMins);
    setSecondsRemaining(validMins * 60);
    setCustomInputMinutes(String(validMins));
    setIsUnlimitedTime(false);
    setShowTimeModal(false);
  };

  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <AuthGuard
      featureTitle="Phòng Thi & Luyện Trắc Nghiệm MCQ"
      featureDescription="Vui lòng đăng nhập để tham gia làm bài thi thử, bấm giờ hẹn giờ và lưu lại ma trận đánh giá năng lực Bloom."
    >
      <div className="container mx-auto max-w-7xl px-3 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* EMPTY DECK STATE - REDIRECT TO FOLDER TREE */}
        {!isLoadingDeck && questions.length === 0 ? (
          <div className="p-10 sm:p-16 rounded-3xl border-2 border-dashed border-border bg-card/60 text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 dark:bg-sky-950 text-sky-600 shadow-inner">
              <FileQuestion className="h-8 w-8" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl sm:text-2xl font-black text-foreground">
                Bộ Đề Hiện Đang Trống
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Tài khoản của bạn chưa có câu hỏi nào trong bộ đề này. Hãy chuyển sang <strong>Cây Thư Mục</strong> để tạo thư mục học tập mới hoặc dùng <strong>AI Tự Động Sinh Đề</strong>!
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/folders"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all hover:scale-[1.02]"
              >
                <FolderTree className="h-4 w-4" />
                <span>Chuyển Đến Cây Thư Mục</span>
              </Link>

              <Link
                href="/create"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-border bg-card hover:bg-muted font-bold text-xs sm:text-sm text-foreground transition-all"
              >
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>Dùng AI Tự Động Tạo Đề</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Top Navigation & Breadcrumbs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <Link
                  href="/quiz"
                  className="p-2.5 rounded-2xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                  title="Quay lại danh sách bộ đề MCQ"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 uppercase">
                      Luyện Tập Cuộn ({questions.length} câu)
                    </span>
                    <span className="text-xs text-muted-foreground">Chuẩn Thang Đo Bloom</span>
                  </div>
                  <h1 className="text-lg sm:text-2xl font-black text-foreground leading-tight">
                    {deckTitle}
                  </h1>
                </div>
              </div>

              {/* Mode Switcher */}
              {!hasSubmitted && !reviewMode && (
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border text-xs">
                  <button
                    type="button"
                    onClick={() => setIsExamMode(false)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg font-bold transition-all",
                      !isExamMode
                        ? "bg-sky-600 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Giải Thích Tức Thì
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExamMode(true)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg font-bold transition-all",
                      isExamMode
                        ? "bg-sky-600 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Chế Độ Thi Thử
                  </button>
                </div>
              )}
            </div>

            {/* PAUSE BANNER */}
            {isPaused && (
              <div className="p-4 rounded-3xl bg-amber-500/10 border-2 border-amber-500 text-amber-900 dark:text-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white font-bold shadow-md">
                    <Pause className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Bài Thi Đang Ở Trạng Thái Tạm Dừng</h4>
                    <p className="text-xs text-muted-foreground">
                      Thời gian đã đóng băng. Các câu hỏi đã chọn ({answeredCount}/{questions.length}) được lưu an toàn. Thao tác chọn đáp án đang bị khóa.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTogglePause}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>Tiếp Tục Làm Bài</span>
                </button>
              </div>
            )}

            {/* Shuffle Toast Notification */}
            {shuffleToast && (
              <div className="p-3.5 rounded-2xl bg-sky-600 text-white text-xs font-bold shadow-lg shadow-sky-600/20 flex items-center justify-between gap-2 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-2">
                  <Shuffle className="h-4 w-4 shrink-0" />
                  <span>{shuffleToast}</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Sẵn sàng làm bài</span>
              </div>
            )}

            {/* MAIN TWO-COLUMN LAYOUT: QUESTIONS LIST (LEFT) + STICKY PALETTE (RIGHT) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: SCROLLABLE FULL QUESTIONS LIST (col-span-8) */}
              <div className="lg:col-span-8 space-y-6">
                {questions.map((q, idx) => (
                  <QuestionCard
                    key={q.id || idx}
                    question={q}
                    questionIndex={idx}
                    totalQuestions={questions.length}
                    selectedOption={userAnswers[idx] ?? null}
                    onSelectOption={(optIdx) => handleSelectOption(idx, optIdx)}
                    isExamMode={isExamMode}
                    hasSubmitted={hasSubmitted || reviewMode}
                    isPaused={isPaused}
                    onAskAI={(quest) => {
                      router.push(`/ai-tutor?questionId=${quest.id}`);
                    }}
                  />
                ))}

                {/* Bottom Finish Prompt */}
                <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card/60 text-center space-y-4">
                  <h3 className="font-bold text-base text-foreground">
                    Bạn đã xem hết {questions.length} câu hỏi trong bộ đề
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Kiểm tra lại thanh Palette bên phải để đảm bảo không bỏ sót câu hỏi trước khi nộp bài.
                  </p>
                  {!hasSubmitted && !reviewMode && (
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 transition-all hover:scale-105"
                    >
                      <Send className="h-4 w-4" />
                      <span>Nộp Bài Thi ({answeredCount}/{questions.length})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: STICKY MCQ ACTION PALETTE (col-span-4) - DESKTOP */}
              <div className="hidden lg:block lg:col-span-4 sticky top-20 space-y-4">
                <div className="p-6 rounded-3xl border border-border bg-card shadow-lg space-y-5">
                  {/* Timer & Controls Header */}
                  <div className="space-y-3 border-b border-border/60 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-sky-600" />
                        <span>Thời Gian Làm Bài</span>
                      </span>
                      {!hasSubmitted && !isPaused && (
                        <button
                          type="button"
                          onClick={() => setShowTimeModal(true)}
                          className="text-[11px] font-bold text-sky-600 hover:underline flex items-center gap-1"
                        >
                          <Sliders className="h-3 w-3" />
                          <span>Hẹn giờ</span>
                        </button>
                      )}
                    </div>

                    {/* Big Digital Clock */}
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/40 dark:to-indigo-950/40 border border-sky-200 dark:border-sky-900">
                      <div className="space-y-0.5">
                        <div className="text-2xl font-mono font-black text-sky-700 dark:text-sky-300">
                          {isUnlimitedTime
                            ? formatTime(elapsedSeconds)
                            : formatTime(secondsRemaining)}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {isUnlimitedTime ? "Thời gian tự do" : "Thời gian còn lại"}
                        </span>
                      </div>

                      {/* Action Buttons inside Timer */}
                      {!hasSubmitted && !reviewMode && (
                        <div className="flex items-center gap-1.5">
                          {/* Pause Button */}
                          <button
                            type="button"
                            onClick={handleTogglePause}
                            className={cn(
                              "flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs",
                              isPaused
                                ? "bg-amber-600 text-white"
                                : "bg-card border border-border hover:bg-muted text-foreground"
                            )}
                            title={isPaused ? "Tiếp tục làm bài" : "Tạm dừng bài thi"}
                          >
                            {isPaused ? <Play className="h-3.5 w-3.5 fill-white" /> : <Pause className="h-3.5 w-3.5" />}
                            <span>{isPaused ? "Tiếp Tục" : "Tạm Dừng"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-foreground">Tiến độ làm bài:</span>
                      <span className="text-sky-600 dark:text-sky-400">
                        {answeredCount} / {questions.length} câu ({progressPercent}%)
                      </span>
                    </div>

                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Question Navigation Palette */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-muted-foreground uppercase tracking-wider text-[11px]">
                        Bảng Câu Hỏi (Palette)
                      </span>
                      <span className="text-[10px] text-muted-foreground">Nhấp để cuộn nhanh</span>
                    </div>

                    <div className="grid grid-cols-5 gap-2 max-h-56 overflow-y-auto p-1">
                      {questions.map((q, idx) => {
                        const isAnswered = userAnswers[idx] !== undefined;
                        const isCorrect = userAnswers[idx] === q.correctIndex;

                        let style = "bg-muted/70 text-muted-foreground border-border hover:bg-muted";

                        if ((hasSubmitted || reviewMode || !isExamMode) && isAnswered) {
                          style = isCorrect
                            ? "bg-emerald-600 text-white border-emerald-700 shadow-xs font-bold"
                            : "bg-rose-600 text-white border-rose-700 shadow-xs font-bold";
                        } else if (isAnswered) {
                          style = "bg-sky-600 text-white border-sky-700 shadow-xs font-bold";
                        }

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => scrollToQuestion(idx)}
                            className={cn(
                              "flex flex-col items-center justify-center py-2.5 rounded-xl border text-xs font-bold transition-all hover:scale-105",
                              style
                            )}
                            title={`Cuộn đến Câu ${idx + 1}`}
                          >
                            <span>{idx + 1}</span>
                            <span className="text-[9px] opacity-80">
                              {isAnswered ? "✓" : "•"}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Palette Legend */}
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 px-1">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-sky-600" />
                        <span>Đã làm</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-muted border border-border" />
                        <span>Chưa làm</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Actions: Shuffle & Submit */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    {!hasSubmitted && !reviewMode ? (
                      <>
                        <button
                          type="button"
                          disabled={isPaused}
                          onClick={handleShuffleQuiz}
                          className="w-full py-2.5 rounded-2xl border border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/30 hover:bg-sky-100 text-sky-700 dark:text-sky-300 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                          <Shuffle className="h-4 w-4" />
                          <span>Xáo Trộn Câu Hỏi &amp; Đáp Án</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSubmitQuiz}
                          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                        >
                          <Send className="h-4 w-4" />
                          <span>Nộp Bài ({answeredCount}/{questions.length})</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRetake}
                        className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Làm Lại Bộ Đề Này</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* FLOATING ACTION BAR FOR MOBILE / TABLET (Tối ưu thiết bị di động) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-background/95 backdrop-blur-md border-t border-border shadow-2xl">
              <div className="container mx-auto flex items-center justify-between gap-2">
                {/* Timer Display */}
                <div className="flex items-center gap-2 font-mono font-bold text-xs sm:text-sm text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-3 py-2 rounded-xl border border-sky-200 dark:border-sky-800">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {isUnlimitedTime ? formatTime(elapsedSeconds) : formatTime(secondsRemaining)}
                  </span>
                </div>

                {/* Quick Toggle Palette Drawer */}
                <button
                  type="button"
                  onClick={() => setMobilePaletteOpen(!mobilePaletteOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card font-bold text-xs text-foreground"
                >
                  <ListOrdered className="h-4 w-4 text-sky-600" />
                  <span>Palette ({answeredCount}/{questions.length})</span>
                  <ChevronUp className={cn("h-3.5 w-3.5 transition-transform", mobilePaletteOpen && "rotate-180")} />
                </button>

                {/* Pause Button */}
                {!hasSubmitted && !reviewMode && (
                  <button
                    type="button"
                    onClick={handleTogglePause}
                    className={cn(
                      "p-2 rounded-xl border font-bold text-xs transition-all",
                      isPaused ? "bg-amber-600 text-white" : "bg-card border-border text-foreground"
                    )}
                  >
                    {isPaused ? <Play className="h-4 w-4 fill-white" /> : <Pause className="h-4 w-4" />}
                  </button>
                )}

                {/* Submit button */}
                {!hasSubmitted && !reviewMode ? (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Nộp Bài</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Làm Lại</span>
                  </button>
                )}
              </div>

              {/* Expandable Mobile Palette Drawer */}
              {mobilePaletteOpen && (
                <div className="pt-3 mt-3 border-t border-border/80 space-y-3 animate-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Chọn câu để cuộn nhanh:</span>
                    <button
                      type="button"
                      disabled={isPaused}
                      onClick={handleShuffleQuiz}
                      className="text-sky-600 dark:text-sky-400 font-bold flex items-center gap-1"
                    >
                      <Shuffle className="h-3 w-3" />
                      <span>Xáo câu</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-6 gap-1.5 max-h-40 overflow-y-auto">
                    {questions.map((q, idx) => {
                      const isAnswered = userAnswers[idx] !== undefined;
                      const isCorrect = userAnswers[idx] === q.correctIndex;

                      let style = "bg-muted text-muted-foreground";

                      if ((hasSubmitted || reviewMode || !isExamMode) && isAnswered) {
                        style = isCorrect ? "bg-emerald-600 text-white" : "bg-rose-600 text-white";
                      } else if (isAnswered) {
                        style = "bg-sky-600 text-white font-bold";
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => scrollToQuestion(idx)}
                          className={cn(
                            "py-2 rounded-lg border border-border/80 text-xs font-bold flex items-center justify-center",
                            style
                          )}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Time Modal */}
            {showTimeModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
                  <div className="flex items-center gap-2 text-foreground font-bold text-base">
                    <Clock className="h-5 w-5 text-sky-600" />
                    <span>Cài Đặt Thời Gian Tự Do</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nhập số phút bạn muốn làm bài kiểm tra (Từ 1 đến 180 phút):
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={300}
                      value={customInputMinutes}
                      onChange={(e) => setCustomInputMinutes(e.target.value)}
                      placeholder="Số phút (VD: 20, 60, 90...)"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none"
                    />
                    <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
                      Phút
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {[10, 20, 45, 60, 90, 120].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCustomInputMinutes(String(m))}
                        className="py-1.5 rounded-lg border border-border/80 bg-muted/40 hover:bg-muted text-xs font-bold"
                      >
                        {m}p
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                    <button
                      type="button"
                      onClick={() => setShowTimeModal(false)}
                      className="px-3.5 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                    >
                      Đóng
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCustomTime(Number(customInputMinutes) || 15)}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs"
                    >
                      Áp Dụng Hẹn Giờ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quiz Result Modal */}
            {quizResult && (
              <QuizResultModal
                result={quizResult}
                onRetake={handleRetake}
                onReview={handleReview}
              />
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
}
