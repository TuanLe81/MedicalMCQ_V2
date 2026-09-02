"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BloomLevel, MCQQuestion, FlashcardItem, DeckType, FolderNode, Deck } from "@/types";
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
  FolderTree,
  Plus,
  Play,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateStudioPage() {
  const router = useRouter();
  const { user, getUserFolders, saveUserFolders, saveUserDeck } = useAuth();
  const [activeTab, setActiveTab] = useState<"AI_GEN" | "BATCH" | "MCQ" | "FLASHCARD">("AI_GEN");

  // Destination Folder State
  const [availableFolders, setAvailableFolders] = useState<FolderNode[]>([]);
  const [targetFolderId, setTargetFolderId] = useState<string>("CREATE_NEW");
  const [newFolderName, setNewFolderName] = useState<string>("Thư Mục Y Khoa Mới");

  // Specialty States with "Mục Khác"
  const [targetSpecialty, setTargetSpecialty] = useState("Nội Tim Mạch");
  const [customSpecialty, setCustomSpecialty] = useState("");
  const [isCustomSpecialty, setIsCustomSpecialty] = useState(false);

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

  // IMPORT SUCCESS MODAL STATE
  const [successModalData, setSuccessModalData] = useState<{
    isOpen: boolean;
    title: string;
    type: "MCQ" | "FLASHCARD";
    itemCount: number;
    specialty: string;
    folderName: string;
    deckId: string;
  } | null>(null);

  // AI GENERATOR STATES
  const [aiTopic, setAiTopic] = useState("Hội Chứng Vành Cấp & Suy Tim");
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(4);
  const [aiBloomFocus, setAiBloomFocus] = useState<"ALL" | "CLINICAL">("ALL");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const bloomKeys = Object.keys(BLOOM_TAXONOMY_MAP) as BloomLevel[];

  // Load User Folders
  useEffect(() => {
    const folders = getUserFolders();
    setAvailableFolders(folders);
    if (folders.length > 0) {
      setTargetFolderId(folders[0].id);
    } else {
      setTargetFolderId("CREATE_NEW");
    }
  }, []);

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

  // Get active final specialty
  const getEffectiveSpecialty = () => {
    if (isCustomSpecialty && customSpecialty.trim()) {
      return customSpecialty.trim();
    }
    return targetSpecialty;
  };

  const handleSpecialtyChange = (val: string) => {
    if (val === "KHAC") {
      setIsCustomSpecialty(true);
    } else {
      setIsCustomSpecialty(false);
      setTargetSpecialty(val);
    }
  };

  // AI Generation Simulation
  const handleGenerateWithAI = () => {
    setIsAiGenerating(true);
    const spec = getEffectiveSpecialty();

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
              "Streptococcus pneumoniae (Phế cầu khuẩn)",
              "Mycoplasma pneumoniae",
              "Pseudomonas aeruginosa",
              "Klebsiella pneumoniae"
            ],
            correctIndex: 0,
            explanation: "Streptococcus pneumoniae là vi khuẩn Gram dương hình ngọn nến, là căn nguyên thường gặp nhất gây viêm phổi thùy cộng đồng điển hình với đàm màu rỉ sét."
          },
          {
            id: `mcq_ai_${Date.now()}_2`,
            clinicalVignette: "Bệnh nhân nam 65 tuổi, tiền sử COPD nhiều năm, nhập viện vì khó thở cấp. Khí máu động mạch (ABG): pH = 7.28, PaCO2 = 62 mmHg, PaO2 = 54 mmHg, HCO3- = 30 mEq/L.",
            questionText: "Rối loạn thăng bằng toan kiềm nào sau đây được xác định chính xác nhất trên kết quả khí máu này?",
            bloomLevel: "ANALYZING",
            difficulty: "HARD",
            options: [
              "Toan hô hấp cấp trên nền toan hô hấp mạn tính có bù một phần",
              "Kiềm chuyển hóa mất bù",
              "Toan chuyển hóa tăng khoảng trống Anion Gap",
              "Kiềm hô hấp cấp tính"
            ],
            correctIndex: 0,
            explanation: "pH < 7.35 và PaCO2 tăng cao > 45 mmHg chỉ ra Toan hô hấp. HCO3- tăng 30 mEq/L cho thấy thận đã có phản ứng bù trừ mạn tính trên nền đợt cấp COPD."
          }
        ];
      } else {
        generatedQuestions = [
          {
            id: `mcq_ai_${Date.now()}_1`,
            clinicalVignette: `Bệnh nhân đến khám vì bệnh lý liên quan đến ${aiTopic}. Khám lâm sàng và xét nghiệm bước đầu định hướng theo chuyên khoa ${spec}.`,
            questionText: `Dấu hiệu hoặc chỉ số cận lâm sàng nào sau đây có giá trị chẩn đoán xác định cao nhất trong bệnh cảnh ${aiTopic}?`,
            bloomLevel: aiBloomFocus === "CLINICAL" ? "ANALYZING" : "UNDERSTANDING",
            difficulty: "MEDIUM",
            options: [
              `Xét nghiệm chuyên biệt và chẩn đoán hình ảnh tiêu chuẩn vàng theo guideline ${spec}`,
              "Công thức máu bạch cầu tăng nhẹ không đặc hiệu",
              "Đo điện giải đồ cơ bản bình thường",
              "Chỉ số sinh hiệu huyết áp dao động nhẹ"
            ],
            correctIndex: 0,
            explanation: `Theo guideline thực hành lâm sàng ${spec}, việc xác định ${aiTopic} cần dựa trên tiêu chuẩn vàng chuyên khoa kết hợp tiền sử và bệnh sử chặt chẽ.`
          },
          {
            id: `mcq_ai_${Date.now()}_2`,
            clinicalVignette: `Bệnh nhân được chẩn đoán xác định ${aiTopic}, đang chuẩn bị khởi động phác đồ điều trị ban đầu.`,
            questionText: `Nhóm thuốc hoặc can thiệp nào là lựa chọn hàng đầu (First-line therapy) cho bệnh nhân này?`,
            bloomLevel: "APPLYING",
            difficulty: "MEDIUM",
            options: [
              `Phác đồ phối hợp thuốc bước 1 theo khuyến cáo cập nhật của ${spec}`,
              "Điều trị triệu chứng đơn thuần chưa can thiệp căn nguyên",
              "Sử dụng kháng sinh phổ rộng liều cao ngay lập tức",
              "Theo dõi ngoại trú không dùng thuốc"
            ],
            correctIndex: 0,
            explanation: `Khuyến cáo thực hành chuẩn chỉ định phác đồ bậc 1 nhằm tối ưu hóa hiệu quả điều trị và giảm thiểu biến chứng lâu dài.`
          }
        ];
      }

      setParsedMCQs(generatedQuestions);
      setBatchTargetDeckTitle(`Đề Thi AI: ${aiTopic} (${spec})`);
      setBatchType("MCQ");
      setActiveTab("BATCH");
      setIsAiGenerating(false);
    }, 1200);
  };

  // Parse Raw Text/JSON
  const handleParseRawInput = () => {
    setParseErrors([]);
    const raw = batchRawInput.trim();
    if (!raw) {
      setParseErrors(["Vui lòng dán nội dung văn bản câu hỏi trước khi phân tích!"]);
      return;
    }

    const spec = getEffectiveSpecialty();

    if (batchType === "MCQ") {
      if (batchFormat === "JSON") {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const formatted: MCQQuestion[] = parsed.map((item, idx) => ({
              id: `mcq_import_${Date.now()}_${idx}`,
              clinicalVignette: item.clinicalVignette || item.vignette || "",
              questionText: item.questionText || item.question || `Câu hỏi ${idx + 1}`,
              bloomLevel: (item.bloomLevel as BloomLevel) || "REMEMBERING",
              difficulty: item.difficulty || "MEDIUM",
              options: Array.isArray(item.options) ? item.options : ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
              correctIndex: typeof item.correctIndex === "number" ? item.correctIndex : 0,
              explanation: item.explanation || "Chưa có lời giải thích.",
            }));
            setParsedMCQs(formatted);
          } else {
            setParseErrors(["Dữ liệu JSON MCQ phải là một mảng []"]);
          }
        } catch (e) {
          setParseErrors(["Lỗi cú pháp JSON. Vui lòng kiểm tra lại cấu trúc."]);
        }
      } else {
        const chunks = raw.split(/---+|\n\s*\n\s*\n/).map((c) => c.trim()).filter(Boolean);
        const result: MCQQuestion[] = [];
        const errors: string[] = [];

        chunks.forEach((chunk, chunkIdx) => {
          const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
          let vignetteStr = "";
          let qText = "";
          let opts: string[] = [];
          let correctIdx = 0;
          let bloom: BloomLevel = "REMEMBERING";
          let exp = "";

          lines.forEach((line) => {
            if (line.startsWith("[Vignette]") || line.startsWith("[Tình huống]")) {
              vignetteStr = line.replace(/\[(Vignette|Tình huống)\]/i, "").trim();
            } else if (line.match(/^Câu hỏi[:.]|^Question[:.]/i)) {
              qText = line.replace(/^Câu hỏi[:.]|^Question[:.]/i, "").trim();
            } else if (line.match(/^[A-Ea-e][\.\:\)]\s*/)) {
              opts.push(line.replace(/^[A-Ea-e][\.\:\)]\s*/, "").trim());
            } else if (line.match(/^Đáp án[:.]|^Answer[:.]/i)) {
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
      if (batchFormat === "JSON") {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const formatted: FlashcardItem[] = parsed.map((item, idx) => ({
              id: `fc_import_${Date.now()}_${idx}`,
              front: item.front || `Thuật ngữ ${idx + 1}`,
              back: item.back || "Định nghĩa / Cơ chế",
              hint: item.hint || "",
              bloomLevel: (item.bloomLevel as BloomLevel) || "REMEMBERING",
              specialty: item.specialty || spec,
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
              specialty: spec,
            });
          }
        });

        setParsedFlashcards(result);
      }
    }
  };

  // SAVE DECK TO FOLDER TREE & USER STORAGE
  const handleSaveToLocalStorage = () => {
    const newDeckId = `custom_deck_${Date.now()}`;
    const isMCQ = batchType === "MCQ";
    const effectiveSpec = getEffectiveSpecialty();
    const count = isMCQ ? parsedMCQs.length : parsedFlashcards.length;

    let targetFolderTitle = "Thư Mục Mới";
    const matchedFolder = availableFolders.find((f) => f.id === targetFolderId);
    if (matchedFolder) {
      targetFolderTitle = matchedFolder.name;
    } else if (newFolderName) {
      targetFolderTitle = newFolderName;
    }

    const newDeck: Deck = {
      id: newDeckId,
      title: batchTargetDeckTitle || "Bộ Đề Y Khoa Mới",
      description: `Tạo với ${count} mục theo thang đo Bloom • ${effectiveSpec}`,
      type: isMCQ ? "MCQ" : "FLASHCARD",
      specialty: effectiveSpec,
      questions: isMCQ ? parsedMCQs : [],
      flashcards: !isMCQ ? parsedFlashcards : [],
      itemCount: count,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    // Save strictly scoped to current user and attached to destination folder
    saveUserDeck(newDeck, targetFolderId, newFolderName);

    // Open Import Success Modal
    setSuccessModalData({
      isOpen: true,
      title: newDeck.title,
      type: isMCQ ? "MCQ" : "FLASHCARD",
      itemCount: count,
      specialty: effectiveSpec,
      folderName: targetFolderTitle,
      deckId: newDeckId,
    });
  };

  const handleResetForm = () => {
    setSuccessModalData(null);
    setBatchRawInput("");
    setParsedMCQs([]);
    setParsedFlashcards([]);
    setBatchTargetDeckTitle("Bộ Đề Y Khoa Mới Import");
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
              <span>CREATOR STUDIO &amp; AI BATCH IMPORTER CHUẨN BLOOM 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              Biên Soạn &amp; Nạp Hàng Loạt Bằng AI
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Tự động lưu trực tiếp vào Cây Thư Mục của bạn, hỗ trợ tạo chuyên khoa tùy biến và phân loại chuẩn 6 bậc Bloom
            </p>
          </div>
        </div>

        {/* DESTINATION FOLDER & SPECIALTY CONFIGURATION BANNER */}
        <div className="p-6 rounded-3xl border border-sky-200 dark:border-sky-900/60 bg-gradient-to-br from-sky-500/5 via-card to-indigo-500/5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
            <FolderTree className="h-4 w-4" />
            <span>CẤU HÌNH ĐÍCH LƯU TRỮ VÀO CÂY THƯ MỤC &amp; CHUYÊN KHOA</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Folder Destination Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground flex items-center justify-between">
                <span>📁 Đích Thư Mục Trong &ldquo;Cây Thư Mục&rdquo; *</span>
                <span className="text-[10px] text-muted-foreground">Lưu vào folder riêng của bạn</span>
              </label>

              <select
                value={targetFolderId}
                onChange={(e) => setTargetFolderId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-sky-500/50"
              >
                <option value="CREATE_NEW">➕ [+] Tạo Thư Mục Mới Ngay...</option>
                {availableFolders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name} {f.isShared ? "(Được chia sẻ)" : ""}
                  </option>
                ))}
              </select>

              {targetFolderId === "CREATE_NEW" && (
                <div className="pt-1 animate-in fade-in">
                  <input
                    type="text"
                    required
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Nhập tên thư mục mới (VD: Nội Khoa Y4, Dược Lý, Cấp Cứu...)"
                    className="w-full px-3.5 py-2 rounded-xl border border-sky-300 dark:border-sky-800 bg-background text-xs font-semibold text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none"
                  />
                </div>
              )}
            </div>

            {/* Specialty Selector with Custom Option */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground flex items-center justify-between">
                <span>🩺 Chuyên Khoa Y Học *</span>
                <span className="text-[10px] text-muted-foreground">Có hỗ trợ tự gõ mục khác</span>
              </label>

              <select
                value={isCustomSpecialty ? "KHAC" : targetSpecialty}
                onChange={(e) => handleSpecialtyChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-sky-500/50"
              >
                {MEDICAL_SPECIALTIES.filter((s) => s !== "Tất cả chuyên khoa").map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                <option value="KHAC">✨ [Các mục khác] - Tự Nhập Chuyên Khoa Tùy Chọn...</option>
              </select>

              {isCustomSpecialty && (
                <div className="pt-1 animate-in fade-in">
                  <input
                    type="text"
                    required
                    value={customSpecialty}
                    onChange={(e) => setCustomSpecialty(e.target.value)}
                    placeholder="Nhập tên chuyên khoa của bạn (VD: Da Liễu, Chẩn Đoán Hình Ảnh, Răng Hàm Mặt, Y Học Cổ Truyền, Dinh Dưỡng...)"
                    className="w-full px-3.5 py-2 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-background text-xs font-semibold text-foreground focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

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
            <Wand2 className="h-4 w-4" />
            <span>🤖 Sinh Đề Bằng AI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("BATCH")}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all",
              activeTab === "BATCH"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <UploadCloud className="h-4 w-4" />
            <span>📥 Nạp Hàng Loạt (Word / PDF / Text)</span>
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
                placeholder="VD: Cơn Bão Giáp (Thyroid Storm), Viêm Tụy Cấp, Thuốc Kháng Đông NOAC, Đái Tháo Đường Thai Kỳ..."
                className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-sm font-semibold text-foreground focus:ring-2 focus:ring-indigo-500/50 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground">
                  Trọng Tâm Phân Phối Thang Đo Bloom
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setAiBloomFocus("ALL")}
                    className={cn(
                      "p-2.5 rounded-xl border text-left font-semibold transition-all",
                      aiBloomFocus === "ALL"
                        ? "border-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-foreground"
                        : "border-border bg-background text-muted-foreground"
                    )}
                  >
                    <div className="font-bold text-indigo-600">Trải Đều 6 Bậc</div>
                    <div className="text-[10px] text-muted-foreground">Nhớ đến Phân tích</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiBloomFocus("CLINICAL")}
                    className={cn(
                      "p-2.5 rounded-xl border text-left font-semibold transition-all",
                      aiBloomFocus === "CLINICAL"
                        ? "border-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-foreground"
                        : "border-border bg-background text-muted-foreground"
                    )}
                  >
                    <div className="font-bold text-indigo-600">Ca Lâm Sàng</div>
                    <div className="text-[10px] text-muted-foreground">Biện luận ca bệnh</div>
                  </button>
                </div>
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
                  <span>MediAI đang tra cứu phác đồ và thiết kế câu hỏi...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  <span>Tự Động Sinh Bộ Câu Hỏi &amp; Xem Trước</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 2: BATCH IMPORT */}
        {activeTab === "BATCH" && (
          <div className="space-y-6">
            <div className="p-6 sm:p-7 rounded-3xl border border-border bg-card shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <UploadCloud className="h-5 w-5" />
                  <span>KHUNG DÁN VĂN BẢN IMPORT HÀNG LOẠT</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBatchType("MCQ");
                      setBatchRawInput(sampleMCQText);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-border bg-muted/60 text-xs font-semibold hover:bg-muted"
                  >
                    Dán Mẫu MCQ Chuẩn
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBatchType("FLASHCARD");
                      setBatchRawInput(sampleFlashcardText);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-border bg-muted/60 text-xs font-semibold hover:bg-muted"
                  >
                    Dán Mẫu Flashcard
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Tên Bộ Đề Sẽ Tạo *
                </label>
                <input
                  type="text"
                  value={batchTargetDeckTitle}
                  onChange={(e) => setBatchTargetDeckTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-border bg-background text-sm font-semibold text-foreground focus:ring-2 focus:ring-emerald-500/50 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Dán Nội Dung Từ Word / PDF / Tài Liệu Vào Đây *
                </label>
                <textarea
                  rows={8}
                  value={batchRawInput}
                  onChange={(e) => setBatchRawInput(e.target.value)}
                  placeholder="Dán nội dung câu hỏi trắc nghiệm hoặc flashcard..."
                  className="w-full p-4 rounded-2xl border border-border bg-background font-mono text-xs text-foreground focus:ring-2 focus:ring-emerald-500/50 outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleParseRawInput}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <ListChecks className="h-4 w-4" />
                  <span>Phân Tích Dữ Liệu Ngay</span>
                </button>

                {(parsedMCQs.length > 0 || parsedFlashcards.length > 0) && (
                  <button
                    type="button"
                    onClick={handleSaveToLocalStorage}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <Save className="h-4 w-4" />
                    <span>Lưu Vào Cây Thư Mục ({batchType === "MCQ" ? parsedMCQs.length : parsedFlashcards.length} mục)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Parsed Previews */}
            {parsedMCQs.length > 0 && batchType === "MCQ" && (
              <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground">
                    Danh Sách {parsedMCQs.length} Câu Hỏi Đã Phân Tích Chuẩn Bloom:
                  </h3>
                  <button
                    type="button"
                    onClick={handleSaveToLocalStorage}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs"
                  >
                    Lưu Toàn Bộ Vào Cây Thư Mục
                  </button>
                </div>

                <div className="space-y-3">
                  {parsedMCQs.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-border bg-background text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-600">Câu #{idx + 1}</span>
                        <BloomBadge level={q.bloomLevel} size="sm" />
                      </div>
                      {q.clinicalVignette && (
                        <p className="italic text-muted-foreground">
                          &ldquo;{q.clinicalVignette}&rdquo;
                        </p>
                      )}
                      <p className="font-bold text-foreground">{q.questionText}</p>
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={cn(
                              "p-2 rounded-lg border",
                              oIdx === q.correctIndex
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold dark:bg-emerald-950/50 dark:text-emerald-200"
                                : "bg-muted/40 text-muted-foreground border-border"
                            )}
                          >
                            {String.fromCharCode(65 + oIdx)}. {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3 & 4: MANUAL SINGLE CREATION */}
        {activeTab === "MCQ" && (
          <div className="p-6 sm:p-7 rounded-3xl border border-border bg-card shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-sky-600 font-bold text-sm">
              <FilePlus className="h-5 w-5" />
              <span>BIÊN SOẠN CÂU HỎI TRẮC NGHIỆM ĐƠN LẺ</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground">
                Tình Huống Lâm Sàng (Clinical Vignette - Tùy chọn)
              </label>
              <textarea
                rows={2}
                value={vignette}
                onChange={(e) => setVignette(e.target.value)}
                placeholder="VD: Bệnh nhân nam 62 tuổi vào viện vì đau thắt ngực..."
                className="w-full p-3 rounded-xl border border-border bg-background text-xs outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground">
                Nội Dung Câu Hỏi *
              </label>
              <input
                type="text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="VD: Thuốc nào là chỉ định ưu tiên số 1?"
                className="w-full p-3 rounded-xl border border-border bg-background text-xs font-bold outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground">
                  Mức Độ Tư Duy Bloom
                </label>
                <select
                  value={bloomLevel}
                  onChange={(e) => setBloomLevel(e.target.value as BloomLevel)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-xs font-bold outline-none"
                >
                  {bloomKeys.map((k) => (
                    <option key={k} value={k}>
                      {BLOOM_TAXONOMY_MAP[k]?.vietnameseName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground">
                  Độ Khó
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-xs font-bold outline-none"
                >
                  <option value="EASY">Cơ Bản</option>
                  <option value="MEDIUM">Trung Bình</option>
                  <option value="HARD">Khó (Chuyên Sâu)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-muted-foreground">
                4 Phương Án Lựa Chọn (Tích tròn chọn đáp án đúng)
              </label>
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct_opt"
                    checked={correctIndex === idx}
                    onChange={() => setCorrectIndex(idx)}
                    className="h-4 w-4 text-sky-600"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...options];
                      updated[idx] = e.target.value;
                      setOptions(updated);
                    }}
                    placeholder={`Lựa chọn ${String.fromCharCode(65 + idx)}...`}
                    className="flex-1 p-2.5 rounded-xl border border-border bg-background text-xs"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground">
                Giải Thích Cơ Chế Bệnh Học
              </label>
              <textarea
                rows={2}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Giải thích vì sao đáp án này đúng theo cơ chế..."
                className="w-full p-3 rounded-xl border border-border bg-background text-xs outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                const newQ: MCQQuestion = {
                  id: `mcq_single_${Date.now()}`,
                  clinicalVignette: vignette,
                  questionText,
                  options,
                  correctIndex,
                  bloomLevel,
                  difficulty,
                  explanation,
                };
                setParsedMCQs([newQ, ...parsedMCQs]);
                setBatchType("MCQ");
                setActiveTab("BATCH");
              }}
              className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md"
            >
              Thêm Vào Danh Sách Bộ Đề &amp; Xem Lại
            </button>
          </div>
        )}

        {activeTab === "FLASHCARD" && (
          <div className="p-6 sm:p-7 rounded-3xl border border-border bg-card shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
              <Layers className="h-5 w-5" />
              <span>TẠO THẺ FLASHCARD 3D ĐƠN LẺ</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground">
                Mặt Trước (Thuật ngữ / Câu hỏi / Triệu chứng lâm sàng) *
              </label>
              <textarea
                rows={3}
                value={fcFront}
                onChange={(e) => setFcFront(e.target.value)}
                placeholder="VD: Tam chứng Charcot trong nhiễm trùng đường mật cấp..."
                className="w-full p-3 rounded-xl border border-border bg-background text-xs font-bold outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground">
                Mặt Sau (Định nghĩa / Cơ chế / Hướng xử trí) *
              </label>
              <textarea
                rows={3}
                value={fcBack}
                onChange={(e) => setFcBack(e.target.value)}
                placeholder="VD: 1. Đau hạ sườn phải - 2. Sốt lạnh run - 3. Vàng da..."
                className="w-full p-3 rounded-xl border border-border bg-background text-xs outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground">
                  Gợi Ý Lâm Sàng (Hint)
                </label>
                <input
                  type="text"
                  value={fcHint}
                  onChange={(e) => setFcHint(e.target.value)}
                  placeholder="Gợi ý vắn tắt..."
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground">
                  Mức Độ Bloom
                </label>
                <select
                  value={fcBloom}
                  onChange={(e) => setFcBloom(e.target.value as BloomLevel)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-xs font-bold outline-none"
                >
                  {bloomKeys.map((k) => (
                    <option key={k} value={k}>
                      {BLOOM_TAXONOMY_MAP[k]?.vietnameseName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const newFc: FlashcardItem = {
                  id: `fc_single_${Date.now()}`,
                  front: fcFront,
                  back: fcBack,
                  hint: fcHint,
                  bloomLevel: fcBloom,
                  specialty: getEffectiveSpecialty(),
                };
                setParsedFlashcards([newFc, ...parsedFlashcards]);
                setBatchType("FLASHCARD");
                setActiveTab("BATCH");
              }}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md"
            >
              Thêm Thẻ Vào Bộ Flashcard &amp; Xem Lại
            </button>
          </div>
        )}

        {/* IMPORT SUCCESS POPUP / MODAL */}
        {successModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-lg rounded-3xl border-2 border-emerald-500 bg-card p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 shadow-inner">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>NHẬP THÀNH CÔNG VÀO CÂY THƯ MỤC!</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-foreground">
                  Đã Lưu Thành Công Bộ Đề
                </h2>
              </div>

              {/* Information Cards */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold">Tên bộ đề:</span>
                  <span className="font-bold text-foreground text-sm">{successModalData.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold">Loại bộ đề:</span>
                  <span className="font-bold text-sky-600">
                    {successModalData.type === "MCQ" ? `Trắc Nghiệm MCQ (${successModalData.itemCount} câu)` : `Thẻ Flashcard 3D (${successModalData.itemCount} thẻ)`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold">Chuyên khoa:</span>
                  <span className="font-bold text-foreground">{successModalData.specialty}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border/60 pt-2">
                  <span className="text-muted-foreground font-semibold">Đích Cây Thư Mục:</span>
                  <span className="font-bold text-indigo-600">📁 {successModalData.folderName}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <Link
                  href={successModalData.type === "MCQ" ? `/quiz/${successModalData.deckId}` : `/flashcards/${successModalData.deckId}`}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-sky-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>Bắt Đầu Luyện Tập Ngay</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/folders"
                    className="py-3 rounded-2xl border border-border bg-card hover:bg-muted font-bold text-xs text-foreground flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <FolderTree className="h-4 w-4 text-sky-600" />
                    <span>Mở Cây Thư Mục</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="py-3 rounded-2xl border border-border bg-card hover:bg-muted font-bold text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tạo / Import Tiếp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
