import React from "react";
import Link from "next/link";
import {
  Stethoscope,
  Heart,
  ShieldCheck,
  BookMarked,
  Sparkles,
  UserCheck,
  Phone,
  MessageCircle,
  ExternalLink,
  User,
  Mail,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30 dark:bg-muted/10 transition-colors">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-sm">
                <Stethoscope className="h-4 w-4" />
              </div>
              <span className="font-black text-base text-foreground">MediMind Hub</span>
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Phân Hệ Học Tập</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>
                <Link href="/quiz" className="hover:text-sky-600 transition-colors">
                  Luyện Trắc Nghiệm MCQ Bloom
                </Link>
              </li>
              <li>
                <Link href="/flashcards" className="hover:text-sky-600 transition-colors">
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
                  Biên Soạn &amp; Import Đề
                </Link>
              </li>
              <li>
                <Link href="/ai-tutor" className="hover:text-sky-600 transition-colors">
                  Trợ Lý MediAI Tutor
                </Link>
              </li>
            </ul>
          </div>

          {/* Bloom Taxonomy */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">6 Mức Độ Bloom</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li><span className="text-blue-500 font-medium">Cấp 1:</span> Nhớ (Remembering)</li>
              <li><span className="text-emerald-500 font-medium">Cấp 2:</span> Hiểu (Understanding)</li>
              <li><span className="text-amber-500 font-medium">Cấp 3:</span> Vận dụng (Applying)</li>
              <li><span className="text-orange-500 font-medium">Cấp 4:</span> Phân tích (Analyzing)</li>
              <li><span className="text-purple-500 font-medium">Cấp 5 &amp; 6:</span> Đánh giá &amp; Sáng tạo</li>
            </ul>
          </div>

          {/* Creator & Direct Contact Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Thông Tin Nhà Sáng Tạo</h4>
            <div className="p-4 rounded-2xl bg-card border border-sky-200 dark:border-sky-900 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-sky-700 dark:text-sky-300">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600">
                  <User className="h-3.5 w-3.5" />
                </div>
                <span>Tác giả: Lê Anh Tuấn</span>
              </div>

              <div className="space-y-2 text-xs">
                {/* ZALO CONTACT */}
                <a
                  href="https://zalo.me/0813194249"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 hover:bg-sky-50 dark:hover:bg-sky-950/50 border border-border/80 text-muted-foreground hover:text-sky-600 transition-all font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded-md bg-blue-600 text-[10px] font-black text-white">
                      ZALO
                    </span>
                    <span>0813194249</span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </a>

                <div className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                  Liên hệ trao đổi chuyên môn, đóng góp ngân hàng đề thi hoặc hỗ trợ kỹ thuật qua Zalo.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & author info */}
        <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © 2026 MediMind Platform • Dự án do <strong>Nhà sáng tạo Lê Anh Tuấn</strong> thiết kế &amp; phát triển.
          </p>
          <div className="flex items-center gap-2">
            <a
              href="https://zalo.me/0813194249"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sky-600 font-semibold transition-colors flex items-center gap-1.5"
            >
              💬 Zalo: 0813194249
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
