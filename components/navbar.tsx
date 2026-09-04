"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth-context";
import {
  Stethoscope,
  BookOpen,
  Layers,
  FolderTree,
  Bot,
  BarChart3,
  PlusCircle,
  Sun,
  Moon,
  Flame,
  Menu,
  X,
  Sparkles,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout, shareRequests } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const pendingShareCount = (shareRequests || []).filter(
    (r) => r.status === "PENDING"
  ).length;

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: "/", label: "Trang Chủ", icon: BookOpen, isPublic: true },
    { href: "/dashboard", label: "Dashboard & Bloom", icon: BarChart3, isPublic: false },
    { href: "/folders", label: "Cây Thư Mục", icon: FolderTree, isPublic: false },
    { href: "/quiz", label: "Luyện MCQ", icon: Layers, isPublic: false },
    { href: "/flashcards", label: "Flashcards", icon: Stethoscope, isPublic: false },
    { href: "/create", label: "Biên Soạn & Import", icon: PlusCircle, isPublic: false },
    { href: "/ai-tutor", label: "MediAI Tutor", icon: Bot, isSpecial: true, isPublic: false },
  ];

  const getInitials = (name?: string) => {
    if (!name) return "MD";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md transition-all">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/20">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-sky-700 via-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
              MediMind<span className="text-xs font-semibold px-1.5 py-0.5 ml-1 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">Y Khoa</span>
            </span>
            <span className="text-[10px] text-muted-foreground -mt-1 font-medium">Học tập & Phân tích Bloom</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            const isLocked = !link.isPublic && !isAuthenticated;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all",
                  isActive
                    ? "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  link.isSpecial && !isActive && "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
                {link.href === "/folders" && pendingShareCount > 0 && (
                  <span className="flex h-4.5 min-w-4.5 px-1.5 items-center justify-center rounded-full bg-rose-600 text-white text-[10px] font-black animate-pulse shadow-xs">
                    {pendingShareCount}
                  </span>
                )}
                {isLocked ? (
                  <Lock className="h-3 w-3 text-muted-foreground/60 ml-0.5" />
                ) : link.isSpecial ? (
                  <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Streak, Theme Toggle, User Profile / Auth Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Study Streak Badge (Only when authenticated) */}
          {isAuthenticated && user && (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-xs hover:scale-105 transition-all"
              title="Chuỗi ngày học liên tục (Learning Streak)"
            >
              <Flame className="h-4 w-4 fill-amber-500 text-amber-500 animate-bounce" />
              <span>{user.streakCount} Ngày</span>
            </Link>
          )}

          {/* Dark Mode Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors border border-border/50"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </button>
          )}

          {/* User Profile Dropdown (Logged in) OR Login / Register Buttons (Logged out) */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 py-1 border-l border-border/80 text-left cursor-pointer group"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                  {getInitials(user.name)}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-bold leading-tight group-hover:text-sky-600 transition-colors">
                    {user.name}
                  </span>
                  {user.isDemo ? (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-black">
                      Chế độ Chỉ Xem
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground truncate max-w-[110px]">
                      {user.medicalSchool || "Sinh viên Y"}
                    </span>
                  )}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:inline" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl space-y-1 z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="p-2 border-b border-border/60">
                    <div className="flex items-center justify-between gap-1">
                      <div className="font-bold text-xs text-foreground truncate">{user.name}</div>
                      {user.isDemo && (
                        <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Chỉ Xem
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">{user.email}</div>
                    {user.isDemo ? (
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                        Tài Khoản Mẫu Trải Nghiệm
                      </div>
                    ) : (
                      <div className="text-[10px] text-sky-600 font-semibold mt-0.5">
                        Năm {user.yearOfStudy || 4} • {user.role === "RESIDENT_DOCTOR" ? "Bác Sĩ Nội Trú" : "Sinh Viên Y"}
                      </div>
                    )}
                  </div>

                  {user.isDemo && (
                    <Link
                      href="/register"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
                    >
                      <Sparkles className="h-4 w-4 text-amber-600" />
                      <span>Đăng Ký Tài Khoản Thật</span>
                    </Link>
                  )}

                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <BarChart3 className="h-4 w-4 text-sky-600" />
                    <span>Bảng Điểm & Bloom</span>
                  </Link>

                  <Link
                    href="/folders"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <FolderTree className="h-4 w-4 text-indigo-600" />
                    <span>Thư Mục Của Tôi</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                      router.push("/login");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Đăng Xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pl-2 border-l border-border/80">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground transition-all"
              >
                <LogIn className="h-3.5 w-3.5 text-sky-600" />
                <span>Đăng Nhập</span>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-all"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Tạo Tài Khoản</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-background/95 backdrop-blur-md px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            const isLocked = !link.isPublic && !isAuthenticated;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {link.href === "/folders" && pendingShareCount > 0 && (
                    <span className="flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-rose-600 text-white text-[10px] font-black animate-pulse shadow-xs">
                      {pendingShareCount} mới
                    </span>
                  )}
                  {isLocked ? (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
                  ) : link.isSpecial ? (
                    <Sparkles className="h-4 w-4 text-amber-500" />
                  ) : null}
                </div>
              </Link>
            );
          })}

          {!isAuthenticated && (
            <div className="pt-3 border-t border-border flex items-center gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-center border border-border font-bold text-xs"
              >
                Đăng Nhập
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-center bg-sky-600 text-white font-bold text-xs"
              >
                Tạo Tài Khoản
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
