"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Lock,
  Stethoscope,
  LogIn,
  UserPlus,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  BrainCircuit,
} from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  featureTitle?: string;
  featureDescription?: string;
}

export function AuthGuard({
  children,
  featureTitle = "Tính Năng Học Tập Y Khoa",
  featureDescription = "Bạn cần tạo tài khoản hoặc đăng nhập để truy cập ngân hàng câu hỏi, cây thư mục và lưu trữ kết quả phân tích thang đo tư duy Bloom.",
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 animate-pulse">
          <Stethoscope className="h-6 w-6 animate-spin" />
        </div>
        <p className="text-xs text-muted-foreground font-semibold">
          Đang kiểm tra phiên đăng nhập...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-sky-500/5 via-background to-background">
        <div className="w-full max-w-lg p-8 sm:p-10 rounded-3xl border border-border bg-card shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
          {/* Lock Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-xl shadow-sky-500/25">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs font-bold">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>YÊU CẦU XÁC THỰC TÀI KHOẢN</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {featureTitle}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              {featureDescription}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all hover:scale-[1.02]"
            >
              <LogIn className="h-4 w-4" />
              <span>Đăng Nhập Ngay</span>
            </Link>

            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-border bg-card hover:bg-muted font-bold text-xs sm:text-sm text-foreground transition-all"
            >
              <UserPlus className="h-4 w-4 text-sky-600" />
              <span>Tạo Tài Khoản Mới</span>
            </Link>
          </div>

          <div className="border-t border-border/70 pt-4 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Đăng ký chỉ mất 30 giây để cá nhân hóa toàn bộ lộ trình học Y</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

