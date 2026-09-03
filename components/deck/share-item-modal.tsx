"use client";

import React, { useState, useEffect } from "react";
import { FolderNode, Deck } from "@/types";
import { useAuth, DeckWithFolder } from "@/lib/auth-context";
import {
  Share2,
  Check,
  X,
  User,
  Mail,
  Layers,
  FileQuestion,
  FolderTree,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder?: FolderNode | null;
  deck?: Deck | DeckWithFolder | null;
  itemType: "FOLDER" | "DECK";
  onSuccess?: () => void;
}

export function ShareItemModal({
  isOpen,
  onClose,
  folder,
  deck,
  itemType,
  onSuccess,
}: ShareItemModalProps) {
  const { user, sendShareRequest } = useAuth();

  const [targetUser, setTargetUser] = useState("");
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState<Array<{ name: string; username?: string; email: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      setTargetUser("");
      setFeedback(null);
      setIsSubmitting(false);

      // Load registered users for quick select
      try {
        const storedStr = localStorage.getItem("medlearn_users");
        if (storedStr) {
          const list = JSON.parse(storedStr);
          const filtered = list
            .filter((u: any) => u.id !== user?.id && (u.email || u.username))
            .slice(0, 4);
          setSuggestedUsers(filtered);
        }
      } catch (e) {}
    }
  }, [isOpen, user]);

  if (!isOpen) return null;
  if (itemType === "FOLDER" && !folder) return null;
  if (itemType === "DECK" && !deck) return null;

  const itemName = itemType === "FOLDER" ? folder?.name : deck?.title;
  const isMCQ = itemType === "DECK" && deck?.type === "MCQ";

  const handleSendShare = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTarget = targetUser.trim();
    if (!cleanTarget) {
      setFeedback({
        success: false,
        message: "Vui lòng nhập Email hoặc Tên đăng nhập người nhận!",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const itemToShare = itemType === "FOLDER" ? folder! : deck!;
      const res = await sendShareRequest(itemToShare, cleanTarget, itemType);

      setIsSubmitting(false);
      if (res.success) {
        setFeedback({
          success: true,
          message: `Đã gửi thành công lời mời chia sẻ "${itemName}" tới @${cleanTarget}!`,
        });
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        setFeedback({
          success: false,
          message: res.error || "Không thể gửi lời mời chia sẻ.",
        });
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setFeedback({
        success: false,
        message: "Đã xảy ra lỗi khi gửi chia sẻ, vui lòng thử lại.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">
                {itemType === "FOLDER" ? "Chia Sẻ Thư Mục Học Tập" : "Chia Sẻ Bộ Đề Y Khoa"}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Gửi tới bạn học, nhóm nội trú hoặc đồng nghiệp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Item Summary Card */}
        <div className="p-3.5 rounded-2xl border border-border bg-muted/30 flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold shadow-xs",
              itemType === "FOLDER"
                ? "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
                : isMCQ
                ? "bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400"
                : "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400"
            )}
          >
            {itemType === "FOLDER" ? (
              <FolderTree className="h-5 w-5" />
            ) : isMCQ ? (
              <FileQuestion className="h-5 w-5" />
            ) : (
              <Layers className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm text-foreground truncate">{itemName}</h4>
            <p className="text-[11px] text-muted-foreground truncate">
              {itemType === "FOLDER"
                ? `Thư mục bao gồm ${(folder?.decks || []).length} bộ đề`
                : `${deck?.specialty || "Y Khoa"} • ${deck?.itemCount || 0} câu / thẻ`}
            </p>
          </div>
        </div>

        {/* Share Form */}
        <form onSubmit={handleSendShare} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">
              Người nhận (Tên đăng nhập hoặc Email):
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
                placeholder="VD: bs_minhduc hoặc minhduc@med.edu.vn"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                autoFocus
              />
            </div>
          </div>

          {/* Quick suggestions */}
          {suggestedUsers.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Gợi ý nhanh thành viên:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedUsers.map((su, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTargetUser(su.username || su.email)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-sky-50 dark:hover:bg-sky-950/40 text-[11px] font-medium text-foreground hover:text-sky-600 transition-colors"
                  >
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span>{su.name}</span>
                    <span className="text-[9px] text-muted-foreground">(@{su.username || su.email})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Feedback message */}
          {feedback && (
            <div
              className={cn(
                "p-3 rounded-xl border text-xs flex items-center gap-2",
                feedback.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                  : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300"
              )}
            >
              {feedback.success ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !targetUser.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? "Đang gửi..." : "Gửi Lời Mời"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

