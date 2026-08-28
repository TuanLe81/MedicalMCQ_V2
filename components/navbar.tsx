"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: "/", label: "Trang Chủ", icon: BookOpen },
    { href: "/dashboard", label: "Dashboard & Bloom", icon: BarChart3 },
    { href: "/folders", label: "Cây Thư Mục", icon: FolderTree },
    { href: "/quiz/deck_cardio_01", label: "Luyện MCQ (Bloom)", icon: Layers },
    { href: "/flashcards/deck_pharm_01", label: "Flashcards", icon: Stethoscope },
    { href: "/create", label: "Biên Soạn", icon: PlusCircle },
    { href: "/ai-tutor", label: "MediAI Tutor", icon: Bot, isSpecial: true },
  ];

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
        <nav className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  link.isSpecial && !isActive && "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
                {link.isSpecial && (
                  <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Streak, Theme Toggle, User Profile */}
        <div className="flex items-center gap-3">
          {/* Study Streak Badge (Duolingo Style) */}
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-xs hover:scale-105 transition-all"
            title="Chuỗi ngày học liên tục (Learning Streak)"
          >
            <Flame className="h-4 w-4 fill-amber-500 text-amber-500 animate-bounce" />
            <span>14 Ngày</span>
          </Link>

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

          {/* User Avatar & Status */}
          <div className="hidden sm:flex items-center gap-2 pl-1 border-l border-border/80">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              AT
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold leading-tight">BS. Anh Tuấn</span>
              <span className="text-[10px] text-muted-foreground">Y4 - ĐHYD</span>
            </div>
          </div>

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
            const isActive = pathname === link.href;
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
                {link.isSpecial && <Sparkles className="h-4 w-4 text-amber-500" />}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}

