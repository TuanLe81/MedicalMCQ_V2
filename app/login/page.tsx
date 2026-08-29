"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Stethoscope,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    setTimeout(() => {
      const res = login(identity, password);
      setIsLoading(false);
      if (res.success) {
        router.push("/dashboard");
      } else {
        setErrorMessage(res.error || "Đăng nhập không thành công.");
      }
    }, 400);
  };

  const handleQuickLogin = (email: string, pass: string) => {
    setIdentity(email);
    setPassword(pass);
    setIsLoading(true);
    setTimeout(() => {
      login(email, pass);
      setIsLoading(false);
      router.push("/dashboard");
    }, 300);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-sky-500/5 via-background to-background">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
            <Stethoscope className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Đăng Nhập Tài Khoản Y Khoa
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Truy cập ngân hàng câu hỏi, cây thư mục và chuỗi streak học tập của bạn
          </p>
        </div>

        {/* Card Form */}
        <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xl space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identity (Username or Email) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tên Đăng Nhập hoặc Email *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="tuan.le@med.edu.vn hoặc anhtuan"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-background text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Mật Khẩu *
                </label>
                <span className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline cursor-pointer">
                  Quên mật khẩu?
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-2xl border border-border bg-background text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <span>{isLoading ? "Đang xác thực..." : "Đăng Nhập Ngay"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Login Presets */}
          <div className="pt-2 border-t border-border/70 space-y-2.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block text-center">
              Hoặc Đăng Nhập Nhanh Tài Khoản Mẫu:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("tuan.le@med.edu.vn", "123")}
                className="p-2.5 rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50/50 dark:bg-sky-950/30 text-left hover:border-sky-400 transition-all text-xs"
              >
                <div className="font-bold text-foreground">BS. Anh Tuấn</div>
                <div className="text-[10px] text-muted-foreground">Sinh viên Y4 (ĐHYD)</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("mai.nguyen@med.edu.vn", "123")}
                className="p-2.5 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/30 text-left hover:border-purple-400 transition-all text-xs"
              >
                <div className="font-bold text-foreground">BSNT. Hoàng Mai</div>
                <div className="text-[10px] text-muted-foreground">Bác Sĩ Nội Trú (ĐHYHN)</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="font-bold text-sky-600 dark:text-sky-400 hover:underline"
          >
            Đăng ký tài khoản mới miễn phí
          </Link>
        </p>
      </div>
    </div>
  );
}

