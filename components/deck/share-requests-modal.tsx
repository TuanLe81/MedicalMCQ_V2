"use client";

import React, { useState } from "react";
import { FolderShareRequest } from "@/types";
import { useAuth } from "@/lib/auth-context";
import {
  Inbox,
  Check,
  X,
  RefreshCw,
  Folder,
  Layers,
  FileQuestion,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccepted?: () => void;
}

export function ShareRequestsModal({
  isOpen,
  onClose,
  onAccepted,
}: ShareRequestsModalProps) {
  const {
    user,
    shareRequests,
    respondShareRequest,
    refreshShareRequests,
  } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; message: string; success: boolean } | null>(null);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshShareRequests();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleAction = async (requestId: string, accept: boolean) => {
    setProcessingId(requestId);
    setFeedback(null);
    try {
      const res = await respondShareRequest(requestId, accept);
      if (res.success) {
        setFeedback({
          id: requestId,
          message: accept
            ? "Đã chấp nhận và lưu tài liệu vào thư viện của bạn!"
            : "Đã từ chối lời mời chia sẻ.",
          success: true,
        });
        if (accept && onAccepted) {
          onAccepted();
        }
      } else {
        setFeedback({
          id: requestId,
          message: res.error || "Có lỗi xảy ra, vui lòng thử lại!",
          success: false,
        });
      }
    } catch (e: any) {
      setFeedback({
        id: requestId,
        message: e?.message || "Lỗi xử lý yêu cầu!",
        success: false,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const pendingRequests = (shareRequests || []).filter((r) => r.status === "PENDING");
  const processedRequests = (shareRequests || []).filter((r) => r.status !== "PENDING");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shadow-inner">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Hộp Thư Chia Sẻ Tài Liệu
                </h3>
                {pendingRequests.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold animate-pulse">
                    {pendingRequests.length} mới
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Tài liệu, thư mục và bộ đề được gửi từ các đồng nghiệp & bạn học Y khoa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              title="Làm mới danh sách lời mời"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin text-sky-600")} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
          {shareRequests.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground/50">
                <Inbox className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-foreground text-sm">Chưa có lời mời chia sẻ nào</p>
                <p className="text-[11px] max-w-sm mx-auto opacity-80 leading-relaxed">
                  Khi đồng nghiệp hoặc bạn cùng lớp chia sẻ bộ đề MCQ, Flashcard hoặc thư mục môn học, thông báo sẽ hiển thị trực tiếp tại đây theo thời gian thực.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* PENDING REQUESTS FIRST */}
              {pendingRequests.map((req) => {
                const isDeckReq = req.itemType === "DECK";
                const isMCQ = isDeckReq && req.deckData?.type === "MCQ";
                const isProcessing = processingId === req.id;
                const feedbackItem = feedback?.id === req.id ? feedback : null;

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/40 to-sky-50/30 dark:from-indigo-950/20 dark:to-sky-950/20 space-y-3 text-xs shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-xs",
                            isDeckReq
                              ? isMCQ
                                ? "bg-sky-100 dark:bg-sky-950 text-sky-600"
                                : "bg-purple-100 dark:bg-purple-950 text-purple-600"
                              : "bg-emerald-100 dark:bg-emerald-950 text-emerald-600"
                          )}
                        >
                          {isDeckReq ? (
                            isMCQ ? <FileQuestion className="h-5 w-5" /> : <Layers className="h-5 w-5" />
                          ) : (
                            <Folder className="h-5 w-5" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm text-foreground">
                              {req.deckTitle || req.folderName}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                              {isDeckReq ? `Bộ đề ${req.deckData?.type || "MCQ"}` : "Thư mục đầy đủ"}
                            </span>
                            {req.deckData && (
                              <span className="text-[10px] font-medium text-muted-foreground">
                                • {req.deckData.questions?.length || req.deckData.flashcards?.length || req.deckData.itemCount || 0} mục
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Người gửi: <strong className="text-foreground">{req.ownerName}</strong>
                            {req.ownerEmail ? ` (${req.ownerEmail})` : ""} • {req.ownerSchool || "Trường Y"}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>Gửi ngày: {req.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        Chờ Duyệt
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleAction(req.id, false)}
                        className="px-3.5 py-1.5 rounded-xl border border-border text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                      >
                        Từ Chối
                      </button>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleAction(req.id, true)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Chấp Nhận &amp; Thêm Vào Thư Viện</span>
                      </button>
                    </div>

                    {feedbackItem && (
                      <p
                        className={cn(
                          "text-[11px] font-semibold pt-1",
                          feedbackItem.success ? "text-emerald-600" : "text-rose-600"
                        )}
                      >
                        {feedbackItem.message}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* ALREADY PROCESSED (ACCEPTED/REJECTED) */}
              {processedRequests.length > 0 && (
                <div className="pt-2 space-y-2">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                    Lịch sử lời mời trước đây
                  </div>
                  {processedRequests.map((req) => {
                    const isAccepted = req.status === "ACCEPTED";
                    return (
                      <div
                        key={req.id}
                        className="p-3 rounded-2xl border border-border/80 bg-background/50 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-foreground">
                            {req.deckTitle || req.folderName}
                          </span>
                          <p className="text-[10px] text-muted-foreground">
                            Từ {req.ownerName} • {req.createdAt}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                            isAccepted
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {isAccepted ? "Đã nhận" : "Đã từ chối"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
          <span className="text-[11px] text-muted-foreground">
            Tự động cập nhật mỗi 15 giây
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 font-bold text-xs text-foreground transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareRequestsModal;
