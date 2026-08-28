"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BloomLevel, DeckType } from "@/types";
import { BLOOM_TAXONOMY_MAP, MEDICAL_SPECIALTIES } from "@/constants/bloom";
import { BloomBadge } from "@/components/mcq/bloom-badge";
import {
  FilePlus,
  Layers,
  FolderPlus,
  Save,
  CheckCircle2,
  BrainCircuit,
  HelpCircle,
  Stethoscope,
  Sparkles,
  ArrowRight,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateStudioPage() {
  const [activeTab, setActiveTab] = useState<"MCQ" | "FLASHCARD" | "DECK">("MCQ");

  // MCQ Form States
  const [vignette, setVignette] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [bloomLevel, setBloomLevel] = useState<BloomLevel>("ANALYZING");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [options, setOptions] = useState<string[]>([
    "Lựa chọn A...",
    "Lựa chọn B...",
    "Lựa chọn C...",
    "Lựa chọn D...",
  ]);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [explanation, setExplanation] = useState("");
  const [targetSpecialty, setTargetSpecialty] = useState("Nội Tim Mạch");

  // Flashcard Form States
  const [fcFront, setFcFront] = useState("");
  const [fcBack, setFcBack] = useState("");
  const [fcHint, setFcHint] = useState("");
  const [fcBloom, setFcFcBloom] = useState<BloomLevel>("REMEMBERING");

  // Success Notification
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleOptionChange = (idx: number, value: string) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  };

  const handleSaveMCQ = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleSaveFlashcard = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const bloomKeys = Object.keys(BLOOM_TAXONOMY_MAP) as BloomLevel[];

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            <Sparkles className="h-4 w-4" />
            <span>CREATOR STUDIO • SOẠN THẢO CHUẨN BLOOM 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            Biên Soạn Câu Hỏi & Bộ Thẻ Y Khoa
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Tạo câu hỏi trắc nghiệm ca bệnh lâm sàng, thẻ ghi nhớ 3D và gắn nhãn 6 bậc thang đo Bloom
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Đã lưu thành công vào thư mục!</span>
          </div>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("MCQ")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all",
            activeTab === "MCQ"
              ? "border-sky-600 text-sky-600 dark:text-sky-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <FilePlus className="h-4 w-4" />
          <span>Tạo Câu Hỏi MCQ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("FLASHCARD")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all",
            activeTab === "FLASHCARD"
              ? "border-purple-600 text-purple-600 dark:text-purple-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Layers className="h-4 w-4" />
          <span>Tạo Thẻ Flashcard 3D</span>
        </button>
      </div>

      {/* TAB 1: MCQ CREATOR FORM */}
      {activeTab === "MCQ" && (
        <form onSubmit={handleSaveMCQ} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            {/* Clinical Vignette */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tình Huống Ca Bệnh Lâm Sàng (Clinical Vignette - Tùy chọn)
              </label>
              <textarea
                rows={3}
                placeholder="VD: Bệnh nhân nam 62 tuổi, tiền căn tăng huyết áp và ĐTĐ type 2, nhập viện vì khó thở kịch phát về đêm, tĩnh mạch cổ nổi, ran ẩm 2 đáy phổi..."
                value={vignette}
                onChange={(e) => setVignette(e.target.value)}
                className="w-full p-4 rounded-2xl border border-border bg-card text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none italic"
              />
            </div>

            {/* Question Text */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Nội Dung Câu Hỏi Chính *
              </label>
              <input
                type="text"
                required
                placeholder="VD: Dấu hiệu thăm khám lâm sàng nào có độ đặc hiệu cao nhất cho chẩn đoán suy tim?"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-border bg-card text-xs sm:text-sm text-foreground font-semibold focus:ring-2 focus:ring-sky-500/50 outline-none"
              />
            </div>

            {/* Options List with Correct Answer Picker */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Các Phương Án Lựa Chọn & Chọn Đáp Án Đúng (Nhấn vào nút tròn để đặt làm đáp án đúng)
              </label>
              {options.map((opt, idx) => {
                const label = ["A", "B", "C", "D"][idx];
                const isCorrect = correctIndex === idx;
                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center gap-3 p-2.5 rounded-2xl border transition-all",
                      isCorrect
                        ? "border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30"
                        : "border-border bg-card"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setCorrectIndex(idx)}
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors",
                        isCorrect
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {label}
                    </button>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Nội dung phương án ${label}...`}
                      className="flex-1 bg-transparent text-xs sm:text-sm text-foreground outline-none font-medium"
                    />
                    {isCorrect && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950">
                        Đáp án ĐÚNG
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Detailed Explanation / Pathophysiology Rationale */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Lời Giải Thích Bệnh Học & Cơ Chế Lâm Sàng Chi Tiết *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Giải thích tại sao đáp án này đúng, cơ chế thụ thể/huyết động, và vì sao các đáp án khác là bẫy/sai..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full p-4 rounded-2xl border border-border bg-card text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none"
              />
            </div>
          </div>

          {/* Right Sidebar: Bloom Taxonomy Tagger & Settings */}
          <div className="space-y-6">
            {/* Bloom's Level Selector */}
            <div className="p-5 rounded-3xl border border-border bg-card shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                <BrainCircuit className="h-4 w-4 text-indigo-600" />
                <span>GẮN THANG ĐO TƯ DUY BLOOM</span>
              </div>

              <div className="space-y-2">
                {bloomKeys.map((key) => {
                  const info = BLOOM_TAXONOMY_MAP[key];
                  const isSelected = bloomLevel === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setBloomLevel(key)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all",
                        isSelected
                          ? cn("border-2 shadow-xs", info.borderColor, info.bgLight, info.colorClass)
                          : "border-border/60 hover:bg-muted text-muted-foreground"
                      )}
                    >
                      <span>{info.vietnameseName}</span>
                      {isSelected && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specialty & Difficulty */}
            <div className="p-5 rounded-3xl border border-border bg-card shadow-sm space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground">
                  Chuyên Khoa Y Học
                </label>
                <select
                  value={targetSpecialty}
                  onChange={(e) => setTargetSpecialty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground outline-none"
                >
                  {MEDICAL_SPECIALTIES.filter((s) => s !== "Tất cả chuyên khoa").map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground">
                  Mức Độ Khó
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["EASY", "MEDIUM", "HARD"] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={cn(
                        "py-2 rounded-xl border text-xs font-bold transition-all",
                        difficulty === diff
                          ? "bg-sky-600 text-white border-sky-600"
                          : "border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {diff === "EASY" ? "Dễ" : diff === "MEDIUM" ? "Vừa" : "Khó"}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Save className="h-4 w-4" />
                <span>Lưu Câu Hỏi Vào Ngân Hàng</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: FLASHCARD CREATOR FORM */}
      {activeTab === "FLASHCARD" && (
        <form onSubmit={handleSaveFlashcard} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Mặt Trước (Thuật Ngữ / Triệu Chứng / Tên Hội Chứng) *
              </label>
              <textarea
                rows={3}
                required
                placeholder="VD: Tam chứng Charcot trong nhiễm trùng đường mật gồm những dấu hiệu gì?"
                value={fcFront}
                onChange={(e) => setFcFront(e.target.value)}
                className="w-full p-4 rounded-2xl border border-border bg-card text-xs sm:text-sm text-foreground font-semibold focus:ring-2 focus:ring-purple-500/50 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Mặt Sau (Định Nghĩa / Cơ Chế Bệnh Sinh / Giải Pháp Xử Trí) *
              </label>
              <textarea
                rows={5}
                required
                placeholder="VD: 1. Đau hạ sườn phải\n2. Sốt (kèm lạnh run)\n3. Vàng da - Vàng mắt..."
                value={fcBack}
                onChange={(e) => setFcBack(e.target.value)}
                className="w-full p-4 rounded-2xl border border-border bg-card text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-purple-500/50 outline-none whitespace-pre-line"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Gợi Ý Lâm Sàng (Hint - Tùy chọn)
              </label>
              <input
                type="text"
                placeholder="VD: Đau - Sốt - Vàng"
                value={fcHint}
                onChange={(e) => setFcHint(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-border bg-card text-xs sm:text-sm text-foreground outline-none"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-5 rounded-3xl border border-border bg-card shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                <BrainCircuit className="h-4 w-4 text-purple-600" />
                <span>GẮN CẤP ĐỘ BLOOM CHO THẺ</span>
              </div>
              <div className="space-y-2">
                {bloomKeys.slice(0, 4).map((key) => {
                  const info = BLOOM_TAXONOMY_MAP[key];
                  const isSelected = fcBloom === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFcFcBloom(key)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all",
                        isSelected
                          ? cn("border-2 shadow-xs", info.borderColor, info.bgLight, info.colorClass)
                          : "border-border/60 hover:bg-muted text-muted-foreground"
                      )}
                    >
                      <span>{info.vietnameseName}</span>
                      {isSelected && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Save className="h-4 w-4" />
                <span>Lưu Thẻ Flashcard 3D</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

