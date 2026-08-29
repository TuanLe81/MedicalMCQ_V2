"use client";

import React from "react";
import { MCQQuestion } from "@/types";
import { BloomBadge } from "./bloom-badge";
import { CheckCircle2, XCircle, FileText, Sparkles, AlertCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: MCQQuestion;
  questionIndex: number;
  totalQuestions: number;
  selectedOption: number | null;
  onSelectOption: (optionIndex: number) => void;
  isExamMode?: boolean; // If true, immediate feedback is revealed only on submit; if false (study mode), revealed immediately
  hasSubmitted?: boolean;
  onAskAI?: (question: MCQQuestion) => void;
}

export function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  selectedOption,
  onSelectOption,
  isExamMode = false,
  hasSubmitted = false,
  onAskAI,
}: QuestionCardProps) {
  const showFeedback = !isExamMode ? selectedOption !== null : hasSubmitted;
  const isAnswered = selectedOption !== null;

  const optionLabels = ["A", "B", "C", "D", "E"];

  return (
    <div className="flex flex-col gap-5 p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-sm transition-all">
      {/* Header: Question Number + Bloom Level + Difficulty */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-xs">
            #{questionIndex + 1}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            Câu hỏi {questionIndex + 1} / {totalQuestions}
          </span>
        </div>

        {/* Bloom Taxonomy Tag */}
        <div className="flex items-center gap-2">
          <BloomBadge level={question.bloomLevel} showDesc size="sm" />
          <span
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full border",
              question.difficulty === "HARD"
                ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800"
                : question.difficulty === "MEDIUM"
                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
            )}
          >
            {question.difficulty === "HARD"
              ? "Khó"
              : question.difficulty === "MEDIUM"
              ? "Trung Bình"
              : "Cơ Bản"}
          </span>
        </div>
      </div>

      {/* Clinical Vignette / Bệnh sử ca bệnh (if exists) */}
      {question.clinicalVignette && (
        <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 space-y-1.5">
          <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-bold text-xs">
            <FileText className="h-4 w-4" />
            <span>TÌNH HUỐNG LÂM SÀNG (CLINICAL VIGNETTE)</span>
          </div>
          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal italic">
            &ldquo;{question.clinicalVignette}&rdquo;
          </p>
        </div>
      )}

      {/* Main Question Text */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
          {question.questionText}
        </h3>
      </div>

      {/* Options List */}
      <div className="grid grid-cols-1 gap-3 pt-1">
        {question.options.map((optionText, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrectAnswer = idx === question.correctIndex;

          let optionStyle =
            "border-border/80 bg-background hover:bg-muted/50 hover:border-sky-300 dark:hover:border-sky-700";
          let labelStyle = "bg-muted text-muted-foreground";

          if (isSelected && !showFeedback) {
            optionStyle =
              "border-2 border-sky-600 bg-sky-50/50 dark:bg-sky-950/40 text-foreground shadow-xs";
            labelStyle = "bg-sky-600 text-white font-bold";
          } else if (showFeedback) {
            if (isCorrectAnswer) {
              optionStyle =
                "border-2 border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-foreground shadow-xs";
              labelStyle = "bg-emerald-600 text-white font-bold";
            } else if (isSelected && !isCorrectAnswer) {
              optionStyle =
                "border-2 border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-foreground shadow-xs";
              labelStyle = "bg-rose-600 text-white font-bold";
            } else {
              optionStyle = "border-border/60 opacity-60 bg-muted/20";
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={showFeedback && !isExamMode}
              onClick={() => onSelectOption(idx)}
              className={cn(
                "group relative flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer disabled:cursor-default",
                optionStyle
              )}
            >
              {/* Option Index Badge (A, B, C, D) */}
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-semibold transition-colors",
                  labelStyle
                )}
              >
                {optionLabels[idx] || idx + 1}
              </span>

              {/* Option Text */}
              <div className="flex-1 pt-0.5">
                <span className="text-sm font-medium leading-relaxed">
                  {optionText}
                </span>
              </div>

              {/* Feedback Icons */}
              {showFeedback && (
                <div className="shrink-0 pt-0.5">
                  {isCorrectAnswer && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 animate-in zoom-in-50" />
                  )}
                  {isSelected && !isCorrectAnswer && (
                    <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 animate-in zoom-in-50" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation & Clinical Rationale Box (Revealed upon answering) */}
      {showFeedback && (
        <div className="mt-2 p-5 rounded-2xl border border-border bg-muted/30 dark:bg-muted/10 space-y-3 animate-in fade-in-50 slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-foreground font-bold text-sm">
              <AlertCircle className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span>GIẢI THÍCH BỆNH HỌC & CƠ CHẾ LÂM SÀNG</span>
            </div>
            <span
              className={cn(
                "text-xs font-bold px-2.5 py-0.5 rounded-full",
                selectedOption === question.correctIndex
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
              )}
            >
              {selectedOption === question.correctIndex ? "Trả lời ĐÚNG" : "Trả lời SAI"}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {question.explanation}
          </p>

          {/* Quick Action: Ask MediAI */}
          {onAskAI && (
            <div className="pt-2 border-t border-border/60 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                Cần hiểu sâu hơn về cơ chế bệnh sinh?
              </span>
              <button
                type="button"
                onClick={() => onAskAI(question)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-all"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Hỏi MediAI giải thích thêm</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
