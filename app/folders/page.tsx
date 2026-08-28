"use client";

import React from "react";
import { MOCK_FOLDERS } from "@/lib/mock-data";
import { FolderTree } from "@/components/folder/folder-tree";
import { FolderTree as FolderIcon, Sparkles } from "lucide-react";

export default function FoldersPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      {/* Header */}
      <div className="space-y-1.5 border-b border-border/60 pb-5">
        <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold text-xs">
          <FolderIcon className="h-4 w-4" />
          <span>HỆ THỐNG QUẢN LÝ TÀI LIỆU Y KHOA ĐA CẤP</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground">
          Cây Thư Mục & Ngân Hàng Bộ Đề
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Tổ chức các thư mục lớn (Nội khoa, Dược lý, Giải phẫu) và các module con chứa bộ câu hỏi MCQ, Flashcard hoặc kết hợp cả hai.
        </p>
      </div>

      {/* Main Folder Tree Component */}
      <FolderTree initialFolders={MOCK_FOLDERS} />
    </div>
  );
}

