import React from "react";
import Link from "next/link";
import { Stethoscope, Heart, ShieldCheck, BookMarked, Sparkles } from "lucide-react";

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
                  Creator Studio (Soạn Thảo)
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
              <li><span className="text-purple-500 font-medium">Cấp 5 & 6:</span> Đánh giá & Sáng tạo</li>
            </ul>
          </div>

          {/* AI Tutor & Support */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Trí Tuệ Nhân Tạo</h4>
            <p className="text-xs text-muted-foreground">
              Trợ lý y khoa MediAI giải thích ca bệnh lâm sàng và tự động tạo câu hỏi theo yêu cầu mức độ tư duy.
            </p>
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
          <p>© 2026 MediMind Platform. Thiết kế dành riêng cho sinh viên Đại học Y khoa.</p>
          <div className="flex items-center gap-1">
            <span>Xây dựng với tâm huyết vì nền giáo dục y khoa</span>
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}

