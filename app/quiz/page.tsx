"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, DeckWithFolder } from "@/lib/auth-context";
import { AuthGuard } from "@/components/auth-guard";
import { MEDICAL_SPECIALTIES } from "@/constants/bloom";
import {
  Layers,
  Search,
  Plus,
  PlusCircle,
  FolderTree,
  FileQuestion,
  Play,
  Trash2,
  Sparkles,
  BookOpen,
  ArrowRight,
  Filter,
  CheckCircle2,
  Calendar,
  Shuffle,
  Clock,
  Lock,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuizIndexPage() {
  const { user, getUserDecks, deleteUserDeck } = useAuth();

  const [decks, setDecks] = useState<DeckWithFolder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tất cả chuyên khoa");
  const [deckToDelete, setDeckToDelete] = useState<DeckWithFolder | null>(null);
  const [showDemoLockAlert, setShowDemoLockAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isDemoUser = user?.isDemo ?? false;

  // Load all user-scoped MCQ decks
  const loadAllMCQDecks = () => {
    setIsLoading(true);
    try {
      const list = getUserDecks("MCQ");
      setDecks(list);
    } catch (e) {
      setDecks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllMCQDecks();
  }, [user]);

  // Handle Delete Deck with clean synchronization
  const confirmDeleteDeck = () => {
    if (!deckToDelete) return;
    if (isDemoUser) {
      setShowDemoLockAlert(true);
      setDeckToDelete(null);
      return;
    }

    deleteUserDeck(deckToDelete.id);
    setDeckToDelete(null);
    loadAllMCQDecks();
  };

  // Filtered decks
  const filteredDecks = decks.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.folderName && d.folderName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSpecialty =
      selectedSpecialty === "Tất cả chuyên khoa" || d.specialty === selectedSpecialty;

    return matchesSearch && matchesSpecialty;
  });

  const totalQuestionsCount = decks.reduce((acc, curr) => acc + (curr.itemCount || 0), 0);

  return (
    <AuthGuard
      featureTitle="Trung Tâm Luyện Thi MCQ Y Khoa Bloom"
      featureDescription="Vui lòng đăng nhập để truy cập tất cả các bộ đề thi trắc nghiệm trong Cây Thư Mục của bạn."
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold text-xs">
              <Stethoscope className="h-4 w-4" />
              <span>TRUNG TÂM LUYỆN ĐỀ TRẮC NGHIỆM CHUẨN BLOOM 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              Danh Sách Tất Cả Bộ Đề Luyện MCQ
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Tổng hợp toàn bộ các bộ đề trắc nghiệm y khoa trong Cây Thư Mục riêng của bạn
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/folders"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border bg-card hover:bg-muted font-bold text-xs text-foreground transition-all shadow-xs"
            >
              <FolderTree className="h-4 w-4 text-sky-600" />
              <span>Cây Thư Mục</span>
            </Link>

            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all hover:scale-105"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Biên Soạn &amp; Import Đề Mới</span>
            </Link>
          </div>
        </div>

        {/* Quick Stat Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl border border-sky-200 dark:border-sky-900/60 bg-gradient-to-br from-sky-500/10 via-card to-background shadow-xs space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase">
              <span>Tổng Số Bộ Đề MCQ</span>
              <FileQuestion className="h-4 w-4 text-sky-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-700 dark:text-sky-300">
              {decks.length}
            </div>
            <p className="text-[11px] text-muted-foreground">Đang lưu trong Cây Thư Mục</p>
          </div>

          <div className="p-5 rounded-3xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-500/10 via-card to-background shadow-xs space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase">
              <span>Tổng Số Câu Hỏi Trắc Nghiệm</span>
              <Layers className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-700 dark:text-indigo-300">
              {totalQuestionsCount}
            </div>
            <p className="text-[11px] text-muted-foreground">Phân tích ma trận 6 bậc Bloom</p>
          </div>

          <div className="p-5 rounded-3xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-500/10 via-card to-background shadow-xs space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase">
              <span>Chế Độ Thi Đấu</span>
              <Sparkles className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-300">
              Cuộn Dọc + Bấm Giờ
            </div>
            <p className="text-[11px] text-muted-foreground">Thanh Palette &amp; Khóa Tạm Dừng</p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border border-border bg-card shadow-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên bộ đề, tên thư mục, nội dung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-sky-500/50"
            >
              {MEDICAL_SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* DECKS GRID */}
        {!isLoading && filteredDecks.length === 0 ? (
          <div className="p-12 rounded-3xl border-2 border-dashed border-border bg-card/40 text-center space-y-6 animate-in fade-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 dark:bg-sky-950 text-sky-600 shadow-inner">
              <FileQuestion className="h-8 w-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-foreground">
                {searchQuery || selectedSpecialty !== "Tất cả chuyên khoa"
                  ? "Không Tìm Thấy Bộ Đề Phù Hợp"
                  : "Chưa Có Bộ Đề MCQ Nào Trong Cây Thư Mục"}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {searchQuery || selectedSpecialty !== "Tất cả chuyên khoa"
                  ? "Hãy thử tìm kiếm với từ khóa khác hoặc chuyển bộ lọc chuyên khoa về 'Tất cả chuyên khoa'."
                  : "Hãy tạo bộ đề trắc nghiệm đầu tiên của bạn bằng công cụ Biên Soạn & Import hoặc dùng AI tự động tạo đề!"}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/create"
                className="px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all hover:scale-105"
              >
                ➕ Tạo Bộ Đề Mới
              </Link>
              <Link
                href="/folders"
                className="px-5 py-2.5 rounded-2xl border border-border bg-card hover:bg-muted font-bold text-xs text-foreground transition-all"
              >
                📁 Quản Lý Cây Thư Mục
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDecks.map((deck) => (
              <div
                key={deck.id}
                className="group relative flex flex-col justify-between p-6 rounded-3xl border border-border bg-card hover:border-sky-300 dark:hover:border-sky-700 shadow-xs hover:shadow-lg transition-all space-y-5"
              >
                <div className="space-y-3">
                  {/* Top Tags */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 uppercase tracking-wider">
                      {deck.specialty}
                    </span>

                    <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-900/60 px-2.5 py-0.5 rounded-lg flex items-center gap-1 line-clamp-1 max-w-[200px]">
                      📁 {deck.folderName || "Thư Mục Gốc"}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-sky-600 transition-colors leading-snug line-clamp-2">
                      {deck.title}
                    </h3>
                    {deck.description && (
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed font-normal">
                        {deck.description}
                      </p>
                    )}
                  </div>

                  {/* Prominent Folder Origin Badge */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/80 text-[11px] text-muted-foreground font-medium">
                    <FolderTree className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                    <span className="truncate">Nguồn Cây Thư Mục: <strong className="text-foreground">{deck.folderName || "Thư Mục Gốc"}</strong></span>
                  </div>
                </div>

                {/* Bottom Meta & Actions */}
                <div className="pt-4 border-t border-border/60 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold">
                      <Layers className="h-3.5 w-3.5" />
                      <span>{deck.itemCount} câu hỏi</span>
                    </span>
                    <span className="text-[11px] opacity-80">{deck.updatedAt}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/quiz/${deck.id}`}
                      className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                    >
                      <Play className="h-3.5 w-3.5 fill-white" />
                      <span>Luyện Thi Cuộn</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    <Link
                      href={`/create?appendDeckId=${deck.id}&type=MCQ`}
                      className="p-2.5 rounded-2xl border border-border hover:bg-sky-50 dark:hover:bg-sky-950/40 text-muted-foreground hover:text-sky-600 transition-colors"
                      title="Nạp thêm câu hỏi vào bộ đề này"
                    >
                      <Plus className="h-4 w-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setDeckToDelete(deck)}
                      className="p-2.5 rounded-2xl border border-border hover:bg-rose-50 dark:hover:bg-rose-950/40 text-muted-foreground hover:text-rose-600 transition-colors"
                      title="Xóa bộ đề này"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deckToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">Xác Nhận Xóa Bộ Đề MCQ</h3>
                  <p className="text-xs text-muted-foreground">Xóa đồng bộ khỏi Cây Thư Mục và Phòng Luyện Thi</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1.5 text-xs">
                <div className="font-bold text-foreground text-sm">{deckToDelete.title}</div>
                <div className="text-muted-foreground">
                  Chuyên khoa: <strong>{deckToDelete.specialty}</strong> • Số lượng: <strong>{deckToDelete.itemCount} câu</strong>
                </div>
                <div className="text-[11px] text-sky-600 font-semibold">📁 Nguồn thư mục: {deckToDelete.folderName || "Thư Mục Gốc"}</div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Bạn có chắc chắn muốn xóa bộ đề này không? Bộ đề sẽ bị xóa đồng thời khỏi cả <strong>Cây Thư Mục</strong> và <strong>Phòng Luyện Đề MCQ</strong>.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeckToDelete(null)}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteDeck}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all hover:scale-105"
                >
                  Xác Nhận Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DEMO LOCK ALERT */}
        {showDemoLockAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl border border-amber-300 dark:border-amber-900 bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 shadow-xs">
                <Lock className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-foreground">
                  Tài Khoản Dùng Thử Được Bảo Vệ
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tài khoản mẫu dùng thử đang ở chế độ <strong>&ldquo;Chỉ Xem&rdquo;</strong>. Không thể xóa bộ đề mẫu.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDemoLockAlert(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                >
                  Đã Hiểu
                </button>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20"
                >
                  Tạo Tài Khoản Riêng
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
