"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BloomLevel, MCQQuestion, FlashcardItem, DeckType } from "@/types";
import { BLOOM_TAXONOMY_MAP, MEDICAL_SPECIALTIES } from "@/constants/bloom";
import { BloomBadge } from "@/components/mcq/bloom-badge";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-context";
import {
  FilePlus,
  Layers,
  FolderPlus,
  Save,
  CheckCircle2,
  BrainCircuit,
  HelpCircle,
  Stethoscope,
  Sparkles,
  ArrowRight,
  UploadCloud,
  FileText,
  AlertTriangle,
  Copy,
  Download,
  Trash2,
  ListChecks,
  Bot,
  Wand2,
  RefreshCw,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateStudioPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"AI_GEN" | "BATCH" | "MCQ" | "FLASHCARD">("AI_GEN");

  // Single MCQ Form States
  const [vignette, setVignette] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [bloomLevel, setBloomLevel] = useState<BloomLevel>("ANALYZING");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [options, setOptions] = useState<string[]>([
    "Lựa chọn A...",
    "Lựa chọn B...",
    "Lựa chọn C...",
    "Lựa chọn D...",
  ]);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [explanation, setExplanation] = useState("");
  const [targetSpecialty, setTargetSpecialty] = useState("Nội Tim Mạch");

  // Single Flashcard Form States
  const [fcFront, setFcFront] = useState("");
  const [fcBack, setFcBack] = useState("");
  const [fcHint, setFcHint] = useState("");
  const [fcBloom, setFcBloom] = useState<BloomLevel>("REMEMBERING");

  // BATCH IMPORT STATES
  const [batchType, setBatchType] = useState<"MCQ" | "FLASHCARD">("MCQ");
  const [batchFormat, setBatchFormat] = useState<"TEXT" | "JSON">("TEXT");
  const [batchRawInput, setBatchRawInput] = useState("");
  const [parsedMCQs, setParsedMCQs] = useState<MCQQuestion[]>([]);
  const [parsedFlashcards, setParsedFlashcards] = useState<FlashcardItem[]>([]);
  const [batchTargetDeckTitle, setBatchTargetDeckTitle] = useState("Bộ Đề Y Khoa Mới Import");
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savedDeckId, setSavedDeckId] = useState<string | null>(null);

  // AI GENERATOR STATES
  const [aiTopic, setAiTopic] = useState("Hội Chứng Vành Cấp & Suy Tim");
  const [aiSpecialty, setAiSpecialty] = useState("Nội Tim Mạch");
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(4);
  const [aiBloomFocus, setAiBloomFocus] = useState<"ALL" | "CLINICAL">("ALL");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const bloomKeys = Object.keys(BLOOM_TAXONOMY_MAP) as BloomLevel[];

  const sampleMCQText = `[Vignette] Bệnh nhân nam 62 tuổi, tiền căn tăng huyết áp và đái tháo đường, nhập viện vì khó thở khi nằm, phù 2 chi dưới, ran ẩm 2 đáy phổi, T3 Gallop ở mỏm tim.
Câu hỏi: Dấu hiệu thăm khám lâm sàng nào có độ đặc hiệu cao nhất cho chẩn đoán suy tim sung huyết ở bệnh nhân này?
A. Tiếng T3 Gallop ở mỏm tim
B. Ran ẩm ở 2 đáy phổi
C. Phù ấn lõm hai chi dưới đối xứng
D. Nhịp tim nhanh lúc nghỉ (98 ck/phút)
Đáp án: A
Bloom: ANALYZING
Giải thích: Tiếng T3 Gallop và tĩnh mạch cổ nổi (JVD) có độ đặc hiệu rất cao (> 95%) trong suy tim sung huyết có tăng áp lực làm đầy thất trái.
---
[Vignette] Bệnh nhân nữ 55 tuổi được chẩn đoán HFrEF (EF = 32%), NYHA II.
Câu hỏi: Thuốc nào sau đây thuộc nhóm ức chế SGLT2 được chứng minh giảm tử vong do tim mạch kể cả khi KHÔNG mắc đái tháo đường?
A. Empagliflozin và Dapagliflozin
B. Metformin và Pioglitazone
C. Gliclazide và Glimepiride
D. Sitagliptin và Vildagliptin
Đáp án: A
Bloom: REMEMBERING
Giải thích: Empagliflozin (EMPEROR) và Dapagliflozin (DAPA-HF) là 2 thuốc SGLT2i trụ cột điều trị suy tim được FDA phê duyệt.`;

  const sampleFlashcardText = `Tam chứng Charcot trong nhiễm trùng đường mật | 1. Đau hạ sườn phải\n2. Sốt (kèm lạnh run)\n3. Vàng da - Vàng mắt | Đau - Sốt - Vàng | REMEMBERING
Ngũ chứng Reynolds trong viêm đường mật hoại tử | Tam chứng Charcot + Tụt huyết áp (Shock) + Rối loạn tri giác | Shock + Tri giác | ANALYZING
Cơ chế tác dụng của Nitroglycerin trong cơn đau thắt ngực | Chuyển thành NO -> kích hoạt Guanylyl cyclase -> tăng cGMP -> giãn hệ tĩnh mạch -> giảm tiền tải | Giảm tiền tải qua NO / cGMP | UNDERSTANDING`;

  const handleGenerateWithAI = () => {
    setIsAiGenerating(true);

    setTimeout(() => {
      let generatedQuestions: MCQQuestion[] = [];

      if (aiTopic.toLowerCase().includes("thở") || aiTopic.toLowerCase().includes("phổi") || aiTopic.toLowerCase().includes("hô hấp")) {
        generatedQuestions = [
          {
            id: `mcq_ai_${Date.now()}_1`,
            clinicalVignette: "Bệnh nhân nam 58 tuổi, sốt cao 39°C, ho khạc đàm rỉ sét, đau ngực kiểu màng phổi bên phải. Khám thấy hội chứng đông đặc đáy phổi phải. Thang điểm CURB-65 = 2 điểm.",
            questionText: "Vi khuẩn nào là tác nhân gây Viêm phổi cộng đồng (CAP) điển hình phổ biến nhất ở bệnh nhân này?",
            bloomLevel: "REMEMBERING",
            difficulty: "EASY",
            options: [
              "A. Streptococcus pneumoniae (Phế cầu khuẩn)",
              "B. Mycoplasma pneumoniae",
              "C. Pseudomonas aeruginosa",
              "D. Legionella pneumophila"
            ],
            correctIndex: 0,
            explanation: "Streptococcus pneumoniae là căn nguyên hàng đầu gây viêm phổi thùy cộng đồng điển hình với đàm rỉ sét và hội chứng đông đặc rõ rệt."
          },
          {
            id: `mcq_ai_${Date.now()}_2`,
            clinicalVignette: "Khí máu động mạch (ABG) phòng cấp cứu của bệnh nhân hen phế quản cơn nặng: pH 7.34, PaCO2 46 mmHg, PaO2 58 mmHg, HCO3- 24 mEq/L.",
            questionText: "Ý nghĩa lâm sàng nào sau đây của chỉ số PaCO2 = 46 mmHg (bình thường/tăng nhẹ) ở bệnh nhân đang thở nhanh 32 ck/phút?",
            bloomLevel: "ANALYZING",
            difficulty: "HARD",
            options: [
              "A. Dấu hiệu kiệt cơ hô hấp nguy kịch và sắp ngừng thở cần đặt nội khí quản",
              "B. Tình trạng thông khí đang cải thiện tốt",
              "C. Nhiễm kiềm hô hấp bù trừ",
              "D. Bệnh nhân cần giảm liều thuốc giãn phế quản"
            ],
            correctIndex: 0,
            explanation: "Ở bệnh nhân hen phế quản thở nhanh, PaCO2 bình thường phải giảm thấp do tăng thông khí. Khi PaCO2 tăng lên mức bình thường hoặc cao (>= 45 mmHg), chứng tỏ bệnh nhân đã kiệt cơ hô hấp, ứ trệ CO2 cực kỳ nguy kịch."
          }
        ];
      } else {
        generatedQuestions = [
          {
            id: `mcq_ai_${Date.now()}_1`,
            clinicalVignette: `Bệnh nhân vào viện với bệnh cảnh cấp tính liên quan đến chủ đề: ${aiTopic}. Khám thấy sinh hiệu biến động, cần tiếp cận theo guideline mới nhất.`,
            questionText: `Dấu hiệu xét nghiệm / cận lâm sàng bước đầu nào có giá trị định hướng cao nhất cho chẩn đoán ${aiTopic}?`,
            bloomLevel: "ANALYZING",
            difficulty: "MEDIUM",
            options: [
              "A. Xét nghiệm sinh hóa chuyên biệt kết hợp đo điện giải & biomarker tim/thận",
              "B. Tổng phân tích tế bào máu ngoại vi đơn thuần",
              "C. Chụp X-quang bụng không chuẩn bị",
              "D. Trì hoãn xét nghiệm đợi theo dõi thêm 24 giờ"
            ],
            correctIndex: 0,
            explanation: "Biomarker chuyên biệt kết hợp điện giải đồ giúp đánh giá mức độ tổn thương cơ quan đích và nguy cơ rối loạn thăng bằng kiềm toan."
          },
          {
            id: `mcq_ai_${Date.now()}_2`,
            clinicalVignette: `Đánh giá nguy cơ - lợi ích giữa can thiệp khẩn cấp và duy trì điều trị bảo tồn cho ca bệnh: ${aiTopic}.`,
            questionText: `Quyết định điều trị bước 1 nào sau đây phù hợp với khuyến cáo ESC / AHA / Bộ Y Tế?`,
            bloomLevel: "EVALUATING",
            difficulty: "HARD",
            options: [
              "A. Khởi động phác đồ phối hợp đa mô thức trúng đích kèm theo dõi huyết động sát",
              "B. Dùng đơn trị liệu liều tối đa ngay từ đầu",
              "C. Chờ đợi bệnh nhân xuất hiện biến chứng nặng mới bắt đầu dùng thuốc",
              "D. Ngừng tất cả thuốc nền đang sử dụng"
            ],
            correctIndex: 0,
            explanation: "Phác đồ phối hợp sớm liều thấp đa mô thức mang lại hiệu quả bảo vệ cơ quan đích vượt trội so với đơn trị liệu liều cao."
          }
        ];
      }

      setParsedMCQs(generatedQuestions);
      setBatchTargetDeckTitle(`Đề AI: ${aiTopic} (${generatedQuestions.length} câu)`);
      setIsAiGenerating(false);
      setActiveTab("BATCH");
    }, 1200);
  };

  const parseBatchContent = (raw: string, type: "MCQ" | "FLASHCARD", format: "TEXT" | "JSON") => {
    setParseErrors([]);

    if (!raw.trim()) {
      setParsedMCQs([]);
      setParsedFlashcards([]);
      return;
    }

    if (type === "MCQ") {
      if (format === "JSON") {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const formatted: MCQQuestion[] = parsed.map((item, idx) => ({
              id: `mcq_import_${Date.now()}_${idx}`,
              clinicalVignette: item.clinicalVignette || "",
              questionText: item.questionText || item.question || `Câu hỏi ${idx + 1}`,
              options: item.options || ["A", "B", "C", "D"],
              correctIndex: typeof item.correctIndex === "number" ? item.correctIndex : 0,
              bloomLevel: (item.bloomLevel as BloomLevel) || "ANALYZING",
              difficulty: item.difficulty || "MEDIUM",
              explanation: item.explanation || "Giải thích cơ chế bệnh sinh...",
            }));
            setParsedMCQs(formatted);
          } else {
            setParseErrors(["Dữ liệu JSON phải là một mảng [] danh sách câu hỏi."]);
          }
        } catch (e) {
          setParseErrors(["Cú pháp JSON không hợp lệ. Vui lòng kiểm tra dấu ngoặc kép hoặc dấu phẩy."]);
        }
      } else {
        const chunks = raw.split(/---+|\n\s*\n\s*\n/).filter((c) => c.trim().length > 0);
        const result: MCQQuestion[] = [];
        const errors: string[] = [];

        chunks.forEach((chunk, chunkIdx) => {
          const lines = chunk.trim().split("\n").map((l) => l.trim()).filter(Boolean);
          let vignetteStr = "";
          let qText = "";
          const opts: string[] = [];
          let correctIdx = 0;
          let bloom: BloomLevel = "UNDERSTANDING";
          let exp = "";

          lines.forEach((line) => {
            if (line.startsWith("[Vignette]") || line.startsWith("Tình huống:")) {
              vignetteStr = line.replace(/\[Vignette\]|Tình huống:/i, "").trim();
            } else if (line.match(/^Câu\s*\d*[:.]/i) || line.startsWith("Câu hỏi:")) {
              qText = line.replace(/^Câu\s*\d*[:.]|^Câu hỏi:/i, "").trim();
            } else if (line.match(/^[A-E][.:)]/i)) {
              opts.push(line.replace(/^[A-E][.:)]\s*/i, "").trim());
            } else if (line.match(/^Đáp án[:.]/i) || line.match(/^Answer[:.]/i)) {
              const ansLetter = line.replace(/^Đáp án[:.]|^Answer[:.]/i, "").trim().toUpperCase();
              const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };
              correctIdx = map[ansLetter[0]] ?? 0;
            } else if (line.match(/^Bloom[:.]/i)) {
              const bStr = line.replace(/^Bloom[:.]/i, "").trim().toUpperCase();
              if (bloomKeys.includes(bStr as BloomLevel)) {
                bloom = bStr as BloomLevel;
              } else if (bStr.includes("NHỚ") || bStr.includes("REMEMBER")) bloom = "REMEMBERING";
              else if (bStr.includes("HIỂU") || bStr.includes("UNDERSTAND")) bloom = "UNDERSTANDING";
              else if (bStr.includes("VẬN DỤNG") || bStr.includes("APPLY")) bloom = "APPLYING";
              else if (bStr.includes("PHÂN TÍCH") || bStr.includes("ANALYZE")) bloom = "ANALYZING";
              else if (bStr.includes("ĐÁNH GIÁ") || bStr.includes("EVALUATE")) bloom = "EVALUATING";
              else if (bStr.includes("SÁNG TẠO") || bStr.includes("CREATE")) bloom = "CREATING";
            } else if (line.match(/^Giải thích[:.]/i) || line.match(/^Rationale[:.]/i)) {
              exp = line.replace(/^Giải thích[:.]|^Rationale[:.]/i, "").trim();
            } else if (!qText && !line.startsWith("[")) {
              qText = line;
            } else if (exp) {
              exp += " " + line;
            }
          });

          if (!qText && opts.length === 0) {
            errors.push(`Khối câu hỏi số ${chunkIdx + 1} không tìm thấy nội dung câu hỏi hợp lệ.`);
          } else {
            result.push({
              id: `mcq_txt_${Date.now()}_${chunkIdx}`,
              clinicalVignette: vignetteStr,
              questionText: qText || `Câu hỏi lâm sàng số ${chunkIdx + 1}`,
              options: opts.length >= 2 ? opts : ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
              correctIndex: correctIdx,
              bloomLevel: bloom,
              difficulty: "MEDIUM",
              explanation: exp || "Chưa có lời giải thích chi tiết.",
            });
          }
        });

        setParsedMCQs(result);
        setParseErrors(errors);
      }
    } else {
      if (format === "JSON") {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const formatted: FlashcardItem[] = parsed.map((item, idx) => ({
              id: `fc_import_${Date.now()}_${idx}`,
              front: item.front || `Thuật ngữ ${idx + 1}`,
              back: item.back || "Định nghĩa / Cơ chế",
              hint: item.hint || "",
              bloomLevel: (item.bloomLevel as BloomLevel) || "REMEMBERING",
              specialty: item.specialty || targetSpecialty,
            }));
            setParsedFlashcards(formatted);
          } else {
            setParseErrors(["Dữ liệu JSON Flashcard phải là một mảng []"]);
          }
        } catch (e) {
          setParseErrors(["Lỗi cú pháp JSON. Vui lòng kiểm tra lại cấu trúc."]);
        }
      } else {
        const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
        const result: FlashcardItem[] = [];

        lines.forEach((line, idx) => {
          const parts = line.split("|").map((p) => p.trim());
          if (parts.length >= 2) {
            const front = parts[0];
            const back = parts[1];
            const hint = parts[2] || "";
            const bloomStr = (parts[3] || "REMEMBERING").toUpperCase();
            let bLevel: BloomLevel = "REMEMBERING";
            if (bloomKeys.includes(bloomStr as BloomLevel)) bLevel = bloomStr as BloomLevel;

            result.push({
              id: `fc_txt_${Date.now()}_${idx}`,
              front,
              back,
              hint,
              bloomLevel: bLevel,
              specialty: targetSpecialty,
            });
          }
        });

        setParsedFlashcards(result);
      }
    }
  };

  const handleSaveToLocalStorage = () => {
    const newDeckId = `custom_deck_${Date.now()}`;
    const isMCQ = batchType === "MCQ";

    const newDeck = {
      id: newDeckId,
      title: batchTargetDeckTitle || "Bộ Đề Tùy Chỉnh",
      description: `Được tạo tự động với ${isMCQ ? parsedMCQs.length : parsedFlashcards.length} mục theo thang đo Bloom`,
      type: isMCQ ? "MCQ" : "FLASHCARD",
      specialty: targetSpecialty,
      questions: isMCQ ? parsedMCQs : [],
      flashcards: !isMCQ ? parsedFlashcards : [],
      itemCount: isMCQ ? parsedMCQs.length : parsedFlashcards.length,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    try {
      const stored = localStorage.getItem("medlearn_custom_decks");
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newDeck);
      localStorage.setItem("medlearn_custom_decks", JSON.stringify(list));

      setSavedDeckId(newDeckId);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 5000);
    } catch (e) {
      setSavedSuccess(true);
    }
  };

  return (
    <AuthGuard
      featureTitle="Creator Studio & AI Batch Importer"
      featureDescription="Vui lòng đăng nhập để sử dụng tính năng AI tự động sinh đề thi lâm sàng và biên soạn ngân hàng câu hỏi chuẩn Bloom."
    >
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
              <Sparkles className="h-4 w-4" />
              <span>CREATOR STUDIO & AI BATCH IMPORTER CHUẨN BLOOM 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              Biên Soạn & Nạp Hàng Loạt Bằng AI
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Sử dụng AI tự động sinh câu hỏi lâm sàng theo chủ đề, hoặc dán tài liệu từ Word/PDF và phân loại chuẩn 6 bậc Bloom
            </p>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 text-xs font-bold animate-in fade-in shadow-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Đã lưu thành công bộ đề!</span>
              {savedDeckId && (
                <Link
                  href={`/quiz/${savedDeckId}`}
                  className="underline ml-1 text-emerald-900 dark:text-emerald-200"
                >
                  Làm bài ngay →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Demo User Notice Banner */}
        {user?.isDemo && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Lock className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold uppercase tracking-wider block">
                  Tài Khoản Mẫu Dùng Thử
                </span>
                <span className="text-[11px] opacity-90">
                  Bạn có thể tạo câu hỏi và trải nghiệm sinh đề AI. Để lưu trữ vĩnh viễn và chia sẻ cùng bạn bè, vui lòng tạo tài khoản riêng.
                </span>
              </div>
            </div>
            <Link
              href="/register"
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold whitespace-nowrap text-center shadow-xs transition-all"
            >
              Tạo Tài Khoản Riêng
            </Link>
          </div>
        )}

        {/* Tabs Switcher */}
        <div className="flex items-center gap-2 border-b border-border overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("AI_GEN")}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all",
              activeTab === "AI_GEN"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Bot className="h-4 w-4" />
            <span>🤖 AI Tự Động Sinh Đề</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("BATCH")}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all",
              activeTab === "BATCH"
                ? "border-sky-600 text-sky-600 dark:text-sky-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <UploadCloud className="h-4 w-4" />
            <span>⚡ Dán Hàng Loạt (Text / JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("MCQ")}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all",
              activeTab === "MCQ"
                ? "border-sky-600 text-sky-600 dark:text-sky-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <FilePlus className="h-4 w-4" />
            <span>Tạo Từng Câu Thủ Công</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("FLASHCARD")}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all",
              activeTab === "FLASHCARD"
                ? "border-purple-600 text-purple-600 dark:text-purple-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Layers className="h-4 w-4" />
            <span>Tạo Thẻ Flashcard 3D</span>
          </button>
        </div>

        {/* TAB 1: AI GENERATOR */}
        {activeTab === "AI_GEN" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 sm:p-7 rounded-3xl border border-border bg-card shadow-sm space-y-5">
                <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  <Wand2 className="h-5 w-5" />
                  <span>NHẬP YÊU CẦU ĐỂ AI TỰ ĐỘNG THIẾT KẾ CÂU HỎI BLOOM</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Chủ Đề Ca Bệnh / Thuốc / Bệnh Lý Cần Tạo *
                  </label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="VD: Cơn Bão Giáp (Thyroid Storm), Viêm Tụy Cấp, Thuốc Kháng Đông NOAC..."
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-sm font-semibold text-foreground focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-muted-foreground">
                      Chuyên Khoa
                    </label>
                    <select
                      value={aiSpecialty}
                      onChange={(e) => setAiSpecialty(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs font-medium text-foreground outline-none"
                    >
                      {MEDICAL_SPECIALTIES.filter((s) => s !== "Tất cả chuyên khoa").map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-muted-foreground">
                      Số Lượng Câu Hỏi
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[2, 4, 6, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setAiQuestionCount(num)}
                          className={cn(
                            "py-2 rounded-xl border text-xs font-bold transition-all",
                            aiQuestionCount === num
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "border-border text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {num} câu
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-muted-foreground">
                    Trọng Tâm Phân Phối Thang Đo Bloom
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setAiBloomFocus("ALL")}
                      className={cn(
                        "p-3 rounded-2xl border text-left font-semibold transition-all",
                        aiBloomFocus === "ALL"
                          ? "border-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-foreground"
                          : "border-border bg-background text-muted-foreground"
                      )}
                    >
                      <div className="font-bold text-indigo-600">Trải Đều 6 Bậc Bloom</div>
                      <div className="text-[11px] text-muted-foreground">Từ Nhớ, Hiểu đến Phân tích ca bệnh</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAiBloomFocus("CLINICAL")}
                      className={cn(
                        "p-3 rounded-2xl border text-left font-semibold transition-all",
                        aiBloomFocus === "CLINICAL"
                          ? "border-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-foreground"
                          : "border-border bg-background text-muted-foreground"
                      )}
                    >
                      <div className="font-bold text-indigo-600">Tập Trung Ca Lâm Sàng (Cấp 4-6)</div>
                      <div className="text-[11px] text-muted-foreground">Biện luận chẩn đoán phân biệt & xử trí cấp cứu</div>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={isAiGenerating || !aiTopic.trim()}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  {isAiGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>MediAI đang tra cứu bệnh án & thiết kế ca lâm sàng...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      <span>Tự Động Sinh Bộ Câu Hỏi & Chuyển Sang Xem Trước</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                  <BrainCircuit className="h-4 w-4 text-indigo-600" />
                  <span>CHUẨN HÓA Y KHOA BỞI MEDIAI</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Mỗi câu hỏi do AI tạo ra đều có cấu trúc chuẩn mực:
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Vignette:</strong> Bệnh sử ca bệnh lâm sàng chân thực.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>4 Phương án:</strong> 1 đáp án đúng và 3 phương án nhiễu có tính học thuật cao.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Bloom Tag:</strong> Gắn nhãn 1 trong 6 bậc Bloom kèm giải thích cơ chế bệnh học.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BATCH IMPORTER */}
        {activeTab === "BATCH" && (
          <div className="space-y-8">
            <div className="p-5 rounded-3xl border border-border bg-card shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Loại Dữ Liệu:
                  </span>
                  <div className="flex items-center gap-1.5 bg-muted p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setBatchType("MCQ");
                        parseBatchContent(batchRawInput, "MCQ", batchFormat);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                        batchType === "MCQ"
                          ? "bg-sky-600 text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Trắc Nghiệm MCQ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBatchType("FLASHCARD");
                        parseBatchContent(batchRawInput, "FLASHCARD", batchFormat);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                        batchType === "FLASHCARD"
                          ? "bg-purple-600 text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Thẻ Flashcard 3D
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Định Dạng:
                  </span>
                  <div className="flex items-center gap-1.5 bg-muted p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setBatchFormat("TEXT");
                        parseBatchContent(batchRawInput, batchType, "TEXT");
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                        batchFormat === "TEXT"
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground"
                      )}
                    >
                      Văn Bản Tự Do
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBatchFormat("JSON");
                        parseBatchContent(batchRawInput, batchType, "JSON");
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                        batchFormat === "JSON"
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground"
                      )}
                    >
                      Cấu Trúc JSON
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const sample = batchType === "MCQ" ? sampleMCQText : sampleFlashcardText;
                    setBatchFormat("TEXT");
                    setBatchRawInput(sample);
                    parseBatchContent(sample, batchType, "TEXT");
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Nạp Dữ Liệu Mẫu Y Khoa</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-sky-600" />
                    <span>Dán nội dung từ tài liệu (Word, PDF, Notepad):</span>
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Phân cách mỗi câu bằng <code>---</code>
                  </span>
                </div>

                <textarea
                  rows={16}
                  placeholder={
                    batchType === "MCQ"
                      ? `[Vignette] Bệnh nhân nam 60 tuổi...\nCâu hỏi: Chẩn đoán nào phù hợp nhất?\nA. Suy tim cấp\nB. Nhồi máu cơ tim\nC. Thuyên tắc phổi\nD. Viêm phổi\nĐáp án: A\nBloom: ANALYZING\nGiải thích: Tiếng T3 Gallop và ran ẩm...`
                      : `Mặt trước | Mặt sau | Gợi ý lâm sàng | Cấp Bloom\nTam chứng Charcot | 1. Đau HSP, 2. Sốt, 3. Vàng da | Đau-Sốt-Vàng | REMEMBERING`
                  }
                  value={batchRawInput}
                  onChange={(e) => {
                    setBatchRawInput(e.target.value);
                    parseBatchContent(e.target.value, batchType, batchFormat);
                  }}
                  className="w-full p-4 rounded-3xl border border-border bg-card text-xs sm:text-sm font-mono text-foreground focus:ring-2 focus:ring-indigo-500/50 outline-none leading-relaxed shadow-xs"
                />

                {parseErrors.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Lỗi định dạng:</span>
                    </div>
                    {parseErrors.map((err, idx) => (
                      <div key={idx} className="pl-5 text-[11px]">
                        • {err}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ListChecks className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Xem Trước Dữ Liệu Nhận Diện:
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold">
                      {batchType === "MCQ" ? parsedMCQs.length : parsedFlashcards.length} {batchType === "MCQ" ? "câu hỏi" : "thẻ"} hợp lệ
                    </span>
                  </div>

                  <div className="h-[360px] overflow-y-auto space-y-3 p-4 rounded-3xl border border-border bg-muted/20">
                    {batchType === "MCQ" && parsedMCQs.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs text-center p-6">
                        <UploadCloud className="h-8 w-8 text-muted-foreground/50 mb-2" />
                        <span>Chưa có câu hỏi nào được nhận diện. Hãy dán nội dung ở khung bên trái hoặc sử dụng tab "AI Tự Động Sinh Đề".</span>
                      </div>
                    )}

                    {batchType === "MCQ" &&
                      parsedMCQs.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl border border-border bg-card space-y-2 text-xs shadow-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-sky-600">Câu #{idx + 1}</span>
                            <BloomBadge level={q.bloomLevel} size="sm" />
                          </div>
                          {q.clinicalVignette && (
                            <p className="text-[11px] text-muted-foreground italic line-clamp-1">
                              "{q.clinicalVignette}"
                            </p>
                          )}
                          <p className="font-semibold text-foreground line-clamp-2">
                            {q.questionText}
                          </p>
                          <div className="grid grid-cols-2 gap-1 pt-1 text-[11px]">
                            {q.options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className={cn(
                                  "px-2 py-1 rounded-lg truncate",
                                  oIdx === q.correctIndex
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold"
                                  : "text-muted-foreground"
                                )}
                              >
                                {["A", "B", "C", "D"][oIdx]}. {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                    {batchType === "FLASHCARD" &&
                      parsedFlashcards.map((fc, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl border border-border bg-card space-y-1.5 text-xs shadow-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-purple-600">Thẻ #{idx + 1}</span>
                            <BloomBadge level={fc.bloomLevel} size="sm" />
                          </div>
                          <div className="font-bold text-foreground">{fc.front}</div>
                          <div className="text-muted-foreground text-[11px] whitespace-pre-line line-clamp-2">
                            {fc.back}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Tên Bộ Đề Đích
                      </label>
                      <input
                        type="text"
                        value={batchTargetDeckTitle}
                        onChange={(e) => setBatchTargetDeckTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-semibold text-foreground outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Chuyên Khoa
                      </label>
                      <select
                        value={targetSpecialty}
                        onChange={(e) => setTargetSpecialty(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground outline-none"
                      >
                        {MEDICAL_SPECIALTIES.filter((s) => s !== "Tất cả chuyên khoa").map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveToLocalStorage}
                    disabled={
                      (batchType === "MCQ" && parsedMCQs.length === 0) ||
                      (batchType === "FLASHCARD" && parsedFlashcards.length === 0)
                    }
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    <Save className="h-4 w-4" />
                    <span>
                      Lưu Toàn Bộ ({batchType === "MCQ" ? parsedMCQs.length : parsedFlashcards.length} Mục) Vào Bộ Đề & Luyện Ngay
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MANUAL SINGLE MCQ FORM */}
        {activeTab === "MCQ" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const singleQuestion: MCQQuestion = {
                id: `mcq_single_${Date.now()}`,
                clinicalVignette: vignette,
                questionText,
                options,
                correctIndex,
                bloomLevel,
                difficulty,
                explanation,
              };
              setParsedMCQs([singleQuestion]);
              setBatchTargetDeckTitle(`Đề Tự Tạo: ${questionText.slice(0, 30)}...`);
              handleSaveToLocalStorage();
            }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Tình Huống Ca Bệnh Lâm Sàng (Clinical Vignette - Tùy chọn)
                </label>
                <textarea
                  rows={3}
                  placeholder="VD: Bệnh nhân nam 62 tuổi, tiền căn tăng huyết áp và ĐTĐ type 2..."
                  value={vignette}
                  onChange={(e) => setVignette(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-border bg-card text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none italic"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Nội Dung Câu Hỏi Chính *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Dấu hiệu thăm khám lâm sàng nào có độ đặc hiệu cao nhất cho chẩn đoán suy tim?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-card text-xs sm:text-sm text-foreground font-semibold focus:ring-2 focus:ring-sky-500/50 outline-none"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Các Phương Án Lựa Chọn & Chọn Đáp Án Đúng
                </label>
                {options.map((opt, idx) => {
                  const label = ["A", "B", "C", "D"][idx];
                  const isCorrect = correctIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center gap-3 p-2.5 rounded-2xl border transition-all",
                        isCorrect
                          ? "border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30"
                          : "border-border bg-card"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setCorrectIndex(idx)}
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors",
                          isCorrect
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {label}
                      </button>
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...options];
                          newOpts[idx] = e.target.value;
                          setOptions(newOpts);
                        }}
                        className="flex-1 bg-transparent text-xs sm:text-sm text-foreground outline-none font-medium"
                      />
                      {isCorrect && (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950">
                          Đáp án ĐÚNG
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Lời Giải Thích Bệnh Học & Cơ Chế Lâm Sàng Chi Tiết *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Giải thích cơ chế bệnh sinh chi tiết..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-border bg-card text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-5 rounded-3xl border border-border bg-card shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                  <BrainCircuit className="h-4 w-4 text-indigo-600" />
                  <span>GẮN THANG ĐO TƯ DUY BLOOM</span>
                </div>
                <div className="space-y-2">
                  {bloomKeys.map((key) => {
                    const info = BLOOM_TAXONOMY_MAP[key];
                    const isSelected = bloomLevel === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setBloomLevel(key)}
                        className={cn(
                          "w-full text-left p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all",
                          isSelected
                            ? cn("border-2 shadow-xs", info.borderColor, info.bgLight, info.colorClass)
                            : "border-border/60 hover:bg-muted text-muted-foreground"
                        )}
                      >
                        <span>{info.vietnameseName}</span>
                        {isSelected && <CheckCircle2 className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Save className="h-4 w-4" />
                <span>Lưu Câu Hỏi Vào Ngân Hàng</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: MANUAL SINGLE FLASHCARD FORM */}
        {activeTab === "FLASHCARD" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const singleCard: FlashcardItem = {
                id: `fc_single_${Date.now()}`,
                front: fcFront,
                back: fcBack,
                hint: fcHint,
                bloomLevel: fcBloom,
                specialty: targetSpecialty,
              };
              setParsedFlashcards([singleCard]);
              setBatchTargetDeckTitle(`Thẻ: ${fcFront.slice(0, 30)}...`);
              handleSaveToLocalStorage();
            }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Mặt Trước (Thuật Ngữ / Triệu Chứng / Tên Hội Chứng) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="VD: Tam chứng Charcot trong nhiễm trùng đường mật gồm những dấu hiệu gì?"
                  value={fcFront}
                  onChange={(e) => setFcFront(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-border bg-card text-xs sm:text-sm text-foreground font-semibold focus:ring-2 focus:ring-purple-500/50 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Mặt Sau (Định Nghĩa / Cơ Chế Bệnh Sinh / Giải Pháp Xử Trí) *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="VD: 1. Đau hạ sườn phải\n2. Sốt (kèm lạnh run)\n3. Vàng da - Vàng mắt..."
                  value={fcBack}
                  onChange={(e) => setFcBack(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-border bg-card text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-purple-500/50 outline-none whitespace-pre-line"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Gợi Ý Lâm Sàng (Hint - Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="VD: Đau - Sốt - Vàng"
                  value={fcHint}
                  onChange={(e) => setFcHint(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-border bg-card text-xs sm:text-sm text-foreground outline-none"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-5 rounded-3xl border border-border bg-card shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                  <BrainCircuit className="h-4 w-4 text-purple-600" />
                  <span>GẮN CẤP ĐỘ BLOOM CHO THẺ</span>
                </div>
                <div className="space-y-2">
                  {bloomKeys.slice(0, 4).map((key) => {
                    const info = BLOOM_TAXONOMY_MAP[key];
                    const isSelected = fcBloom === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFcBloom(key)}
                        className={cn(
                          "w-full text-left p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all",
                          isSelected
                            ? cn("border-2 shadow-xs", info.borderColor, info.bgLight, info.colorClass)
                            : "border-border/60 hover:bg-muted text-muted-foreground"
                        )}
                      >
                        <span>{info.vietnameseName}</span>
                        {isSelected && <CheckCircle2 className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Save className="h-4 w-4" />
                  <span>Lưu Thẻ Flashcard 3D</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </AuthGuard>
  );
}
