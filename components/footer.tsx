import React from "react";
import Link from "next/link";
import { Stethoscope, Heart, ShieldCheck, BookMarked, Sparkles, UserCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30 dark:bg-muted/10 transition-colors">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-sm">
                <Stethoscope className="h-4 w-4" />
              </div>
              <span className="font-bold text-base text-foreground">MediMind Hub</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Nền tảng ôn luyện kiến thức và rèn luyện tư duy lâm sàng theo Thang đo Bloom dành cho sinh viên và bác sĩ nội trú y khoa.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="h-4 w-4" />
              <span>Chuẩn Guideline ESC, AHA, Bộ Y Tế</span>
            </div>
          </div>

          {/* Core Modules */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Phân Hệ Học Tập</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>
                <Link href="/quiz/deck_cardio_01" className="hover:text-sky-600 transition-colors">
                  Luyện Trắc Nghiệm MCQ Bloom
                </Link>
              </li>
              <li>
                <Link href="/flashcards/deck_pharm_01" className="hover:text-sky-600 transition-colors">
                  Flashcard 3D Spaced Repetition
                </Link>
              </li>
              <li>
                <Link href="/folders" className="hover:text-sky-600 transition-colors">
                  Cây Thư Mục Đa Cấp
                </Link>
              </li>
              <li>
                <Link href="/create" className="hover:text-sky-600 transition-colors">
                  Creator Studio &amp; AI Import
                </Link>
              </li>
            </ul>
          </div>

          {/* Bloom Taxonomy */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">6 Mức Độ Bloom</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li><span className="text-blue-500 font-medium">Cấp 1:</span> Nhớ (Remembering)</li>
              <li><span className="text-emerald-500 font-medium">Cấp 2:</span> Hiểu (Understanding)</li>
              <li><span className="text-amber-500 font-medium">Cấp 3:</span> Vận dụng (Applying)</li>
              <li><span className="text-orange-500 font-medium">Cấp 4:</span> Phân tích (Analyzing)</li>
              <li><span className="text-purple-500 font-medium">Cấp 5 &amp; 6:</span> Đánh giá &amp; Sáng tạo</li>
            </ul>
          </div>

          {/* AI Tutor & Creator Recognition */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Nhà Sáng Tạo &amp; AI</h4>
            <div className="p-3 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Nhà sáng tạo: Lê Anh Tuấn</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Thiết kế kiến trúc hệ thống Y khoa &amp; Phân tích tư duy Bloom 2026.
              </p>
            </div>

            <Link
              href="/ai-tutor"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Trải nghiệm MediAI Tutor</span>
            </Link>
          </div>
        </div>

        <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 MediMind Platform • Nhà sáng tạo: <strong>Lê Anh Tuấn</strong> đã thực hiện.</p>
          <div className="flex items-center gap-1">
            <span>Thiết kế tối ưu trải nghiệm học tập Y Dược</span>
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}
