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
  AlertCircle,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [medicalSchool, setMedicalSchool] = useState("Đại học Y Dược TP.HCM");
  const [yearOfStudy, setYearOfStudy] = useState<number>(4);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (password.length < 4) {
      setErrorMessage("Mật khẩu phải có ít nhất 4 ký tự!");
      return;
    }

    setIsLoading(true);

    try {
      const res = await register({
        name,
        username,
        email,
        password,
        medicalSchool,
        yearOfStudy,
      });

      setIsLoading(false);
      if (res.success) {
        router.push("/dashboard");
      } else {
        setErrorMessage(res.error || "Lỗi đăng ký tài khoản!");
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage("Lỗi đăng ký tài khoản, vui lòng thử lại!");
    }
  };

  const medicalSchoolsList = [
    "Đại học Y Dược TP.HCM",
    "Đại học Y Hà Nội",
    "Khoa Y - Đại học Quốc Gia TP.HCM",
    "Đại học Y Khoa Phạm Ngọc Thạch",
    "Đại học Y Dược Cần Thơ",
    "Đại học Y Dược Huế",
    "Học viện Quân Y",
    "Trường Đại học khác...",
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-sky-500/5 via-background to-background">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
            <Stethoscope className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Tạo Tài Khoản MediMind Mới
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Bắt đầu hành trình rèn luyện tư duy Bloom và theo dõi chuỗi ngày học y khoa
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
            {/* Full Name & Username in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Họ và Tên *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="VD: BS. Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-border bg-background text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Tên Đăng Nhập (Username) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: bs_nguyenvana"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-border bg-background text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Địa Chỉ Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  placeholder="nguyenvana@med.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border bg-background text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none"
                />
              </div>
            </div>

            {/* Medical School & Year of Study */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Trường Đại Học Y Dược
                </label>
                <select
                  value={medicalSchool}
                  onChange={(e) => setMedicalSchool(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl border border-border bg-background text-xs font-medium text-foreground outline-none"
                >
                  {medicalSchoolsList.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Năm Học Hiện Tại
                </label>
                <select
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-2xl border border-border bg-background text-xs font-medium text-foreground outline-none"
                >
                  <option value={1}>Sinh viên Y1</option>
                  <option value={2}>Sinh viên Y2</option>
                  <option value={3}>Sinh viên Y3</option>
                  <option value={4}>Sinh viên Y4</option>
                  <option value={5}>Sinh viên Y5</option>
                  <option value={6}>Sinh viên Y6</option>
                  <option value={7}>Bác Sĩ Nội Trú / Cao Học</option>
                </select>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Mật Khẩu *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Mật khẩu..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-border bg-background text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Xác Nhận Mật Khẩu *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Nhập lại..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border bg-background text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <span>{isLoading ? "Đang tạo tài khoản..." : "Đăng Ký & Bắt Đầu Học Ngay"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-muted-foreground">
          Đã có tài khoản rồi?{" "}
          <Link
            href="/login"
            className="font-bold text-sky-600 dark:text-sky-400 hover:underline"
          >
            Đăng nhập tại đây
          </Link>
        </p>
      </div>
    </div>
  );
}

