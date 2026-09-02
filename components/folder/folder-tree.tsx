"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FolderNode, Deck, FolderShareRequest } from "@/types";
import { useAuth } from "@/lib/auth-context";
import {
  Folder,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  Layers,
  FileQuestion,
  Plus,
  Share2,
  Trash2,
  Lock,
  Sparkles,
  BookOpen,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  AlertCircle,
  Inbox,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderTreeProps {
  initialFolders?: FolderNode[];
}

export function FolderTree({ initialFolders }: FolderTreeProps) {
  const {
    user,
    getUserFolders,
    saveUserFolders,
    deleteUserDeck,
    shareRequests,
    sendShareRequest,
    respondShareRequest,
  } = useAuth();

  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<{ [id: string]: boolean }>({});
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  // Form states
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDesc, setNewFolderDesc] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#0284c7");

  // Share states
  const [sharingFolder, setSharingFolder] = useState<FolderNode | null>(null);
  const [targetUser, setTargetUser] = useState("");
  const [shareFeedback, setShareFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [showShareRequestsInbox, setShowShareRequestsInbox] = useState(false);

  // Delete states
  const [showDemoLockAlert, setShowDemoLockAlert] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<{ deck: Deck; folderName?: string } | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<FolderNode | null>(null);

  const isDemoUser = user?.isDemo ?? false;

  // Load active user folders
  useEffect(() => {
    const userFolders = getUserFolders();
    setFolders(userFolders);
    // Expand root folders by default
    const initExpanded: { [id: string]: boolean } = {};
    userFolders.forEach((f) => {
      initExpanded[f.id] = true;
    });
    setExpandedFolders(initExpanded);
  }, [user]);

  const toggleExpand = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    if (isDemoUser) {
      setShowDemoLockAlert(true);
      setShowNewFolderModal(false);
      return;
    }

    const newFolder: FolderNode = {
      id: `folder_${Date.now()}`,
      name: newFolderName.trim(),
      description: newFolderDesc.trim() || undefined,
      color: newFolderColor,
      icon: "Folder",
      parentId: selectedParentId,
      children: [],
      decks: [],
      createdAt: new Date().toLocaleDateString("vi-VN"),
      isSystemMock: false,
    };

    let updatedFolders: FolderNode[] = [];

    if (!selectedParentId) {
      updatedFolders = [newFolder, ...folders];
    } else {
      const addSubfolder = (list: FolderNode[]): FolderNode[] => {
        return list.map((f) => {
          if (f.id === selectedParentId) {
            return {
              ...f,
              children: [...(f.children || []), newFolder],
            };
          }
          if (f.children && f.children.length > 0) {
            return {
              ...f,
              children: addSubfolder(f.children),
            };
          }
          return f;
        });
      };
      updatedFolders = addSubfolder(folders);
      setExpandedFolders((prev) => ({ ...prev, [selectedParentId]: true }));
    }

    setFolders(updatedFolders);
    saveUserFolders(updatedFolders);

    setNewFolderName("");
    setNewFolderDesc("");
    setShowNewFolderModal(false);
    setSelectedParentId(null);
  };

  const confirmDeleteFolder = () => {
    if (!folderToDelete) return;
    if (isDemoUser) {
      setShowDemoLockAlert(true);
      setFolderToDelete(null);
      return;
    }

    const filterOut = (list: FolderNode[]): FolderNode[] => {
      return list
        .filter((f) => f.id !== folderToDelete.id)
        .map((f) => ({
          ...f,
          children: f.children ? filterOut(f.children) : [],
        }));
    };
    const updated = filterOut(folders);
    setFolders(updated);
    saveUserFolders(updated);
    setFolderToDelete(null);
  };

  // DELETE INDIVIDUAL DECK (MCQ / Flashcard)
  const confirmDeleteDeck = () => {
    if (!deckToDelete) return;
    if (isDemoUser) {
      setShowDemoLockAlert(true);
      setDeckToDelete(null);
      return;
    }

    deleteUserDeck(deckToDelete.deck.id);
    setFolders(getUserFolders());
    setDeckToDelete(null);
  };

  const handleOpenShareModal = (folder: FolderNode, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDemoUser) {
      setShowDemoLockAlert(true);
      return;
    }
    setSharingFolder(folder);
    setTargetUser("");
    setShareFeedback(null);
  };

  const handleSendShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharingFolder || !targetUser.trim()) return;

    const res = sendShareRequest(sharingFolder, targetUser.trim());
    if (res.success) {
      setShareFeedback({
        success: true,
        message: `Đã gửi lời mời chia sẻ thư mục "${sharingFolder.name}" tới @${targetUser}. Người nhận cần chấp nhận để xem thư mục!`,
      });
      setTimeout(() => {
        setSharingFolder(null);
        setShareFeedback(null);
      }, 2500);
    } else {
      setShareFeedback({
        success: false,
        message: res.error || "Không thể gửi lời mời chia sẻ.",
      });
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    respondShareRequest(requestId, true);
    setTimeout(() => {
      setFolders(getUserFolders());
    }, 200);
  };

  const handleRejectRequest = (requestId: string) => {
    respondShareRequest(requestId, false);
  };

  const renderDeckCard = (deck: Deck, folderName?: string) => {
    const isMCQ = deck.type === "MCQ";
    return (
      <div
        key={deck.id}
        className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-card hover:border-sky-300 dark:hover:border-sky-700 shadow-xs hover:shadow-md transition-all"
      >
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-xs",
              isMCQ
                ? "bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400"
                : "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400"
            )}
          >
            {isMCQ ? <FileQuestion className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-sm text-foreground group-hover:text-sky-600 transition-colors">
                {deck.title}
              </h4>
              <span
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                  isMCQ
                    ? "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
                    : "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                )}
              >
                {deck.type}
              </span>
              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                {deck.specialty}
              </span>
            </div>
            {deck.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {deck.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons: Study & Delete */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-muted-foreground mr-1">
            {deck.itemCount} {isMCQ ? "câu hỏi" : "thẻ"}
          </span>

          <Link
            href={isMCQ ? `/quiz/${deck.id}` : `/flashcards/${deck.id}`}
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs hover:scale-105",
              isMCQ
                ? "bg-sky-600 hover:bg-sky-700 shadow-sky-600/20"
                : "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20"
            )}
          >
            <span>{isMCQ ? "Luyện Đề" : "Lật Thẻ"}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>

          {/* Delete Deck Button */}
          <button
            type="button"
            onClick={() => setDeckToDelete({ deck, folderName })}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
            title="Xóa bộ câu hỏi / thẻ này"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderFolder = (folder: FolderNode, level: number = 0) => {
    const isExpanded = !!expandedFolders[folder.id];
    const hasChildren =
      (folder.children && folder.children.length > 0) ||
      (folder.decks && folder.decks.length > 0);

    return (
      <div key={folder.id} className="space-y-2">
        {/* Folder Bar */}
        <div
          className={cn(
            "flex items-center justify-between p-3 rounded-2xl border transition-all select-none",
            level === 0
              ? "bg-muted/40 border-border font-bold text-foreground hover:bg-muted/70"
              : "bg-card border-border/80 text-foreground hover:border-sky-300 dark:hover:border-sky-700",
            folder.isShared && "border-indigo-300 dark:border-indigo-800 bg-indigo-50/20 dark:bg-indigo-950/20"
          )}
          style={{ marginLeft: `${level * 18}px` }}
        >
          <div
            className="flex items-center gap-2.5 flex-1 cursor-pointer"
            onClick={() => toggleExpand(folder.id)}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )
            ) : (
              <span className="w-4" />
            )}

            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-xs"
              style={{ backgroundColor: folder.color || "#0284c7" }}
            >
              <Folder className="h-4 w-4" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold">{folder.name}</span>
                {folder.isShared && (
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.2 rounded-full font-semibold">
                    🔗 Được chia sẻ bởi {folder.sharedBy}
                  </span>
                )}
                {folder.isSystemMock && (
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.2 rounded-full font-semibold">
                    🔒 Thư mục mẫu (Chỉ xem)
                  </span>
                )}
              </div>
              {folder.description && (
                <p className="text-[11px] text-muted-foreground line-clamp-1 font-normal">
                  {folder.description}
                </p>
              )}
            </div>
          </div>

          {/* Folder Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedParentId(folder.id);
                setShowNewFolderModal(true);
              }}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Thêm thư mục con"
            >
              <Plus className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={(e) => handleOpenShareModal(folder, e)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-indigo-600 transition-colors"
              title="Chia sẻ thư mục"
            >
              <Share2 className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFolderToDelete(folder);
              }}
              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-muted-foreground hover:text-rose-600 transition-colors"
              title="Xóa thư mục"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Expanded Folder Content (Subfolders & Decks) */}
        {isExpanded && (
          <div className="space-y-2 pt-1" style={{ marginLeft: `${level * 18 + 14}px` }}>
            {/* Render Decks inside this folder */}
            {folder.decks && folder.decks.length > 0 && (
              <div className="space-y-2">
                {folder.decks.map((deck) => renderDeckCard(deck, folder.name))}
              </div>
            )}

            {/* Render Subfolders */}
            {folder.children && folder.children.length > 0 && (
              <div className="space-y-2">
                {folder.children.map((child) => renderFolder(child, level + 1))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const pendingRequests = shareRequests.filter((r) => r.status === "PENDING");

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl border border-border bg-card shadow-xs">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-sky-600" />
            <span>Cây Thư Mục Học Tập Cá Nhân</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Tổ chức các module Nội, Ngoại, Sản, Nhi và các chuyên khoa đa cấp linh hoạt
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Share Inbox Button */}
          <button
            type="button"
            onClick={() => setShowShareRequestsInbox(true)}
            className="relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-border bg-background hover:bg-muted font-bold text-xs text-foreground transition-all shadow-xs"
          >
            <Inbox className="h-4 w-4 text-indigo-600" />
            <span>Lời Mời Chia Sẻ</span>
            {pendingRequests.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </button>

          {/* New Root Folder Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedParentId(null);
              setShowNewFolderModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all hover:scale-105"
          >
            <FolderPlus className="h-4 w-4" />
            <span>Tạo Thư Mục Mới</span>
          </button>
        </div>
      </div>

      {/* EMPTY STATE FOR NEW USERS */}
      {folders.length === 0 ? (
        <div className="p-10 sm:p-14 rounded-3xl border-2 border-dashed border-border bg-card/40 text-center space-y-6 animate-in fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 dark:bg-sky-950 text-sky-600 shadow-inner">
            <Folder className="h-8 w-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-foreground">
              Cây Thư Mục Của Bạn Đang Trống
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Bạn chưa có thư mục học tập nào. Hãy tạo thư mục đầu tiên để tổ chức các bài trắc nghiệm MCQ và Flashcard theo từng chuyên khoa!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedParentId(null);
                setShowNewFolderModal(true);
              }}
              className="px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all"
            >
              Tạo Thư Mục Đầu Tiên
            </button>
            <Link
              href="/create"
              className="px-5 py-2.5 rounded-2xl border border-border bg-card hover:bg-muted font-bold text-xs text-foreground transition-all"
            >
              🤖 Dùng AI Tạo Đề Mới
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {folders.map((folder) => renderFolder(folder, 0))}
        </div>
      )}

      {/* CONFIRM DELETE DECK MODAL */}
      {deckToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">Xác Nhận Xóa Bộ Đề</h3>
                <p className="text-xs text-muted-foreground">Thao tác này sẽ xóa vĩnh viễn bộ câu hỏi</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1.5 text-xs">
              <div className="font-bold text-foreground text-sm">{deckToDelete.deck.title}</div>
              <div className="text-muted-foreground">
                Loại: <strong>{deckToDelete.deck.type}</strong> • Chuyên khoa: <strong>{deckToDelete.deck.specialty}</strong> • Số lượng: <strong>{deckToDelete.deck.itemCount} câu/thẻ</strong>
              </div>
              {deckToDelete.folderName && (
                <div className="text-[11px] text-sky-600 font-semibold">📁 Nằm trong: {deckToDelete.folderName}</div>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Bạn có chắc chắn muốn xóa bộ đề này khỏi Cây Thư Mục không? Toàn bộ câu hỏi và thẻ trong bộ đề này sẽ bị gỡ bỏ.
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
                Xóa Bộ Đề
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE FOLDER MODAL */}
      {folderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">Xác Nhận Xóa Thư Mục</h3>
                <p className="text-xs text-muted-foreground">Xóa thư mục và toàn bộ nội dung con</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border text-xs space-y-1">
              <div className="font-bold text-foreground text-sm">📁 {folderToDelete.name}</div>
              {folderToDelete.description && <div className="text-muted-foreground">{folderToDelete.description}</div>}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Bạn có chắc chắn muốn xóa thư mục này? Toàn bộ thư mục con và các bộ đề bên trong sẽ bị xóa.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setFolderToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={confirmDeleteFolder}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all hover:scale-105"
              >
                Xóa Thư Mục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE FOLDER MODAL */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-bold text-base text-foreground">
                {selectedParentId ? "Tạo Thư Mục Con" : "Tạo Thư Mục Gốc Mới"}
              </h3>
              <button
                type="button"
                onClick={() => setShowNewFolderModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase text-muted-foreground">
                  Tên Thư Mục *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Module Tim Mạch, Dược Lý Y4..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-border bg-background text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase text-muted-foreground">
                  Mô Tả (Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả mục tiêu học tập của thư mục này..."
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase text-muted-foreground">
                  Màu Sắc Biểu Tượng
                </label>
                <div className="flex items-center gap-2">
                  {["#0284c7", "#f43f5e", "#8b5cf6", "#10b981", "#f59e0b", "#06b6d4"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewFolderColor(color)}
                      className={cn(
                        "h-7 w-7 rounded-xl transition-all",
                        newFolderColor === color ? "ring-2 ring-foreground ring-offset-2 scale-110" : "opacity-80"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all hover:scale-105"
                >
                  Tạo Thư Mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHARE FOLDER MODAL */}
      {sharingFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-base text-foreground">
                  Chia Sẻ Thư Mục Học Tập
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSharingFolder(null)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
              <div className="font-bold">📁 {sharingFolder.name}</div>
              <p className="text-[11px] opacity-80">
                Người nhận sẽ nhận được thông báo lời mời và cần bấm <strong>&ldquo;Chấp nhận&rdquo;</strong> để thêm thư mục này vào Cây Thư Mục của họ.
              </p>
            </div>

            <form onSubmit={handleSendShare} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase text-muted-foreground">
                  Email hoặc Tên Đăng Nhập Người Nhận *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: mai.nguyen@med.edu.vn hoặc hoangmai"
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-border bg-background text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-indigo-500/50 outline-none"
                />
              </div>

              {shareFeedback && (
                <div
                  className={cn(
                    "p-3 rounded-xl text-xs font-semibold flex items-center gap-2",
                    shareFeedback.success
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  )}
                >
                  {shareFeedback.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                  <span>{shareFeedback.message}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setSharingFolder(null)}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-105 flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Gửi Lời Mời</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHARE REQUESTS INBOX MODAL */}
      {showShareRequestsInbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Inbox className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-base text-foreground">
                  Hộp Thư Lời Mời Chia Sẻ Thư Mục
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShareRequestsInbox(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            {shareRequests.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
                <Inbox className="h-8 w-8 mx-auto opacity-40" />
                <p>Bạn chưa có lời mời chia sẻ thư mục nào.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {shareRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl border border-border bg-background/60 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-foreground text-sm">📁 {req.folderName}</div>
                        <div className="text-[11px] text-muted-foreground">
                          Từ: <strong>{req.ownerName}</strong> ({req.ownerSchool || "Trường Y"}) • {req.createdAt}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          req.status === "PENDING"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : req.status === "ACCEPTED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        )}
                      >
                        {req.status === "PENDING" ? "Chờ duyệt" : req.status === "ACCEPTED" ? "Đã chấp nhận" : "Đã từ chối"}
                      </span>
                    </div>

                    {req.status === "PENDING" && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                        <button
                          type="button"
                          onClick={() => handleRejectRequest(req.id)}
                          className="px-3 py-1.5 rounded-xl border border-border text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          Từ Chối
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(req.id)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-xs"
                        >
                          ✓ Chấp Nhận &amp; Thêm Vào Cây Thư Mục
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DEMO LOCKED ALERT MODAL */}
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
                Tài khoản mẫu dùng thử đang ở chế độ <strong>&ldquo;Chỉ Xem&rdquo;</strong>. Hệ thống không cho phép sửa hoặc xóa dữ liệu mẫu chung.
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
                Tạo Tài Khoản Riêng Ngay
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
