"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Deck } from "@/types";
import { useAuth, DeckWithFolder } from "@/lib/auth-context";
import { MEDICAL_SPECIALTIES } from "@/constants/bloom";
import { Pencil, Check, X, Layers, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: Deck | DeckWithFolder | null;
  onSuccess?: (updatedDeck: Deck) => void;
}

export function EditDeckModal({
  isOpen,
  onClose,
  deck,
  onSuccess,
}: EditDeckModalProps) {
  const { user, updateUserDeck } = useAuth();

  const [title, setTitle] = useState("");
  const [specialty, setSpecialty] = useState("Nội Tim Mạch");
  const [customSpecialty, setCustomSpecialty] = useState("");
  const [isCustomSpecialty, setIsCustomSpecialty] = useState(false);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (deck) {
      setTitle(deck.title || "");
      setDescription(deck.description || "");

      const currentSpec = deck.specialty || "Nội Tim Mạch";
      const standardList = MEDICAL_SPECIALTIES.filter((s) => s !== "Tất cả chuyên khoa");

      if (standardList.includes(currentSpec)) {
        setSpecialty(currentSpec);
        setIsCustomSpecialty(false);
        setCustomSpecialty("");
      } else {
        setSpecialty("KHAC");
        setIsCustomSpecialty(true);
        setCustomSpecialty(currentSpec);
      }
      setError(null);
    }
  }, [deck, isOpen]);

  if (!isOpen || !deck) return null;

  if (user?.isDemo) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
        <div className="w-full max-w-md rounded-3xl border border-amber-300 dark:border-amber-900 bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 shadow-xs">
            <Lock className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-foreground">
              Tài Khoản Mẫu Đang Ở Chế Độ Chỉ Xem
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Bạn đang đăng nhập bằng Tài Khoản Mẫu (demo_guest). Chế độ này không cho phép đổi tên hoặc chỉnh sửa thông tin bộ đề mẫu. Vui lòng đăng ký tài khoản cá nhân!
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
            >
              Đóng
            </button>
            <Link
              href="/register"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20"
            >
              Tạo Tài Khoản Riêng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSpecialtySelectChange = (val: string) => {
    if (val === "KHAC") {
      setIsCustomSpecialty(true);
      setSpecialty("KHAC");
    } else {
      setIsCustomSpecialty(false);
      setSpecialty(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Vui lòng nhập tên bộ đề!");
      return;
    }

    const finalSpecialty = isCustomSpecialty
      ? customSpecialty.trim() || "Chuyên Khoa Khác"
      : specialty;

    setIsSubmitting(true);
    setError(null);

    const res = updateUserDeck(deck.id, {
      title: title.trim(),
      specialty: finalSpecialty,
      description: description.trim(),
    });

    setIsSubmitting(false);

    if (res.success && res.updatedDeck) {
      if (onSuccess) {
        onSuccess(res.updatedDeck);
      }
      onClose();
    } else {
      setError(res.error || "Có lỗi xảy ra khi cập nhật bộ đề!");
    }
  };

  const isMCQ = deck.type === "MCQ";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl border-2 border-border bg-card p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-inner",
                isMCQ
                  ? "bg-sky-100 dark:bg-sky-950 text-sky-600"
                  : "bg-purple-100 dark:bg-purple-950 text-purple-600"
              )}
            >
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-foreground flex items-center gap-1.5">
                <span>Chỉnh Sửa Bộ Đề</span>
                <span
                  className={cn(
                    "text-[10px] font-black px-2 py-0.5 rounded-full uppercase",
                    isMCQ
                      ? "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300"
                      : "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                  )}
                >
                  {isMCQ ? "Trắc Nghiệm MCQ" : "Flashcard 3D"}
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Cập nhật tên bộ đề và chuyên khoa y học
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs font-semibold animate-in fade-in">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Deck Title */}
          <div className="space-y-1.5">
            <label className="block font-bold text-foreground flex items-center justify-between">
              <span>Tên Bộ Đề *</span>
              <span className="text-[10px] text-muted-foreground">
                {title.length}/120 ký tự
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tên mới cho bộ đề..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none"
              />
            </div>
          </div>

          {/* Medical Specialty */}
          <div className="space-y-1.5">
            <label className="block font-bold text-foreground flex items-center justify-between">
              <span>Mục Chuyên Khoa Y Học *</span>
              <span className="text-[10px] text-muted-foreground">
                Phân loại theo hệ thống Y khoa
              </span>
            </label>

            <select
              value={isCustomSpecialty ? "KHAC" : specialty}
              onChange={(e) => handleSpecialtySelectChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-sky-500/50"
            >
              {MEDICAL_SPECIALTIES.filter((s) => s !== "Tất cả chuyên khoa").map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value="KHAC">
                ✨ [Mục Khác] - Tự Nhập Chuyên Khoa Tùy Chọn...
              </option>
            </select>

            {isCustomSpecialty && (
              <div className="pt-1 animate-in fade-in">
                <input
                  type="text"
                  required
                  value={customSpecialty}
                  onChange={(e) => setCustomSpecialty(e.target.value)}
                  placeholder="Nhập tên chuyên khoa (VD: Da Liễu, Chẩn Đoán Hình Ảnh, Răng Hàm Mặt, Y Học Cổ Truyền...)"
                  className="w-full px-3.5 py-2 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-background text-xs font-semibold text-foreground focus:ring-2 focus:ring-indigo-500/50 outline-none"
                />
              </div>
            )}
          </div>

          {/* Description (Optional) */}
          <div className="space-y-1.5">
            <label className="block font-bold text-foreground flex items-center justify-between">
              <span>Mô Tả Bộ Đề (Tùy chọn)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú về nội dung bộ đề, mục tiêu ôn tập..."
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none leading-relaxed"
            />
          </div>

          {/* Current Meta Summary */}
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-sky-600" />
              <span>Số lượng: <strong className="text-foreground">{deck.itemCount} {isMCQ ? "câu hỏi" : "thẻ"}</strong></span>
            </span>
            <span>Cập nhật gần nhất: {deck.updatedAt}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors"
            >
              Hủy Bỏ
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all hover:scale-105 disabled:opacity-50",
                isMCQ
                  ? "bg-sky-600 hover:bg-sky-700 shadow-sky-600/20"
                  : "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20"
              )}
            >
              <Check className="h-4 w-4" />
              <span>{isSubmitting ? "Đang Lưu..." : "Lưu Thay Đổi"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

