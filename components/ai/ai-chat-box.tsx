"use client";

import React, { useState } from "react";
import { Bot, Sparkles, Send, Stethoscope, User, HelpCircle, Lightbulb, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export function AIChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_1",
      role: "assistant",
      content: `Xin chào BS. Anh Tuấn! Tôi là **MediAI Tutor** – Trợ lý AI Y khoa của bạn.

Tôi có thể hỗ trợ bạn:
1. **Giải thích cơ chế bệnh sinh & Dược lý học** chi tiết.
2. **Biện luận ca lâm sàng** từng bước theo chuẩn Y khoa chứng cứ (EBM).
3. **Phân tích câu hỏi theo Thang đo tư duy Bloom** (Nhớ, Hiểu, Vận dụng, Phân tích, Đánh giá, Sáng tạo).
4. **Tự động sinh bộ câu hỏi trắc nghiệm & Flashcard** theo chuyên khoa.

Hãy chọn một gợi ý bên dưới hoặc nhập câu hỏi bất kỳ!`,
      timestamp: "14:00",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const samplePrompts = [
    "Giải thích cơ chế tác dụng của nhóm SGLT2i trong suy tim HFrEF",
    "Phân tích ca lâm sàng: Bệnh nhân đau ngực sau xương ức kèm ST chênh lên V1-V4",
    "Tạo 2 câu hỏi trắc nghiệm Bloom Cấp 4 (Phân tích) về Viêm tụy cấp",
    "Phân biệt Tam chứng Charcot và Ngũ chứng Reynolds",
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulated Intelligent Medical Response
    setTimeout(() => {
      let aiReply = "";

      if (query.toLowerCase().includes("sglt2i") || query.toLowerCase().includes("suy tim")) {
        aiReply = `### 🩺 PHÂN TÍCH CƠ CHẾ SGLT2i TRONG SUY TIM (DAPA-HF & EMPEROR):

1. **Cơ chế Huyết động (Hemodynamic Effect):**
   - Ức chế tái hấp thu Na+ và Glucose tại ống lượn gần -> tăng bài tiết Na+ đến **vết đặc (macula densa)**.
   - Kích hoạt phản hồi cầu thận - ống thận (Tubuloglomerular Feedback) gây **co tiểu động mạch đến (afferent arteriole)** -> giảm áp lực nội cầu thận, bảo tồn chức năng thận lâu dài.
   - Gây lợi niệu thẩm thấu nhẹ -> **giảm tiền tải & hậu tải** mà không kích hoạt hệ giao cảm.

2. **Cơ chế Chuyển hóa & Tế bào cơ tim (Metabolic Shift):**
   - Chuyển nguồn năng lượng cơ tim từ tiêu thụ Glucose sang **thể Ketone (beta-hydroxybutyrate)**, giúp cơ tim co bóp tiết kiệm oxy hơn.
   - Giảm lắng đọng mỡ cơ tim và giảm xơ hóa thành tim.

3. **Thang đo Bloom liên quan:**
   - Cấp 2 (Hiểu): Nắm vững cơ chế vết đặc và phản hồi cầu thận.
   - Cấp 3 (Vận dụng): Chỉ định ngay Empagliflozin/Dapagliflozin 10mg/ngày cùng với ARNI + BB + MRA (Tứ trụ).`;
      } else if (query.toLowerCase().includes("viêm tụy") || query.toLowerCase().includes("bloom")) {
        aiReply = `### 📚 CÂU HỎI TRẮC NGHIỆM BLOOM CẤP 4 (PHÂN TÍCH) - VIÊM TỤY CẤP:

**Tình huống lâm sàng:** Bệnh nhân nam 42 tuổi vào cấp cứu vì đau bụng thượng vị dữ dội lan ra sau lưng sau bữa tiệc rượu, nôn ói nhiều. Amylase máu 1.450 U/L, Lipase 3.200 U/L, Triglyceride 12 mmol/L. Huyết áp 90/60 mmHg, Hct 48%, BUN 28 mg/dL.

**Câu hỏi:** Yếu tố nào sau đây là chỉ điểm sớm có giá trị nhất cho tình trạng cô đặc máu và nguy cơ hoại tử tụy nặng cần bù dịch tích cực?
- **A.** Lipase máu tăng gấp 10 lần giới hạn trên
- **B.** Hematocrit (Hct) > 44% và BUN > 20 mg/dL tại thời điểm nhập viện *(Đáp án ĐÚNG)*
- **C.** Nồng độ Triglyceride máu tăng cao
- **D.** Mức độ đau dữ dội lan ra sau lưng của bệnh nhân

**Giải thích lâm sàng:** Mức tăng Lipase/Amylase phản ánh tình trạng viêm nhưng KHÔNG tương quan với mức độ nặng của viêm tụy. Ngược lại, Hct > 44% và BUN tăng phản ánh sự thất thoát dịch vào khoang thứ ba (cô đặc máu) - là yếu tố tiên lượng hoại tử tụy và suy đa cơ quan mạnh nhất.`;
      } else {
        aiReply = `### 🩺 PHẢN HỒI LÂM SÀNG TỪ MEDIAL TUTOR:

Tôi đã ghi nhận câu hỏi của bạn: *"${query}"*.

**1. Tóm tắt & Điểm then chốt y khoa:**
- Đây là một chủ đề trọng tâm trong chương trình Y khoa lâm sàng.
- Tiếp cận luôn bắt đầu từ: Khám hỏi bệnh sử -> Định khu tổn thương -> Chẩn đoán phân biệt -> Cận lâm sàng ưu tiên -> Xử trí theo phác đồ.

**2. Gợi ý rèn luyện theo Thang đo Bloom:**
- Bạn có thể chuyển nội dung này thành một **Thẻ Flashcard (Cấp 1 & 2)** hoặc một **Tình huống trắc nghiệm ca bệnh (Cấp 4 & 5)** tại mục **Biên Soạn (Creator Studio)**!`;
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: "assistant",
        content: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="flex flex-col h-[700px] rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border/80 bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-foreground">MediAI Medical Tutor</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Online
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Giải thích ca bệnh & rèn luyện tư duy Bloom chuẩn Y khoa
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMessages(messages.slice(0, 1))}
          className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          title="Làm mới hội thoại"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={cn(
                "flex items-start gap-3",
                isUser ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-xs",
                  isUser
                    ? "bg-sky-600 text-white"
                    : "bg-indigo-600 text-white"
                )}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={cn(
                  "max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 text-xs sm:text-sm space-y-2 leading-relaxed shadow-xs",
                  isUser
                    ? "bg-sky-600 text-white rounded-tr-xs"
                    : "bg-muted/40 dark:bg-muted/20 border border-border text-foreground rounded-tl-xs"
                )}
              >
                <div className="whitespace-pre-line prose dark:prose-invert max-w-none text-inherit font-normal">
                  {msg.content}
                </div>
                <div
                  className={cn(
                    "text-[10px] text-right pt-1 opacity-70",
                    isUser ? "text-sky-100" : "text-muted-foreground"
                  )}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
            <Bot className="h-4 w-4 text-indigo-600 animate-spin" />
            <span>MediAI đang tra cứu bệnh án & phân tích thang đo Bloom...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts Carousel */}
      <div className="p-3 border-t border-border/50 bg-muted/10 overflow-x-auto flex items-center gap-2 scrollbar-none">
        <span className="text-[11px] font-semibold text-muted-foreground shrink-0 flex items-center gap-1">
          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
          <span>Gợi ý:</span>
        </span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(prompt)}
            className="shrink-0 px-3 py-1.5 rounded-xl border border-border/80 bg-background hover:bg-muted text-[11px] font-medium text-foreground transition-all truncate max-w-xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-border bg-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Hỏi về cơ chế bệnh sinh, phác đồ, hoặc tạo câu hỏi Bloom..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-3 rounded-2xl border border-border bg-background text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-indigo-500/50 outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-md shadow-indigo-600/25 transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

