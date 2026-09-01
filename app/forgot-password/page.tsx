"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  KeyRound,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { verifyAccountExists, resetPassword, login } = useAuth();

  // Multi-step: 1: Input Identity -> 2: OTP Verification -> 3: New Password -> 4: Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form States
  const [identity, setIdentity] = useState("leanhtuan812006@gmail.com");
  const [generatedOtp, setGeneratedOtp] = useState("849206");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // STEP 1: Verify User & Generate OTP
  const handleRequestOtp = (e?: React.FormEvent, customTarget?: string) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    const queryIdentity = (customTarget || identity).trim();

    if (!queryIdentity) {
      setErrorMessage("Vui lòng nhập Email hoặc Tên đăng nhập của bạn!");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = verifyAccountExists(queryIdentity);
      setIsLoading(false);

      if (!res.success || !res.user) {
        setErrorMessage(res.error || "Không tìm thấy tài khoản!");
        return;
      }

      const code = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(code);
      setStep(2);
      startCooldown();
    }, 300);
  };

  const startCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    startCooldown();
  };

  const handleAutoFillOtp = () => {
    setEnteredOtp(generatedOtp);
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setErrorMessage("Mã xác nhận OTP không chính xác. Vui lòng kiểm tra lại!");
      return;
    }

    setStep(3);
  };

  // STEP 3: Submit New Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (newPassword.length < 3) {
      setErrorMessage("Mật khẩu mới phải có ít nhất 3 ký tự!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Xác nhận mật khẩu mới không trùng khớp!");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = resetPassword(identity, newPassword);
      setIsLoading(false);

      if (res.success) {
        setStep(4);
      } else {
        setErrorMessage(res.error || "Lỗi cập nhật mật khẩu mới!");
      }
    }, 400);
  };

  const handleDirectLogin = () => {
    login(identity, newPassword || "123");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-sky-500/5 via-background to-background">
      <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
            <KeyRound className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Khôi Phục Mật Khẩu Y Khoa
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Lấy lại quyền truy cập tài khoản và ngân hàng đề thi MediMind của bạn
          </p>
        </div>

        {/* Multi-step Card Form */}
        <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xl space-y-5">
          {/* Progress Indicators */}
          <div className="flex items-center justify-between pb-2 border-b border-border/60 text-xs">
            <span className="font-bold text-sky-600 dark:text-sky-400">
              Bước {step === 4 ? 3 : step} / 3:{" "}
              {step === 1 && "Xác định tài khoản"}
              {step === 2 && "Nhập mã OTP"}
              {step === 3 && "Đặt lại mật khẩu"}
              {step === 4 && "Hoàn tất"}
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-2 w-6 rounded-full transition-all",
                    step >= s ? "bg-sky-600" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Enter Email/Username */}
          {step === 1 && (
            <form onSubmit={(e) => handleRequestOtp(e)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Email hoặc Tên Đăng Nhập *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="VD: leanhtuan812006@gmail.com"
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-background text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Quick Select Buttons */}
              <div className="p-3 rounded-2xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900 space-y-1.5 text-xs">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Khôi phục nhanh cho tài khoản:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIdentity("leanhtuan812006@gmail.com");
                    handleRequestOtp(undefined, "leanhtuan812006@gmail.com");
                  }}
                  className="w-full p-2.5 rounded-xl border border-sky-300 dark:border-sky-800 bg-card hover:bg-sky-100 dark:hover:bg-sky-900/50 text-left flex items-center justify-between font-bold text-sky-700 dark:text-sky-300 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-sky-600" />
                    <span>leanhtuan812006@gmail.com</span>
                  </div>
                  <span className="text-[10px] bg-sky-600 text-white px-2 py-0.5 rounded-full font-bold">
                    BS. Lê Anh Tuấn
                  </span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>{isLoading ? "Đang xác thực tài khoản..." : "Gửi Mã Xác Nhận OTP"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Enter Verification Code */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/60 dark:to-indigo-950/60 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-100 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-sky-600" />
                    <span>Mã OTP Đã Gửi Đến Email:</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{identity}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-card border border-border/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Mã OTP bảo mật:</span>
                  <span className="px-3 py-1 rounded-lg bg-sky-600 text-white font-mono font-black text-base tracking-widest shadow-xs">
                    {generatedOtp}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillOtp}
                  className="w-full py-2 rounded-xl bg-sky-100 dark:bg-sky-900/60 hover:bg-sky-200 text-sky-800 dark:text-sky-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span>Bấm Tự Động Điền Mã OTP Vào Ô</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Mã Xác Nhận 6 Chữ Số *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Nhập mã 6 số..."
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.trim())}
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-center text-xl font-mono font-black tracking-widest text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Đổi tài khoản</span>
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0}
                  onClick={handleResendOtp}
                  className={cn(
                    "font-bold",
                    resendCooldown > 0
                      ? "text-muted-foreground cursor-not-allowed"
                      : "text-sky-600 dark:text-sky-400 hover:underline"
                  )}
                >
                  {resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : "Gửi lại mã mới"}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>Xác Nhận &amp; Đặt Mật Khẩu Mới</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* STEP 3: Enter New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Mật Khẩu Mới Của Bạn *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Nhập mật khẩu mới..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-border bg-background text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none transition-all"
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

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Xác Nhận Lại Mật Khẩu Mới *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Nhập lại mật khẩu..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-background text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>{isLoading ? "Đang cập nhật mật khẩu..." : "Lưu & Kích Hoạt Mật Khẩu Mới"}</span>
                <CheckCircle2 className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* STEP 4: Success State */}
          {step === 4 && (
            <div className="py-4 text-center space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 shadow-inner">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-foreground">
                  Đặt Lại Mật Khẩu Thành Công!
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Tài khoản <strong>{identity}</strong> đã được cập nhật mật khẩu mới. Bạn có thể đăng nhập ngay.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDirectLogin}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 transition-all hover:scale-[1.01]"
              >
                <span>Đăng Nhập Vào Học Ngay</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-muted-foreground">
          Đã nhớ mật khẩu rồi?{" "}
          <Link
            href="/login"
            className="font-bold text-sky-600 dark:text-sky-400 hover:underline"
          >
            Quay lại Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

