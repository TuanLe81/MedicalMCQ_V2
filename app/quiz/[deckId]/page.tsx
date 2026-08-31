"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MOCK_MCQ_QUESTIONS } from "@/lib/mock-data";
import { MCQQuestion, QuizResult } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { AuthGuard } from "@/components/auth-guard";
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
  Infinity as InfinityIcon,
  Sliders,
  FolderTree,
  FileQuestion,
  PlusCircle,
  FolderPlus,
  Shuffle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user, recordQuizSubmission } = useAuth();

  const [deckTitle, setDeckTitle] = useState("Bộ Đề Luyện Trắc Nghiệm Y Khoa");
  const [initialQuestions, setInitialQuestions] = useState<MCQQuestion[]>([]);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [isLoadingDeck, setIsLoadingDeck] = useState(true);

  // Configuration States: Custom Time Settings
  const [timerMinutes, setTimerMinutes] = useState<number>(10);
  const [customInputMinutes, setCustomInputMinutes] = useState<string>("10");
  const [isUnlimitedTime, setIsUnlimitedTime] = useState<boolean>(false);
  const [isExamMode, setIsExamMode] = useState<boolean>(false); // false = instant feedback; true = test mode
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);
  const [shuffleToast, setShuffleToast] = useState<string | null>(null);

  // In-Quiz States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<{ [index: number]: number }>({});
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [reviewMode, setReviewMode] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Load deck logic: For demo users, mock data is available; for personal users, only custom created/imported decks or empty
  useEffect(() => {
    try {
      const storedCustom = localStorage.getItem("medlearn_custom_decks");
      let foundQuestions: MCQQuestion[] = [];

      if (storedCustom && params?.deckId) {
        const customDecks = JSON.parse(storedCustom);
        const matched = customDecks.find((d: any) => d.id === params.deckId);
        if (matched && matched.questions && matched.questions.length > 0) {
          setDeckTitle(matched.title);
          foundQuestions = matched.questions;
        }
      }

      // If no custom deck found and user is in demo mode, fallback to mock questions
      if (foundQuestions.length === 0 && user?.isDemo) {
        setDeckTitle("Bộ Đề MCQ Mẫu: Suy Tim & Bệnh Mạch Vành (Demo)");
        foundQuestions = MOCK_MCQ_QUESTIONS;
      }

      setInitialQuestions(foundQuestions);
      setQuestions(foundQuestions);
    } catch (e) {
      setQuestions([]);
    } finally {
      setIsLoadingDeck(false);
    }
  }, [params?.deckId, user]);

  // Handle Option Click
  const handleSelectOption = (optionIndex: number) => {
    if (hasSubmitted && !isExamMode) return;

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  // RANDOM SHUFFLE QUESTIONS & CHOICES ALGORITHM (Fisher-Yates)
  const handleShuffleQuiz = () => {
    if (hasSubmitted || questions.length === 0) return;

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
        correctIndex: newCorrectIndex,
      };
    });

    // 2. Shuffle question order
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
    }

    setQuestions(shuffledQuestions);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setShuffleToast("Đã xáo trộn ngẫu nhiên thứ tự câu hỏi và các đáp án A, B, C, D! 🔀");
    setTimeout(() => setShuffleToast(null), 3000);
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
      timeSpentSeconds: isUnlimitedTime ? elapsedSeconds : timerMinutes * 60,
      bloomMatrix,
      userAnswers,
    };

    // Update real-time score in Leaderboard & AuthContext
    recordQuizSubmission(correct, total, bloomMatrix);

    setQuizResult(result);
    setHasSubmitted(true);
  };

  const handleRetake = () => {
    setUserAnswers({});
    setHasSubmitted(false);
    setQuizResult(null);
    setReviewMode(false);
    setCurrentQuestionIndex(0);
    setElapsedSeconds(0);
  };

  const handleReview = () => {
    setReviewMode(true);
    setQuizResult(null);
  };

  const applyCustomTime = (mins: number) => {
    const validMins = Math.max(1, Math.min(300, mins));
    setTimerMinutes(validMins);
    setCustomInputMinutes(String(validMins));
    setIsUnlimitedTime(false);
    setShowTimeModal(false);
  };

  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <AuthGuard
      featureTitle="Phòng Thi & Luyện Trắc Nghiệm MCQ"
      featureDescription="Vui lòng đăng nhập để tham gia làm bài thi thử, bấm giờ hẹn giờ và lưu lại ma trận đánh giá năng lực Bloom."
    >
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
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
                  href="/folders"
                  className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 uppercase">
                      MCQ Y Khoa ({questions.length} câu)
                    </span>
                    <span className="text-xs text-muted-foreground">Chuẩn Thang Đo Bloom</span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                    {deckTitle}
                  </h1>
                </div>
              </div>

              {/* Action Ribbon: Shuffle & Timer */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
                {/* Shuffle Button */}
                {!hasSubmitted && !reviewMode && (
                  <button
                    type="button"
                    onClick={handleShuffleQuiz}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 text-xs font-bold border border-sky-200 dark:border-sky-800 transition-all hover:scale-105 shadow-xs"
                    title="Xáo trộn ngẫu nhiên cả thứ tự câu hỏi và các đáp án A, B, C, D"
                  >
                    <Shuffle className="h-3.5 w-3.5" />
                    <span>Xáo Trộn Đề</span>
                  </button>
                )}

                {/* Timer Config Display */}
                {!hasSubmitted && (
                  <div className="w-48 sm:w-52">
                    <QuizTimer
                      initialSeconds={timerMinutes * 60}
                      isActive={!hasSubmitted}
                      isUnlimited={isUnlimitedTime}
                      onTimeUp={handleSubmitQuiz}
                      onTimerTick={(s) => setElapsedSeconds(s)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Shuffle Toast Notification */}
            {shuffleToast && (
              <div className="p-3 rounded-2xl bg-sky-600 text-white text-xs font-bold shadow-lg shadow-sky-600/20 flex items-center justify-between gap-2 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-2">
                  <Shuffle className="h-4 w-4 shrink-0" />
                  <span>{shuffleToast}</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Sẵn sàng làm bài</span>
              </div>
            )}

            {/* Mode Switcher & Custom Timer Setting Ribbon */}
            {!hasSubmitted && !reviewMode && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border text-xs">
                {/* Display Mode */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-muted-foreground">Chế độ:</span>
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
                    Hiện Viền Xanh/Đỏ &amp; Giải Thích Ngay
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
                    Thi Thử (Hiện sau khi nộp)
                  </button>
                </div>

                {/* Custom Time Control Section */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-semibold text-muted-foreground">Hẹn giờ:</span>

                  {[5, 15, 30, 45].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => applyCustomTime(mins)}
                      className={cn(
                        "px-2 py-0.5 rounded-md font-bold transition-all",
                        !isUnlimitedTime && timerMinutes === mins
                          ? "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {mins}p
                    </button>
                  ))}

                  {/* Custom Minutes Input Button */}
                  <button
                    type="button"
                    onClick={() => setShowTimeModal(true)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold transition-all border",
                      !isUnlimitedTime && ![5, 15, 30, 45].includes(timerMinutes)
                        ? "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-300"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Sliders className="h-3 w-3" />
                    <span>
                      {!isUnlimitedTime && ![5, 15, 30, 45].includes(timerMinutes)
                        ? `${timerMinutes} phút`
                        : "Tùy chỉnh..."}
                    </span>
                  </button>

                  {/* Unlimited Time Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsUnlimitedTime(!isUnlimitedTime)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold transition-all",
                      isUnlimitedTime
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "border border-border text-muted-foreground hover:bg-muted"
                    )}
                    title="Luyện tập không giới hạn thời gian"
                  >
                    <InfinityIcon className="h-3.5 w-3.5" />
                    <span>Tự do</span>
                  </button>
                </div>
              </div>
            )}

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
                      onClick={() => applyCustomTime(Number(customInputMinutes) || 10)}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs"
                    >
                      Áp Dụng Hẹn Giờ
                    </button>
                  </div>
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
              <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-md overflow-x-auto p-1">
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
