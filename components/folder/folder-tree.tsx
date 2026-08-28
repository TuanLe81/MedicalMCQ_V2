"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FolderNode, Deck } from "@/types";
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
  MoreVertical,
  BookOpen,
  Stethoscope,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderTreeProps {
  initialFolders: FolderNode[];
}

export function FolderTree({ initialFolders }: FolderTreeProps) {
  const [folders, setFolders] = useState<FolderNode[]>(initialFolders);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    folder_y4_noi: true,
    folder_cardio: true,
    folder_pharm: true,
    folder_pharm_cardio: true,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDesc, setNewFolderDesc] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const toggleExpand = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: FolderNode = {
      id: `folder_${Date.now()}`,
      name: newFolderName,
      description: newFolderDesc || "Thư mục học tập y khoa",
      color: "#0284c7",
      parentId: selectedParentId,
      children: [],
      decks: [],
    };

    if (!selectedParentId) {
      // Add as root folder
      setFolders((prev) => [...prev, newFolder]);
    } else {
      // Add as subfolder recursively
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
      setFolders((prev) => addSubfolder(prev));
      setExpandedFolders((prev) => ({ ...prev, [selectedParentId]: true }));
    }

    setNewFolderName("");
    setNewFolderDesc("");
    setShowNewFolderModal(false);
    setSelectedParentId(null);
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
    const hasChildren = (folder.children && folder.children.length > 0) || (folder.decks && folder.decks.length > 0);

    return (
      <div key={folder.id} className="space-y-2">
        {/* Folder Bar */}
        <div
          className={cn(
            "flex items-center justify-between p-3 rounded-2xl border transition-all select-none",
            level === 0
              ? "bg-muted/40 border-border font-bold text-foreground hover:bg-muted/70"
              : "bg-card border-border/80 text-foreground hover:border-sky-300 dark:hover:border-sky-700"
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
              <FolderOpen className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            ) : (
              <Folder className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            )}

            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight">{folder.name}</span>
              {folder.description && (
                <span className="text-[11px] text-muted-foreground font-normal">
                  {folder.description}
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions on folder */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setSelectedParentId(folder.id);
                setShowNewFolderModal(true);
              }}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-sky-600 text-xs font-semibold flex items-center gap-1"
              title="Thêm thư mục con"
            >
              <Plus className="h-4 w-4" />
              <span className="text-[11px] hidden sm:inline">Thư mục con</span>
            </button>
            <Link
              href="/create"
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-purple-600 text-xs font-semibold flex items-center gap-1"
              title="Tạo bộ đề trong thư mục này"
            >
              <Plus className="h-4 w-4" />
              <span className="text-[11px] hidden sm:inline">Tạo đề</span>
            </Link>
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
      {/* Top Action Bar: Search & New Root Folder */}
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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setSelectedParentId(null);
              setShowNewFolderModal(true);
            }}
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

      {/* Hierarchical Folder Explorer Tree */}
      <div className="space-y-3 p-4 sm:p-6 rounded-3xl border border-border bg-card/60 backdrop-blur-sm">
        {folders.map((f) => renderFolder(f, 0))}
      </div>

      {/* Create Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl space-y-4 animate-in zoom-in-95">
            <h3 className="font-bold text-lg text-foreground">
              {selectedParentId ? "Tạo Thư Mục Con" : "Tạo Thư Mục Lớn Mới"}
            </h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Tên Thư Mục
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Ngoại Khoa Lồng Ngực..."
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
    </div>
  );
}

