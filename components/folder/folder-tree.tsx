"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FolderNode, Deck, FolderShareRequest } from "@/types";
import { useAuth } from "@/lib/auth-context";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  Layers,
  FileQuestion,
  Sparkles,
  Search,
  BookOpen,
  Stethoscope,
  Trash2,
  Share2,
  Lock,
  ShieldAlert,
  Bell,
  Check,
  X,
  UserCheck,
  FolderPlus,
  Send,
  AlertCircle,
  CheckCircle2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderTreeProps {
  initialFolders: FolderNode[];
}

export function FolderTree({ initialFolders }: FolderTreeProps) {
  const {
    user,
    getUserFolders,
    saveUserFolders,
    shareRequests,
    sendShareRequest,
    respondShareRequest,
  } = useAuth();

  const [folders, setFolders] = useState<FolderNode[]>(initialFolders);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    folder_y4_noi: true,
    folder_cardio: true,
    folder_pharm: true,
    folder_pharm_cardio: true,
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDesc, setNewFolderDesc] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  // Sharing Modal States
  const [sharingFolder, setSharingFolder] = useState<FolderNode | null>(null);
  const [targetUser, setTargetUser] = useState("");
  const [shareFeedback, setShareFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Inbox Modal State
  const [showInboxModal, setShowInboxModal] = useState(false);

  // Demo Restriction Alert Modal State
  const [showDemoLockAlert, setShowDemoLockAlert] = useState(false);

  const isDemoUser = user?.isDemo === true;

  // Filter incoming pending requests for this user
  const incomingPendingRequests = shareRequests.filter((r) => {
    if (!user) return false;
    const target = r.targetUsernameOrEmail.toLowerCase();
    const isTarget =
      target === user.username?.toLowerCase() || target === user.email?.toLowerCase();
    return isTarget && r.status === "PENDING";
  });

  const toggleExpand = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleOpenCreateModal = (parentId: string | null = null) => {
    if (isDemoUser) {
      setShowDemoLockAlert(true);
      return;
    }
    setSelectedParentId(parentId);
    setShowNewFolderModal(true);
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    if (isDemoUser) {
      setShowDemoLockAlert(true);
      return;
    }

    const newFolder: FolderNode = {
      id: `folder_${Date.now()}`,
      name: newFolderName,
      description: newFolderDesc || "Thư mục học tập y khoa",
      color: "#0284c7",
      parentId: selectedParentId,
      children: [],
      decks: [],
      createdAt: new Date().toLocaleDateString("vi-VN"),
    };

    let updatedFolders: FolderNode[];

    if (!selectedParentId) {
      updatedFolders = [...folders, newFolder];
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

  const handleDeleteFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDemoUser) {
      setShowDemoLockAlert(true);
      return;
    }

    if (confirm("Bạn có chắc chắn muốn xóa thư mục này?")) {
      const filterOut = (list: FolderNode[]): FolderNode[] => {
        return list
          .filter((f) => f.id !== folderId)
          .map((f) => ({
            ...f,
            children: f.children ? filterOut(f.children) : [],
          }));
      };
      const updated = filterOut(folders);
      setFolders(updated);
      saveUserFolders(updated);
    }
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

  const renderDeckCard = (deck: Deck) => {
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

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-muted-foreground mr-1">
            {deck.itemCount} {isMCQ ? "câu hỏi" : "thẻ"}
          </span>
          <Link
            href={isMCQ ? `/quiz/${deck.id}` : `/flashcards/${deck.id}`}
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs",
              isMCQ
                ? "bg-sky-600 hover:bg-sky-700 shadow-sky-600/20"
                : "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20"
            )}
          >
            <span>{isMCQ ? "Luyện Đề" : "Lật Thẻ"}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
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

            {isExpanded ? (
              <FolderOpen className={cn("h-5 w-5", folder.isShared ? "text-indigo-600" : "text-sky-600 dark:text-sky-400")} />
            ) : (
              <Folder className={cn("h-5 w-5", folder.isShared ? "text-indigo-600" : "text-sky-600 dark:text-sky-400")} />
            )}

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold leading-tight">{folder.name}</span>
                {folder.isShared && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                    <Users className="h-3 w-3" />
                    <span>Được chia sẻ bởi {folder.sharedBy}</span>
                  </span>
                )}
                {isDemoUser && folder.isSystemMock && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono">
                    Mẫu
                  </span>
                )}
              </div>
              {folder.description && (
                <span className="text-[11px] text-muted-foreground font-normal">
                  {folder.description}
                </span>
              )}
            </div>
          </div>

          {/* Actions on folder */}
          <div className="flex items-center gap-1.5">
            {/* Share Folder Button */}
            {!folder.isShared && (
              <button
                type="button"
                onClick={(e) => handleOpenShareModal(folder, e)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-indigo-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Chia sẻ thư mục này cho bạn bè / nhóm học tập"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span className="text-[11px] hidden sm:inline">Chia sẻ</span>
              </button>
            )}

            {/* Add Subfolder */}
            <button
              type="button"
              onClick={() => handleOpenCreateModal(folder.id)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-sky-600 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Thêm thư mục con"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="text-[11px] hidden sm:inline">Thư mục con</span>
            </button>

            {/* Delete Folder */}
            {!isDemoUser && (
              <button
                type="button"
                onClick={(e) => handleDeleteFolder(folder.id, e)}
                className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-muted-foreground hover:text-rose-600 text-xs transition-colors"
                title="Xóa thư mục"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Expanded Content (Subfolders & Decks) */}
        {isExpanded && (
          <div className="space-y-2 pt-1 pl-2">
            {/* Render Subfolders */}
            {folder.children?.map((sub) => renderFolder(sub, level + 1))}

            {/* Render Decks inside this folder */}
            {folder.decks && folder.decks.length > 0 && (
              <div
                className="space-y-2 pt-1"
                style={{ marginLeft: `${(level + 1) * 18}px` }}
              >
                {folder.decks.map(renderDeckCard)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Demo Account Alert Notice Banner */}
      {isDemoUser && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Lock className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold uppercase tracking-wider block">
                Chế Độ Dùng Thử: Tài Khoản Mẫu (Chỉ Xem &amp; Luyện Tập)
              </span>
              <span className="text-[11px] opacity-90">
                Để bảo vệ dữ liệu dùng thử chung, bạn không thể thêm, xóa hoặc chỉnh sửa thư mục mẫu. Hãy đăng ký tài khoản riêng để tự do tạo và chia sẻ cây thư mục cá nhân.
              </span>
            </div>
          </div>
          <Link
            href="/register"
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold whitespace-nowrap text-center shadow-xs transition-all"
          >
            Tạo Tài Khoản Riêng
          </Link>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm thư mục, bộ đề..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border bg-card text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Inbox Button (Share Invitations) */}
          <button
            type="button"
            onClick={() => setShowInboxModal(true)}
            className={cn(
              "relative inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border font-bold text-xs sm:text-sm transition-all",
              incomingPendingRequests.length > 0
                ? "border-indigo-300 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 animate-pulse"
                : "border-border bg-card text-foreground hover:bg-muted"
            )}
          >
            <Bell className="h-4 w-4 text-indigo-600" />
            <span>Lời Mời Chia Sẻ</span>
            {incomingPendingRequests.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white text-[10px] font-black">
                {incomingPendingRequests.length}
              </span>
            )}
          </button>

          {/* New Root Folder */}
          <button
            type="button"
            onClick={() => handleOpenCreateModal(null)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Thư Mục Lớn Mới</span>
          </button>

          <Link
            href="/create"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-border bg-card hover:bg-muted font-bold text-xs sm:text-sm text-foreground transition-all"
          >
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span>Soạn Bộ Đề</span>
          </Link>
        </div>
      </div>

      {/* Hierarchical Folder Explorer Tree / Empty State */}
      {folders.length === 0 ? (
        <div className="p-10 sm:p-16 rounded-3xl border-2 border-dashed border-border bg-card/40 text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 dark:bg-sky-950 text-sky-600 shadow-inner">
            <FolderPlus className="h-8 w-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              Cây Thư Mục Của Bạn Đang Trống
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Bạn vừa tạo tài khoản mới. Hãy bấm <strong>&ldquo;Thư Mục Lớn Mới&rdquo;</strong> để tạo môn học đầu tiên (Nội, Ngoại, Dược lý...) hoặc dùng <strong>&ldquo;🤖 AI Sinh Đề&rdquo;</strong> để nạp dữ liệu!
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleOpenCreateModal(null)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Tạo Thư Mục Đầu Tiên</span>
            </button>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-border bg-card hover:bg-muted font-bold text-xs text-foreground transition-all"
            >
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Dùng AI Tạo Đề Mới</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3 p-4 sm:p-6 rounded-3xl border border-border bg-card/60 backdrop-blur-sm">
          {folders.map((f) => renderFolder(f, 0))}
        </div>
      )}

      {/* MODAL 1: Create Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl space-y-4 animate-in zoom-in-95">
            <h3 className="font-bold text-lg text-foreground">
              {selectedParentId ? "Tạo Thư Mục Con" : "Tạo Thư Mục Lớn Mới"}
            </h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Tên Thư Mục *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Ngoại Khoa Lồng Ngực, Dược Lý..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Mô Tả Ngắn
                </label>
                <input
                  type="text"
                  placeholder="VD: Ngân hàng câu hỏi trắc nghiệm & case lâm sàng"
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm"
                >
                  Lưu Thư Mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Share Folder Modal */}
      {sharingFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-base">
              <Share2 className="h-5 w-5" />
              <span>Chia Sẻ Thư Mục Học Tập</span>
            </div>

            <div className="p-3 rounded-2xl bg-muted/40 border border-border/70 text-xs space-y-1">
              <span className="text-muted-foreground">Thư mục được chia sẻ:</span>
              <div className="font-bold text-foreground text-sm flex items-center gap-2">
                <Folder className="h-4 w-4 text-sky-600" />
                <span>{sharingFolder.name}</span>
              </div>
            </div>

            {shareFeedback && (
              <div
                className={cn(
                  "p-3 rounded-xl text-xs font-semibold flex items-center gap-2",
                  shareFeedback.success
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-200"
                )}
              >
                {shareFeedback.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{shareFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSendShare} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Tên Đăng Nhập (Username) hoặc Email người nhận *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: hoangmai hoặc user@med.edu.vn"
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-indigo-500/50 outline-none"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Người nhận sẽ nhận được thông báo và chỉ thấy thư mục sau khi bấm <strong>Chấp Nhận</strong>.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSharingFolder(null)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Gửi Lời Mời</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Share Requests Inbox (Lời mời chia sẻ cần chấp nhận) */}
      {showInboxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2 text-foreground font-bold text-base">
                <Bell className="h-5 w-5 text-indigo-600" />
                <span>Hộp Thư Lời Mời Chia Sẻ Thư Mục</span>
              </div>
              <button
                type="button"
                onClick={() => setShowInboxModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[350px] overflow-y-auto space-y-3">
              {incomingPendingRequests.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
                  <UserCheck className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p>Hiện không có lời mời chia sẻ thư mục nào đang chờ xử lý.</p>
                </div>
              ) : (
                incomingPendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30 space-y-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-extrabold text-foreground text-sm">
                          {req.ownerName}
                        </span>
                        <span className="text-[11px] text-muted-foreground block">
                          {req.ownerSchool || "Bác sĩ / Sinh viên Y"} • {req.createdAt}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                        Đang chờ duyệt
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-card border border-border/80 flex items-center gap-2 font-bold text-foreground">
                      <Folder className="h-4 w-4 text-indigo-600 shrink-0" />
                      <span>{req.folderName}</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleRejectRequest(req.id)}
                        className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-rose-600 font-semibold"
                      >
                        Từ Chối
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAcceptRequest(req.id)}
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs inline-flex items-center gap-1"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Chấp Nhận &amp; Thêm Vào Cây Thư Mục</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => setShowInboxModal(false)}
                className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Demo Lock Restriction Modal */}
      {showDemoLockAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-black text-lg text-foreground">
                Tài Khoản Mẫu Đang Bị Khóa Chỉnh Sửa
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tài khoản dùng thử mẫu chỉ được cấp quyền <strong>Chỉ Xem &amp; Luyện Tập</strong> để tránh việc người dùng khác bị mất dữ liệu đề thi mẫu.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground text-left space-y-1">
              <span>👉 Để tạo cây thư mục riêng, thêm câu hỏi và chia sẻ với bạn bè:</span>
              <strong className="text-foreground block">Hãy đăng ký tài khoản cá nhân miễn phí!</strong>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDemoLockAlert(false)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold"
              >
                Đã Hiểu
              </button>
              <Link
                href="/register"
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs"
              >
                Tạo Tài Khoản Ngay
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
