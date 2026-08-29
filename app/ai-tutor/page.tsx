"use client";

import React from "react";
import { AIChatBox } from "@/components/ai/ai-chat-box";
import { AuthGuard } from "@/components/auth-guard";
import { Bot, Sparkles, ShieldCheck, BrainCircuit } from "lucide-react";

export default function AITutorPage() {
  return (
    <AuthGuard
      featureTitle="Trợ Lý Y Khoa MediAI Medical Tutor"
      featureDescription="Vui lòng đăng nhập để trao đổi ca bệnh lâm sàng, nhận giải thích cơ chế dược lý và để AI gợi ý lộ trình ôn tập cá nhân hóa."
    >
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              <span>TRỢ LÝ Y KHOA THÔNG MINH (BLOOM CLINICAL REASONING)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              MediAI Medical Tutor
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Tương tác 1:1 cùng AI chuyên ngành y: Giải thích ca bệnh lâm sàng phức tạp, phân tích cơ chế tác dụng thuốc và rèn luyện câu hỏi theo từng mốc Bloom.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Kiến thức chuẩn Y văn</span>
          </div>
        </div>

        {/* AI Chatbox Component */}
        <AIChatBox />
      </div>
    </AuthGuard>
  );
}
