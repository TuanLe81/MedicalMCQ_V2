"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Stethoscope,
  BrainCircuit,
  Layers,
  FolderTree,
  Bot,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Flame,
  Star,
  Users,
  BookOpen,
  Award,
  Zap,
  Clock,
  GraduationCap,
  LogIn,
  UserPlus,
  Heart,
  ShieldCheck,
  User,
} from "lucide-react";
import { BloomBadge } from "@/components/mcq/bloom-badge";
import { MEDICAL_SPECIALTIES } from "@/constants/bloom";

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-20 md:pt-16 md:pb-28 border-b border-border/50 bg-gradient-to-b from-sky-500/5 via-background to-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left Content */}
            <div className="flex-1 space-y-6 text-center lg:text-left">
              
              {/* CREATOR RECOGNITION BADGE - Gọn gàng, Đẹp mắt & Nổi bật */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 border border-sky-300/60 dark:border-sky-700/60 shadow-xs hover:scale-[1.02] transition-transform">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white text-[10px] font-black shadow-xs">
                    AT
                  </div>
                  <span className="text-xs text-foreground/90 font-medium">
                    Nhà sáng tạo: <strong className="font-extrabold text-sky-700 dark:text-sky-300">Lê Anh Tuấn</strong> đã thực hiện
                  </span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-bold shadow-xs">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Chuẩn Bloom 2026</span>
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.15]">
                Học Y Thông Minh Với{" "}
                <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Ma Trận Tư Duy Bloom
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Không chỉ là học vẹt trắc nghiệm. MediMind giúp sinh viên Y Dược làm chủ kiến thức từ{" "}
                <strong className="text-foreground">Nhớ định nghĩa</strong> đến{" "}
                <strong className="text-foreground">Biện luận ca lâm sàng</strong>, Flashcard 3D và quản lý thư mục học tập đa cấp linh hoạt.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href={isAuthenticated ? "/quiz" : "/login"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02]"
                >
                  <BrainCircuit className="h-5 w-5" />
                  <span>{isAuthenticated ? "Vào Phòng Luyện MCQ Bloom" : "Đăng Nhập & Luyện MCQ"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href={isAuthenticated ? "/folders" : "/register"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-border bg-card hover:bg-muted font-bold text-sm sm:text-base text-foreground shadow-xs transition-all"
                >
                  {isAuthenticated ? (
                    <>
                      <FolderTree className="h-5 w-5 text-sky-600" />
                      <span>Cây Thư Mục Của Bạn</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 text-sky-600" />
                      <span>Tạo Tài Khoản Mới</span>
                    </>
                  )}
                </Link>
              </div>

              {/* Social Proof Stats */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Chuẩn Guideline ESC & Bộ Y Tế</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Tự Động Chấm Điểm & Hẹn Giờ</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Flashcard Spaced Repetition</span>
                </div>
              </div>
            </div>

            {/* Right Visual Card Mockup */}
            <div className="flex-1 w-full max-w-lg">
              <div className="relative rounded-3xl border border-border bg-card/90 backdrop-blur-xl p-6 sm:p-7 shadow-2xl space-y-4">
                {/* Visual Top Bar */}
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white font-bold text-xs">
                      Y4
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-foreground">Ca Lâm Sàng Suy Tim HFrEF</h4>
                      <span className="text-[10px] text-muted-foreground">Thời gian: 15:00 • Cấp 4: Phân Tích</span>
                    </div>
                  </div>
                  <BloomBadge level="ANALYZING" size="sm" />
                </div>

                {/* Question Demonstration */}
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-sky-50/60 dark:bg-sky-950/30 text-xs text-foreground/90 italic">
                    &ldquo;Bệnh nhân nam 62 tuổi, khó thở khi nằm, ran ẩm 2 đáy phổi, T3 Gallop...&rdquo;
                  </div>
                  <p className="text-xs font-bold text-foreground">
                    Dấu hiệu nào có độ đặc hiệu cao nhất cho suy tim sung huyết?
                  </p>
                </div>

                {/* Option Showcase: Correct (Green) vs Wrong (Red) */}
                <div className="space-y-2 pt-1">
                  {/* Correct Option with Green Border */}
                  <div className="flex items-center justify-between p-3 rounded-xl border-2 border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-xs font-semibold text-foreground">
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px]">A</span>
                      <span>Tiếng T3 Gallop ở mỏm tim (Độ đặc hiệu &gt; 95%)</span>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>

                  {/* Wrong Selected Option with Red Border */}
                  <div className="flex items-center justify-between p-3 rounded-xl border-2 border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-xs font-semibold text-foreground">
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-md bg-rose-600 text-white flex items-center justify-center text-[10px]">B</span>
                      <span>Ran ẩm ở 2 đáy phổi (Độ nhạy cao, độ đặc hiệu thấp)</span>
                    </div>
                    <span className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 px-2 py-0.5 rounded-full font-bold">
                      Đã chọn (Sai)
                    </span>
                  </div>
                </div>

                {/* Bloom Status Bar Mini Preview */}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-foreground">Streak: 14 ngày</span>
                  </div>
                  <span className="text-sky-600 dark:text-sky-400 font-bold">
                    Tư duy Phân tích: 80%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SIX BLOOM TAXONOMY TIERS SHOWCASE */}
      <section className="py-16 bg-muted/20 border-b border-border/50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Chuẩn Hóa Kiến Thức Theo 6 Mức Độ Tư Duy Bloom
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Mỗi câu hỏi và thẻ ghi nhớ trên MediMind đều được phân loại chính xác, giúp bạn phát hiện lỗ hổng tư duy và nâng tầm từ việc học thuộc lòng sang tư duy chẩn đoán thực thụ.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs">
                  1. Nhớ (Remembering)
                </span>
                <span className="text-xs text-muted-foreground font-mono">Cấp độ 1</span>
              </div>
              <h4 className="font-bold text-sm text-foreground">Thuộc lòng trị số &amp; giải phẫu</h4>
              <p className="text-xs text-muted-foreground">
                Định nghĩa bệnh học, giải phẫu định khu, trị số xét nghiệm sinh hóa bình thường và tên các nhóm thuốc.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                  2. Hiểu (Understanding)
                </span>
                <span className="text-xs text-muted-foreground font-mono">Cấp độ 2</span>
              </div>
              <h4 className="font-bold text-sm text-foreground">Cơ chế bệnh sinh &amp; Dược động học</h4>
              <p className="text-xs text-muted-foreground">
                Hiểu tại sao một triệu chứng xuất hiện, cơ chế bù trừ của hệ tim mạch và đường đào thải của thuốc.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs">
                  3. Vận dụng (Applying)
                </span>
                <span className="text-xs text-muted-foreground font-mono">Cấp độ 3</span>
              </div>
              <h4 className="font-bold text-sm text-foreground">Tính liều &amp; Áp dụng guideline</h4>
              <p className="text-xs text-muted-foreground">
                Tính điểm thang điểm (CHA2DS2-VASc, CURB-65), chỉnh liều theo độ thanh thải GFR và chọn thuốc bước 1.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-orange-200 dark:border-orange-900/60 bg-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-bold text-xs">
                  4. Phân tích (Analyzing)
                </span>
                <span className="text-xs text-muted-foreground font-mono">Cấp độ 4</span>
              </div>
              <h4 className="font-bold text-sm text-foreground">Biện luận ca lâm sàng phức tạp</h4>
              <p className="text-xs text-muted-foreground">
                Phân tích hội chứng, chẩn đoán phân biệt nhiều bệnh cảnh chồng lấp và phát hiện dấu hiệu cờ đỏ cấp cứu.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs">
                  5. Đánh giá (Evaluating)
                </span>
                <span className="text-xs text-muted-foreground font-mono">Cấp độ 5</span>
              </div>
              <h4 className="font-bold text-sm text-foreground">Tiên lượng &amp; Chỉ định can thiệp</h4>
              <p className="text-xs text-muted-foreground">
                Cân nhắc nguy cơ - lợi ích giữa phẫu thuật cấp cứu và điều trị nội khoa bảo tồn cho bệnh nhân nặng.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs">
                  6. Sáng tạo (Creating)
                </span>
                <span className="text-xs text-muted-foreground font-mono">Cấp độ 6</span>
              </div>
              <h4 className="font-bold text-sm text-foreground">Phác đồ cá thể hóa đa mô thức</h4>
              <p className="text-xs text-muted-foreground">
                Xây dựng chiến lược can thiệp toàn diện cho bệnh nhân đa bệnh lý nền, suy tim kháng trị và ghép tạng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE MODULES GRID */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Hệ Sinh Thái Ôn Luyện Đột Phá
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Tích hợp mọi công cụ cần thiết cho hành trình từ sinh viên Y khoa đến Bác sĩ Nội trú
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* MCQ Card */}
            <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-4 hover:border-sky-300 dark:hover:border-sky-700 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Luyện Trắc Nghiệm MCQ &amp; Hẹn Giờ</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Đếm ngược thời gian tùy chỉnh, tự động nộp bài khi hết giờ. Hiển thị viền xanh đáp án đúng, viền đỏ đáp án sai và lời giải thích cơ chế bệnh học chi tiết.
              </p>
              <Link
                href={isAuthenticated ? "/quiz/deck_cardio_01" : "/login"}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700"
              >
                <span>{isAuthenticated ? "Bắt đầu thi thử" : "Đăng nhập để thi thử"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Flashcard Card */}
            <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-4 hover:border-purple-300 dark:hover:border-purple-700 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Flashcard 3D Spaced Repetition</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Lật thẻ 3D mượt mà với Framer Motion. Thuật toán lặp lại ngắt quãng tối ưu hóa trí nhớ dài hạn cho hàng ngàn liều thuốc và hội chứng lâm sàng.
              </p>
              <Link
                href={isAuthenticated ? "/flashcards/deck_pharm_01" : "/login"}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700"
              >
                <span>{isAuthenticated ? "Lật thẻ ngay" : "Đăng nhập để học thẻ"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Folder & AI Card */}
            <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <FolderTree className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Cây Thư Mục &amp; Trợ Lý MediAI</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tạo thư mục lớn và thư mục con chứa MCQ hoặc Flashcard tùy ý. MediAI giải thích ca bệnh và tự động sinh đề thi theo từng mốc Bloom.
              </p>
              <Link
                href={isAuthenticated ? "/folders" : "/login"}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                <span>{isAuthenticated ? "Xem cây thư mục" : "Đăng nhập để quản lý"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER & CREATOR FOOTER */}
      <section className="py-16 border-t border-border/60 bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-6">
          <GraduationCap className="h-12 w-12 mx-auto text-amber-300 animate-bounce" />
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Sẵn Sàng Nâng Tầm Năng Lực Tư Duy Y Khoa?
          </h2>
          <p className="text-sm sm:text-base text-sky-100 max-w-xl mx-auto font-normal">
            Tham gia cùng hàng ngàn sinh viên Đại học Y Dược đang rèn luyện tư duy lâm sàng và tự tin bứt phá trong các kỳ thi học kỳ và nội trú!
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={isAuthenticated ? "/quiz" : "/login"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-sky-700 hover:bg-sky-50 font-extrabold text-sm shadow-lg transition-all hover:scale-105"
            >
              {isAuthenticated ? "Bắt Đầu Luyện Đề Ngay" : "Đăng Nhập Để Bắt Đầu"}
            </Link>
            <Link
              href={isAuthenticated ? "/create" : "/register"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-sky-950/40 hover:bg-sky-950/60 border border-white/20 text-white font-bold text-sm transition-all"
            >
              {isAuthenticated ? "Soạn Bộ Câu Hỏi Mới" : "Tạo Tài Khoản Miễn Phí"}
            </Link>
          </div>

          {/* Compact Creator Attribution Badge & Contact Links */}
          <div className="pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-sky-100 flex-wrap">
            <div className="inline-flex items-center gap-2">
              <span>Dự án được xây dựng &amp; phát triển bởi</span>
              <span className="font-extrabold text-white bg-white/20 px-3 py-1 rounded-full border border-white/30">
                Nhà sáng tạo: Lê Anh Tuấn
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a
                href="https://zalo.me/0813194249"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/80 hover:bg-blue-600 text-white font-bold shadow-xs transition-all hover:scale-105"
              >
                <span>💬 Zalo: 0813194249</span>
              </a>

              <a
                href="https://www.facebook.com/le.tuan.934451"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-900/60 hover:bg-indigo-900 text-white font-bold shadow-xs transition-all hover:scale-105"
              >
                <span>🌐 Facebook: Lê Tuấn</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
