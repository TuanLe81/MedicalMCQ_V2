"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BloomLevel, MCQQuestion, FlashcardItem, DeckType, FolderNode, Deck } from "@/types";
import { BLOOM_TAXONOMY_MAP, MEDICAL_SPECIALTIES } from "@/constants/bloom";
import { BloomBadge } from "@/components/mcq/bloom-badge";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth, DeckWithFolder } from "@/lib/auth-context";
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
  Check,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateStudioPage() {
  const router = useRouter();
  const {
    user,
    getUserFolders,
    saveUserFolders,
    saveUserDeck,
    getUserDecks,
    appendItemsToExistingDeck,
  } = useAuth();
  const [activeTab, setActiveTab] = useState<"AI_GEN" | "BATCH" | "MCQ" | "FLASHCARD">("AI_GEN");

  // Destination Mode: CREATE NEW DECK vs APPEND TO EXISTING DECK
  const [importTargetMode, setImportTargetMode] = useState<"NEW_DECK" | "APPEND_EXISTING">("NEW_DECK");
  const [appendTargetDeckId, setAppendTargetDeckId] = useState<string>("");
  const [existingUserDecks, setExistingUserDecks] = useState<DeckWithFolder[]>([]);

  // Destination Folder State with Full Hierarchy (Root + Subfolders)
  const [availableFolders, setAvailableFolders] = useState<FolderNode[]>([]);
  const [flattenedFolders, setFlattenedFolders] = useState<Array<{
    id: string;
    name: string;
    fullPath: string;
    depth: number;
    color?: string;
    isShared?: boolean;
    deckCount: number;
  }>>([]);
  const [targetFolderId, setTargetFolderId] = useState<string>("CREATE_NEW");
  const [newFolderName, setNewFolderName] = useState<string>("Thư Mục Y Khoa Mới");
  const [newFolderParentId, setNewFolderParentId] = useState<string>("ROOT");

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
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [batchGuideTab, setBatchGuideTab] = useState<"GUIDE" | "PROMPT">("GUIDE");

  // IMPORT SUCCESS MODAL STATE
  const [successModalData, setSuccessModalData] = useState<{
    isOpen: boolean;
    title: string;
    type: "MCQ" | "FLASHCARD";
    itemCount: number;
    addedCount?: number;
    specialty: string;
    folderName: string;
    deckId: string;
    isAppended?: boolean;
  } | null>(null);

  // AI GENERATOR STATES
  const [aiTopic, setAiTopic] = useState("Hội Chứng Vành Cấp & Suy Tim");
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(4);
  const [aiBloomFocus, setAiBloomFocus] = useState<"ALL" | "CLINICAL">("ALL");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const bloomKeys = Object.keys(BLOOM_TAXONOMY_MAP) as BloomLevel[];

  // Recursive helper to flatten folder hierarchy into an ordered list with depth & paths
  const flattenFolderHierarchy = (nodes: FolderNode[], depth = 0, parentPath = ""): Array<{
    id: string;
    name: string;
    fullPath: string;
    depth: number;
    color?: string;
    isShared?: boolean;
    deckCount: number;
  }> => {
    let list: Array<{
      id: string;
      name: string;
      fullPath: string;
      depth: number;
      color?: string;
      isShared?: boolean;
      deckCount: number;
    }> = [];

    for (const f of nodes) {
      const currentPath = parentPath ? `${parentPath} / ${f.name}` : f.name;
      list.push({
        id: f.id,
        name: f.name,
        fullPath: currentPath,
        depth,
        color: f.color,
        isShared: f.isShared,
        deckCount: (f.decks || []).length,
      });
      if (f.children && f.children.length > 0) {
        list = list.concat(flattenFolderHierarchy(f.children, depth + 1, currentPath));
      }
    }
    return list;
  };

  // Load User Folders and existing Decks for appending
  useEffect(() => {
    const folders = getUserFolders();
    setAvailableFolders(folders);
    const flat = flattenFolderHierarchy(folders);
    setFlattenedFolders(flat);
    if (flat.length > 0) {
      setTargetFolderId(flat[0].id);
    } else {
      setTargetFolderId("CREATE_NEW");
    }

    const allDecks = getUserDecks();
    setExistingUserDecks(allDecks);

    // Read URL query params if user clicked "Nạp thêm" from Quiz or Flashcards view
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlAppendId = params.get("appendDeckId");
      const urlType = params.get("type");
      if (urlAppendId) {
        setImportTargetMode("APPEND_EXISTING");
        setAppendTargetDeckId(urlAppendId);
        if (urlType === "MCQ" || urlType === "FLASHCARD") {
          setBatchType(urlType);
        }
        setActiveTab("BATCH");
      } else if (allDecks.length > 0) {
        setAppendTargetDeckId(allDecks[0].id);
      }
    }
  }, [user]);

  // STANDARDIZED TEMPLATES FOR MCQ & FLASHCARD TEXT IMPORT
  const SAMPLE_MCQ_TEXT = `[Tình huống] Bệnh nhân nam 62 tuổi, tiền căn tăng huyết áp và đái tháo đường, nhập viện vì khó thở khi nằm, phù 2 chi dưới, ran ẩm 2 đáy phổi, T3 Gallop ở mỏm tim.
Câu hỏi: Dấu hiệu thăm khám lâm sàng nào có độ đặc hiệu cao nhất cho chẩn đoán suy tim sung huyết ở bệnh nhân này?
A. Tiếng T3 Gallop ở mỏm tim
B. Ran ẩm ở 2 đáy phổi
C. Phù ấn lõm hai chi dưới đối xứng
D. Nhịp tim nhanh lúc nghỉ (98 ck/phút)
Đáp án: A
Bloom: ANALYZING
Giải thích: Tiếng T3 Gallop và tĩnh mạch cổ nổi (JVD) có độ đặc hiệu rất cao (> 95%) trong suy tim sung huyết có tăng áp lực làm đầy thất trái.
---
[Tình huống] Bệnh nhân nữ 55 tuổi được chẩn đoán HFrEF (EF = 32%), NYHA II.
Câu hỏi: Thuốc nào sau đây thuộc nhóm ức chế SGLT2 được chứng minh giảm tử vong do tim mạch kể cả khi KHÔNG mắc đái tháo đường?
A. Empagliflozin và Dapagliflozin
B. Metformin và Pioglitazone
C. Gliclazide và Glimepiride
D. Sitagliptin và Vildagliptin
Đáp án: A
Bloom: REMEMBERING
Giải thích: Empagliflozin (EMPEROR) và Dapagliflozin (DAPA-HF) là 2 thuốc SGLT2i trụ cột điều trị suy tim được FDA phê duyệt.`;

  const SAMPLE_FLASHCARD_BLOCK_TEXT = `Mặt trước: Tam chứng Charcot trong nhiễm trùng đường mật cấp
Mặt sau: 1. Đau hạ sườn phải
2. Sốt (kèm lạnh run)
3. Vàng da - Vàng mắt
Gợi ý: Đau - Sốt - Vàng
Bloom: REMEMBERING
---
Mặt trước: Ngũ chứng Reynolds trong viêm đường mật hoại tử
Mặt sau: Tam chứng Charcot + Tụt huyết áp (Shock) + Rối loạn tri giác
Gợi ý: Shock + Tri giác
Bloom: ANALYZING
---
Mặt trước: Cơ chế tác dụng của Nitroglycerin trong cơn đau thắt ngực
Mặt sau: Chuyển thành NO -> kích hoạt Guanylyl cyclase -> tăng cGMP -> giãn hệ tĩnh mạch -> giảm tiền tải
Gợi ý: Giảm tiền tải qua NO / cGMP
Bloom: UNDERSTANDING`;

  const SAMPLE_FLASHCARD_PIPE_TEXT = `Tam chứng Charcot trong nhiễm trùng đường mật | 1. Đau hạ sườn phải | Đau - Sốt - Vàng | REMEMBERING
Ngũ chứng Reynolds trong viêm đường mật hoại tử | Tam chứng Charcot + Tụt huyết áp + Tri giác | Shock + Tri giác | ANALYZING
Cơ chế tác dụng của Nitroglycerin | Giãn hệ tĩnh mạch, giảm tiền tải qua NO / cGMP | Giảm tiền tải | UNDERSTANDING`;

  // STANDARDIZED AI PROMPTS FOR 1-CLICK COPY
  const MCQ_AI_PROMPT_TEMPLATE = `Bạn là một Giảng viên Y khoa và Chuyên gia Soạn thảo Đề thi Đại học Y Dược.
Hãy biên soạn giúp tôi [SỐ_LƯỢNG_CÂU, ví dụ: 5] câu hỏi trắc nghiệm MCQ về chủ đề: "[CHỦ_ĐỀ_HOẶC_BÀI_HỌC_CỦA_BẠN]" theo chuẩn 6 bậc tư duy Bloom (Nhớ, Hiểu, Vận dụng, Phân tích, Đánh giá, Sáng tạo).

QUAN TRỌNG: Hãy xuất kết quả theo ĐÚNG định dạng văn bản chuẩn hóa sau đây (không thêm bất kỳ lời chào hay giải thích ngoài lề) để tôi có thể dán hàng loạt trực tiếp vào hệ thống y khoa MediMind:

[Tình huống] (Tùy chọn: Bệnh cảnh lâm sàng chi tiết nếu có)
Câu hỏi: (Nội dung câu hỏi rõ ràng)
A. (Phương án A)
B. (Phương án B)
C. (Phương án C)
D. (Phương án D)
Đáp án: (Điền chữ cái A, B, C hoặc D)
Bloom: (Chọn 1 trong các mức: REMEMBERING, UNDERSTANDING, APPLYING, ANALYZING, EVALUATING, CREATING)
Giải thích: (Giải thích cơ chế bệnh học, tại sao đáp án này đúng và các phương án khác sai theo Guideline cập nhật)
---
(Tiếp tục câu hỏi tiếp theo và ngăn cách các câu bằng 3 dấu gạch ngang ---)`;

  const FLASHCARD_AI_PROMPT_TEMPLATE = `Bạn là một Giảng viên Y khoa và Chuyên gia Học tập Spaced Repetition.
Hãy tạo giúp tôi [SỐ_LƯỢNG_THẺ, ví dụ: 10] thẻ ghi nhớ Flashcard y khoa về chủ đề: "[CHỦ_ĐỀ_HOẶC_BÀI_HỌC_CỦA_BẠN]" để sinh viên ôn tập theo chuẩn Thang đo Bloom.

QUAN TRỌNG: Hãy xuất kết quả theo ĐÚNG định dạng văn bản chuẩn hóa sau đây (không thêm bất kỳ lời chào hay giải thích ngoài lề) để tôi có thể dán hàng loạt trực tiếp vào hệ thống y khoa MediMind:

Mặt trước: (Thuật ngữ, triệu chứng, cơ chế tác dụng hoặc ca bệnh ngắn)
Mặt sau: (Định nghĩa, cơ chế bệnh sinh, phác đồ điều trị hoặc chẩn đoán xác định)
Gợi ý: (Từ khóa ngắn gợi nhớ, mnemonic lâm sàng)
Bloom: (Chọn 1 trong các mức: REMEMBERING, UNDERSTANDING, APPLYING, ANALYZING, EVALUATING, CREATING)
---
(Tiếp tục thẻ tiếp theo và ngăn cách các thẻ bằng 3 dấu gạch ngang ---)`;

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

  // 1-Click Copy AI Prompt
  const handleCopyAiPrompt = (type: "MCQ" | "FLASHCARD") => {
    const text = type === "MCQ" ? MCQ_AI_PROMPT_TEMPLATE : FLASHCARD_AI_PROMPT_TEMPLATE;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopyToast(`Đã sao chép prompt chuẩn cho AI (${type === "MCQ" ? "Trắc nghiệm MCQ" : "Thẻ Flashcard"})! Hãy dán vào ChatGPT / Gemini / Claude.`);
      setTimeout(() => setCopyToast(null), 4500);
    }
  };

  // Quick Paste Sample Text
  const handlePasteSample = (type: "MCQ" | "FLASHCARD") => {
    setBatchType(type);
    if (type === "MCQ") {
      setBatchRawInput(SAMPLE_MCQ_TEXT);
      setBatchTargetDeckTitle("Bộ Đề Trắc Nghiệm Tim Mạch Mẫu");
    } else {
      setBatchRawInput(SAMPLE_FLASHCARD_BLOCK_TEXT);
      setBatchTargetDeckTitle("Bộ Thẻ Flashcard Bệnh Học Mẫu");
    }
    setParseErrors([]);
  };

  // Robust Text & JSON Parser for MCQ & Flashcard
  const handleParseRawInput = () => {
    setParseErrors([]);
    const raw = batchRawInput.trim();
    if (!raw) {
      setParseErrors(["Vui lòng dán nội dung văn bản câu hỏi hoặc thẻ ghi nhớ trước khi bấm phân tích!"]);
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
            setParseErrors(["Dữ liệu JSON MCQ phải là một mảng mảng []"]);
          }
        } catch (e) {
          setParseErrors(["Lỗi cú pháp JSON. Vui lòng kiểm tra lại cấu trúc."]);
        }
      } else {
        // Text format: split chunks by --- or === or ___ or triple blank lines
        const chunks = raw.split(/(?:\r?\n\s*){0,2}(?:---+|===+|___+)(?:\s*\r?\n){1,2}|\n\s*\n\s*\n/).map((c) => c.trim()).filter(Boolean);
        const result: MCQQuestion[] = [];
        const errors: string[] = [];

        chunks.forEach((chunk, chunkIdx) => {
          const rawLines = chunk.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
          let vignetteStr = "";
          let qText = "";
          let opts: string[] = [];
          let correctIdx = 0;
          let bloom: BloomLevel = "REMEMBERING";
          let exp = "";
          let inExplanation = false;

          rawLines.forEach((line) => {
            // Strip markdown bold **text** or __text__ from header markers
            const clean = line.replace(/^\*\*([^*]+)\*\*/, "$1").replace(/^__([^_]+)__/, "$1").trim();

            // Vignette
            if (clean.match(/^(\[?(Tình huống|Vignette|Bệnh cảnh|Ca bệnh)\]?[:.]?)/i)) {
              vignetteStr = clean.replace(/^(\[?(Tình huống|Vignette|Bệnh cảnh|Ca bệnh)\]?[:.]?)\s*/i, "").trim();
              inExplanation = false;
            }
            // Question Text
            else if (clean.match(/^(Câu hỏi|Câu \d+|Question \d*|\d+[\.:\)])[:.]?/i)) {
              qText = clean.replace(/^(Câu hỏi|Câu \d+|Question \d*|\d+[\.:\)])[:.]?\s*/i, "").trim();
              inExplanation = false;
            }
            // Options: A., B., C., D. or A), (A), A-
            else if (clean.match(/^(\(?[A-Ea-e]\)?[\.\:\-\/]|Option\s*[A-Ea-e][:.]?)\s*/i)) {
              const optContent = clean.replace(/^(\(?[A-Ea-e]\)?[\.\:\-\/]|Option\s*[A-Ea-e][:.]?)\s*/i, "").trim();
              opts.push(optContent);
              inExplanation = false;
            }
            // Answer: Đáp án: A or Key: A
            else if (clean.match(/^(Đáp án đúng|Đáp án|Key|Answer|ĐA)[:.]?/i)) {
              const ansRaw = clean.replace(/^(Đáp án đúng|Đáp án|Key|Answer|ĐA)[:.]?\s*/i, "").trim().toUpperCase();
              const firstLetterMatch = ansRaw.match(/[A-E]/);
              if (firstLetterMatch) {
                const letter = firstLetterMatch[0];
                const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };
                correctIdx = map[letter] ?? 0;
              }
              inExplanation = false;
            }
            // Bloom level
            else if (clean.match(/^(Bloom|Bậc Bloom|Mức độ Bloom|Mức độ|Cấp độ|Level)[:.]?/i)) {
              const bStr = clean.replace(/^(Bloom|Bậc Bloom|Mức độ Bloom|Mức độ|Cấp độ|Level)[:.]?\s*/i, "").trim().toUpperCase();
              if (bloomKeys.includes(bStr as BloomLevel)) {
                bloom = bStr as BloomLevel;
              } else if (bStr.includes("NHỚ") || bStr.includes("REMEMBER")) bloom = "REMEMBERING";
              else if (bStr.includes("HIỂU") || bStr.includes("UNDERSTAND")) bloom = "UNDERSTANDING";
              else if (bStr.includes("VẬN DỤNG") || bStr.includes("APPLY")) bloom = "APPLYING";
              else if (bStr.includes("PHÂN TÍCH") || bStr.includes("ANALYZE")) bloom = "ANALYZING";
              else if (bStr.includes("ĐÁNH GIÁ") || bStr.includes("EVALUATE")) bloom = "EVALUATING";
              else if (bStr.includes("SÁNG TẠO") || bStr.includes("CREATE")) bloom = "CREATING";
              inExplanation = false;
            }
            // Explanation
            else if (clean.match(/^(Giải thích chi tiết|Giải thích|Hướng dẫn giải|Rationale|Cơ chế|Lời giải)[:.]?/i)) {
              exp = clean.replace(/^(Giải thích chi tiết|Giải thích|Hướng dẫn giải|Rationale|Cơ chế|Lời giải)[:.]?\s*/i, "").trim();
              inExplanation = true;
            }
            // Continuation lines
            else {
              if (inExplanation) {
                exp += (exp ? " " : "") + clean;
              } else if (!qText && !clean.startsWith("[")) {
                qText = clean;
              } else if (qText && opts.length === 0) {
                qText += " " + clean;
              }
            }
          });

          if (!qText && opts.length === 0) {
            errors.push(`Khối câu hỏi số ${chunkIdx + 1} thiếu nội dung câu hỏi hoặc phương án trả lời.`);
          } else if (opts.length < 2) {
            errors.push(`Khối câu hỏi số ${chunkIdx + 1} ("${(qText || "Câu hỏi").slice(0, 35)}...") cần ít nhất 2 phương án lựa chọn (A, B...).`);
          } else {
            result.push({
              id: `mcq_txt_${Date.now()}_${chunkIdx}`,
              clinicalVignette: vignetteStr,
              questionText: qText || `Câu hỏi lâm sàng số ${chunkIdx + 1}`,
              options: opts.length >= 2 ? opts : ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
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
      // FLASHCARD BATCH IMPORT
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
        const hasPipe = raw.includes("|") && raw.split(/\r?\n/).some((l) => l.includes("|"));
        const result: FlashcardItem[] = [];
        const errors: string[] = [];

        if (!hasPipe) {
          // Block format: split by --- or === or triple blank lines
          const chunks = raw.split(/(?:\r?\n\s*){0,2}(?:---+|===+|___+)(?:\s*\r?\n){1,2}|\n\s*\n\s*\n/).map((c) => c.trim()).filter(Boolean);

          chunks.forEach((chunk, chunkIdx) => {
            const rawLines = chunk.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
            let front = "";
            let back = "";
            let hint = "";
            let bloom: BloomLevel = "REMEMBERING";
            let currentField: "FRONT" | "BACK" | "HINT" | null = null;

            rawLines.forEach((line) => {
              const clean = line.replace(/^\*\*([^*]+)\*\*/, "$1").replace(/^__([^_]+)__/, "$1").trim();

              if (clean.match(/^(Mặt trước|Mặt 1|Front|Term|Thuật ngữ|Câu hỏi)[:.]?/i)) {
                front = clean.replace(/^(Mặt trước|Mặt 1|Front|Term|Thuật ngữ|Câu hỏi)[:.]?\s*/i, "").trim();
                currentField = "FRONT";
              } else if (clean.match(/^(Mặt sau|Mặt 2|Back|Definition|Định nghĩa|Cơ chế|Đáp án)[:.]?/i)) {
                back = clean.replace(/^(Mặt sau|Mặt 2|Back|Definition|Định nghĩa|Cơ chế|Đáp án)[:.]?\s*/i, "").trim();
                currentField = "BACK";
              } else if (clean.match(/^(Gợi ý|Hint|Mẹo lâm sàng|Mẹo)[:.]?/i)) {
                hint = clean.replace(/^(Gợi ý|Hint|Mẹo lâm sàng|Mẹo)[:.]?\s*/i, "").trim();
                currentField = "HINT";
              } else if (clean.match(/^(Bloom|Bậc Bloom|Mức độ|Level)[:.]?/i)) {
                const bStr = clean.replace(/^(Bloom|Bậc Bloom|Mức độ|Level)[:.]?\s*/i, "").trim().toUpperCase();
                if (bloomKeys.includes(bStr as BloomLevel)) {
                  bloom = bStr as BloomLevel;
                } else if (bStr.includes("NHỚ") || bStr.includes("REMEMBER")) bloom = "REMEMBERING";
                else if (bStr.includes("HIỂU") || bStr.includes("UNDERSTAND")) bloom = "UNDERSTANDING";
                else if (bStr.includes("VẬN DỤNG") || bStr.includes("APPLY")) bloom = "APPLYING";
                else if (bStr.includes("PHÂN TÍCH") || bStr.includes("ANALYZE")) bloom = "ANALYZING";
                else if (bStr.includes("ĐÁNH GIÁ") || bStr.includes("EVALUATE")) bloom = "EVALUATING";
                else if (bStr.includes("SÁNG TẠO") || bStr.includes("CREATE")) bloom = "CREATING";
                currentField = null;
              } else {
                if (currentField === "FRONT") front += (front ? " " : "") + clean;
                else if (currentField === "BACK") back += (back ? " " : "") + clean;
                else if (currentField === "HINT") hint += (hint ? " " : "") + clean;
              }
            });

            if (!front || !back) {
              errors.push(`Thẻ số ${chunkIdx + 1} thiếu trường "Mặt trước:" hoặc "Mặt sau:".`);
            } else {
              result.push({
                id: `fc_txt_${Date.now()}_${chunkIdx}`,
                front,
                back,
                hint,
                bloomLevel: bloom,
                specialty: spec,
              });
            }
          });
        } else {
          // Pipe format: line by line
          const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
          lines.forEach((line, idx) => {
            if (!line.includes("|")) return;
            const parts = line.split("|").map((p) => p.trim());
            if (parts.length >= 2) {
              const front = parts[0];
              const back = parts[1];
              const hint = parts[2] || "";
              const bloomStr = (parts[3] || "REMEMBERING").toUpperCase();
              let bLevel: BloomLevel = "REMEMBERING";
              if (bloomKeys.includes(bloomStr as BloomLevel)) {
                bLevel = bloomStr as BloomLevel;
              } else if (bloomStr.includes("NHỚ")) bLevel = "REMEMBERING";
              else if (bloomStr.includes("HIỂU")) bLevel = "UNDERSTANDING";
              else if (bloomStr.includes("VẬN DỤNG")) bLevel = "APPLYING";
              else if (bloomStr.includes("PHÂN TÍCH")) bLevel = "ANALYZING";

              result.push({
                id: `fc_pipe_${Date.now()}_${idx}`,
                front,
                back,
                hint,
                bloomLevel: bLevel,
                specialty: spec,
              });
            } else {
              errors.push(`Dòng số ${idx + 1} không đủ 2 cột (Mặt trước | Mặt sau).`);
            }
          });
        }

        setParsedFlashcards(result);
        setParseErrors(errors);
      }
    }
  };

  // SAVE DECK TO FOLDER TREE & USER STORAGE (NEW DECK OR APPEND EXISTING)
  const handleSaveToLocalStorage = () => {
    const isMCQ = batchType === "MCQ";
    const effectiveSpec = getEffectiveSpecialty();
    const count = isMCQ ? parsedMCQs.length : parsedFlashcards.length;

    if (count === 0) {
      setParseErrors(["Chưa có câu hỏi hoặc thẻ nào được phân tích thành công để lưu!"]);
      return;
    }

    // MODE 1: APPEND ITEMS INTO AN EXISTING DECK
    if (importTargetMode === "APPEND_EXISTING") {
      if (!appendTargetDeckId) {
        setParseErrors(["Vui lòng chọn bộ đề mà bạn muốn nạp tiếp câu hỏi/thẻ vào!"]);
        return;
      }

      const res = appendItemsToExistingDeck(
        appendTargetDeckId,
        isMCQ ? parsedMCQs : undefined,
        !isMCQ ? parsedFlashcards : undefined
      );

      if (!res.success) {
        setParseErrors([res.error || "Lỗi khi nạp bổ sung vào bộ đề!"]);
        return;
      }

      // Open Import Success Modal
      setSuccessModalData({
        isOpen: true,
        title: res.updatedDeck?.title || "Bộ Đề",
        type: isMCQ ? "MCQ" : "FLASHCARD",
        itemCount: res.updatedDeck?.itemCount || count,
        addedCount: count,
        specialty: res.updatedDeck?.specialty || effectiveSpec,
        folderName: res.folderName || "Cây Thư Mục",
        deckId: appendTargetDeckId,
        isAppended: true,
      });

      // Refresh existing decks
      setExistingUserDecks(getUserDecks());
      return;
    }

    // MODE 2: CREATE BRAND NEW DECK
    const newDeckId = `custom_deck_${Date.now()}`;
    let targetFolderTitle = "Thư Mục Mới";
    if (targetFolderId === "CREATE_NEW") {
      const parentObj = flattenedFolders.find((f) => f.id === newFolderParentId);
      if (parentObj) {
        targetFolderTitle = `${parentObj.fullPath} / ${newFolderName}`;
      } else {
        targetFolderTitle = newFolderName;
      }
    } else {
      const matchedFolder = flattenedFolders.find((f) => f.id === targetFolderId);
      if (matchedFolder) {
        targetFolderTitle = matchedFolder.fullPath;
      }
    }

    const newDeck: Deck = {
      id: newDeckId,
      title: batchTargetDeckTitle || (isMCQ ? "Bộ Đề Trắc Nghiệm Mới" : "Bộ Thẻ Flashcard Mới"),
      description: `Tạo với ${count} mục theo thang đo Bloom • ${effectiveSpec}`,
      type: isMCQ ? "MCQ" : "FLASHCARD",
      specialty: effectiveSpec,
      questions: isMCQ ? parsedMCQs : [],
      flashcards: !isMCQ ? parsedFlashcards : [],
      itemCount: count,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    // Save strictly scoped to current user and attached to destination folder (root or subfolder)
    saveUserDeck(newDeck, targetFolderId, newFolderName, newFolderParentId);

    // Open Import Success Modal
    setSuccessModalData({
      isOpen: true,
      title: newDeck.title,
      type: isMCQ ? "MCQ" : "FLASHCARD",
      itemCount: count,
      specialty: effectiveSpec,
      folderName: targetFolderTitle,
      deckId: newDeckId,
      isAppended: false,
    });

    // Refresh existing decks
    setExistingUserDecks(getUserDecks());
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

        {/* DESTINATION CONFIGURATION BANNER (CREATE NEW VS APPEND TO EXISTING DECK) */}
        <div className="p-6 rounded-3xl border border-sky-200 dark:border-sky-900/60 bg-gradient-to-br from-sky-500/5 via-card to-indigo-500/5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
              <FolderTree className="h-4 w-4" />
              <span>CẤU HÌNH ĐÍCH ĐẾN CÂY THƯ MỤC &amp; BỘ ĐỀ</span>
            </div>

            {/* Target Mode Toggle */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-background/80 border border-border">
              <button
                type="button"
                onClick={() => setImportTargetMode("NEW_DECK")}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all",
                  importTargetMode === "NEW_DECK"
                    ? "bg-sky-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Tạo Bộ Đề Mới</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setImportTargetMode("APPEND_EXISTING");
                  const matching = existingUserDecks.filter((d) => d.type === batchType);
                  if (matching.length > 0 && !matching.some((d) => d.id === appendTargetDeckId)) {
                    setAppendTargetDeckId(matching[0].id);
                  }
                }}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all",
                  importTargetMode === "APPEND_EXISTING"
                    ? "bg-purple-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Nạp Tiếp Vào Bộ Đề Đã Có ({existingUserDecks.filter((d) => d.type === batchType).length})</span>
              </button>
            </div>
          </div>

          {/* MODE 1: APPEND TO EXISTING DECK */}
          {importTargetMode === "APPEND_EXISTING" && (
            <div className="space-y-3 animate-in fade-in">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground flex items-center justify-between">
                  <span>🎯 Chọn Bộ Đề {batchType === "MCQ" ? "Trắc Nghiệm MCQ" : "Thẻ Flashcard"} Cần Nạp Thêm *</span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                    {existingUserDecks.filter((d) => d.type === batchType).length} bộ đề {batchType} trong Cây Thư Mục
                  </span>
                </label>

                <select
                  value={appendTargetDeckId}
                  onChange={(e) => setAppendTargetDeckId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-purple-300 dark:border-purple-800 bg-background text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="">-- Bấm để chọn bộ đề cần nạp thêm câu hỏi/thẻ --</option>
                  {existingUserDecks
                    .filter((d) => d.type === batchType)
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        📁 [{d.folderName || "Thư mục gốc"}] • {d.title} ({d.itemCount} {d.type === "MCQ" ? "câu" : "thẻ"})
                      </option>
                    ))}
                </select>
              </div>

              {/* Selected Target Live Information Card */}
              {(() => {
                const targetDeck = existingUserDecks.find((d) => d.id === appendTargetDeckId);
                const newItemsCount = batchType === "MCQ" ? parsedMCQs.length : parsedFlashcards.length;
                if (!targetDeck) {
                  return (
                    <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-center text-xs text-muted-foreground">
                      Chưa chọn bộ đề nào hoặc chưa có bộ đề {batchType === "MCQ" ? "MCQ" : "Flashcard"} nào. Bạn có thể chọn &ldquo;Tạo Bộ Đề Mới&rdquo; bên trên!
                    </div>
                  );
                }

                return (
                  <div className="p-4 rounded-2xl bg-card border border-purple-200 dark:border-purple-900 shadow-2xs space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 truncate">
                        <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white font-black text-[10px]">
                          {targetDeck.type}
                        </span>
                        <span className="font-extrabold text-foreground text-sm truncate">{targetDeck.title}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 font-bold text-xs text-purple-700 dark:text-purple-300">
                        {targetDeck.specialty}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                      <span className="flex items-center gap-1.5 truncate">
                        <FolderTree className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                        <span>Nguồn Cây Thư Mục: <strong className="text-foreground">{targetDeck.folderName || "Thư Mục Gốc"}</strong></span>
                      </span>
                      <span className="font-bold text-purple-600 shrink-0">
                        Hiện có: {targetDeck.itemCount} {targetDeck.type === "MCQ" ? "câu hỏi" : "thẻ"}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/80 text-[11px] text-purple-900 dark:text-purple-200 font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span>Số lượng dự kiến sau khi nạp:</span>
                      </span>
                      <span className="font-black text-xs text-emerald-600 dark:text-emerald-400">
                        {targetDeck.itemCount} + {newItemsCount} = {targetDeck.itemCount + newItemsCount} {targetDeck.type === "MCQ" ? "câu" : "thẻ"}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* MODE 2: CREATE NEW DECK */}
          {importTargetMode === "NEW_DECK" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
              {/* Folder Destination Selector with Full Tree & Subfolders */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground flex items-center justify-between">
                  <span>📁 Đích Thư Mục Trong &ldquo;Cây Thư Mục&rdquo; *</span>
                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">Hiển thị toàn bộ thư mục &amp; thư mục con</span>
                </label>

                <select
                  value={targetFolderId}
                  onChange={(e) => setTargetFolderId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-sky-500/50"
                >
                  <option value="CREATE_NEW">➕ [+] Tạo Thư Mục Mới (Tùy Chọn Vị Trí)...</option>
                  {flattenedFolders.length > 0 && (
                    <optgroup label="─── TOÀN BỘ CÂY THƯ MỤC CỦA BẠN (CẢ THƯ MỤC CON) ───">
                      {flattenedFolders.map((f) => {
                        const indent = f.depth > 0 ? "　".repeat(f.depth) + "↳ 📂 " : "📁 ";
                        const levelTag = f.depth === 0 ? "[Gốc]" : `[Con cấp ${f.depth}]`;
                        return (
                          <option key={f.id} value={f.id}>
                            {indent}{f.name} {levelTag} ({f.fullPath}) {f.isShared ? "• [Được chia sẻ]" : ""}
                          </option>
                        );
                      })}
                    </optgroup>
                  )}
                </select>

                {/* Selected Destination Breadcrumb Preview */}
                {targetFolderId !== "CREATE_NEW" && (
                  <div className="p-2 rounded-xl bg-sky-50/80 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-[11px] text-sky-800 dark:text-sky-200 flex items-center justify-between gap-2 animate-in fade-in">
                    <div className="flex items-center gap-1.5 truncate">
                      <FolderTree className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                      <span className="truncate">
                        Đích đến: <strong>{flattenedFolders.find((f) => f.id === targetFolderId)?.fullPath || "Thư mục"}</strong>
                      </span>
                    </div>
                    <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-md bg-sky-600 text-white font-bold">
                      {flattenedFolders.find((f) => f.id === targetFolderId)?.depth === 0 ? "Thư mục gốc" : `Cấp con ${flattenedFolders.find((f) => f.id === targetFolderId)?.depth}`}
                    </span>
                  </div>
                )}

                {/* Create New Folder with Parent Destination Option */}
                {targetFolderId === "CREATE_NEW" && (
                  <div className="p-3 rounded-2xl bg-card border border-sky-200 dark:border-sky-900 shadow-xs space-y-2.5 animate-in fade-in">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-foreground">Tên thư mục mới *</label>
                      <input
                        type="text"
                        required
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Nhập tên thư mục mới (VD: Nội Khoa Y4, Dược Lý, Cấp Cứu...)"
                        className="w-full px-3 py-2 rounded-xl border border-sky-300 dark:border-sky-800 bg-background text-xs font-semibold text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-foreground">Vị trí tạo thư mục mới trong Cây Thư Mục:</label>
                      <select
                        value={newFolderParentId}
                        onChange={(e) => setNewFolderParentId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-sky-500/50"
                      >
                        <option value="ROOT">📁 Đặt ở Thư Mục Gốc (Cấp cao nhất)</option>
                        {flattenedFolders.map((f) => {
                          const indent = f.depth > 0 ? "　".repeat(f.depth) + "↳ 📂 " : "📁 ";
                          return (
                            <option key={`parent_${f.id}`} value={f.id}>
                              {indent}Làm thư mục con của: {f.name} ({f.fullPath})
                            </option>
                          );
                        })}
                      </select>
                    </div>
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
          )}
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

        {/* TAB 2: BATCH IMPORT (MCQ & FLASHCARD STANDARDIZED) */}
        {activeTab === "BATCH" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 1. SEPARATED SEGMENTED CONTROL: MCQ vs FLASHCARD */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 rounded-2xl bg-muted/60 border border-border">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setBatchType("MCQ");
                    setBatchTargetDeckTitle("Bộ Đề Trắc Nghiệm Y Khoa Mới");
                    setParseErrors([]);
                  }}
                  className={cn(
                    "flex-1 sm:flex-initial px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all",
                    batchType === "MCQ"
                      ? "bg-sky-600 text-white shadow-md shadow-sky-600/25 scale-[1.02]"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                  )}
                >
                  <FileText className="h-4 w-4" />
                  <span>📝 Import Trắc Nghiệm MCQ Hàng Loạt</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBatchType("FLASHCARD");
                    setBatchTargetDeckTitle("Bộ Thẻ Flashcard Bệnh Học Mới");
                    setParseErrors([]);
                  }}
                  className={cn(
                    "flex-1 sm:flex-initial px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all",
                    batchType === "FLASHCARD"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/25 scale-[1.02]"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                  )}
                >
                  <Layers className="h-4 w-4" />
                  <span>🎴 Import Thẻ Ghi Nhớ Flashcard Hàng Loạt</span>
                </button>
              </div>

              {/* Quick Sample Loader */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handlePasteSample(batchType)}
                  className="px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-muted/80 text-xs font-bold text-foreground flex items-center gap-1.5 shadow-2xs transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Dán Mẫu {batchType === "MCQ" ? "MCQ" : "Flashcard"}</span>
                </button>
              </div>
            </div>

            {/* Copy Notification Toast */}
            {copyToast && (
              <div className="p-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between gap-3 shadow-lg shadow-emerald-600/20 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>{copyToast}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCopyToast(null)}
                  className="text-white/80 hover:text-white text-xs underline"
                >
                  Đóng
                </button>
              </div>
            )}

            {/* 2. STANDARDIZATION & AI PROMPT ACCORDION / TABS */}
            <div className="p-5 sm:p-6 rounded-3xl border border-sky-200 dark:border-sky-900/60 bg-gradient-to-br from-sky-500/5 via-card to-indigo-500/5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  <span className="font-bold text-xs uppercase tracking-wider text-foreground">
                    CHUẨN HÓA ĐỊNH DẠNG &amp; PROMPT CHO AI ({batchType === "MCQ" ? "TRẮC NGHIỆM MCQ" : "THẺ FLASHCARD"})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setBatchGuideTab("GUIDE")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                      batchGuideTab === "GUIDE"
                        ? "bg-background text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    📐 Cú Pháp Chuẩn Hóa
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchGuideTab("PROMPT")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                      batchGuideTab === "PROMPT"
                        ? "bg-background text-indigo-600 dark:text-indigo-400 shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Bot className="h-3.5 w-3.5" />
                    <span>Prompt Gửi Cho AI</span>
                  </button>
                </div>
              </div>

              {/* View 1: Syntax Guide */}
              {batchGuideTab === "GUIDE" && (
                <div className="space-y-3 animate-in fade-in">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Hệ thống tự động nhận diện thông minh các từ khóa tiếng Việt và tiếng Anh, không phân biệt chữ hoa/thường, tự động loại bỏ ký hiệu markdown bold.
                  </p>

                  {batchType === "MCQ" ? (
                    <div className="p-4 rounded-2xl bg-background border border-border font-mono text-[11px] sm:text-xs text-foreground space-y-1.5 overflow-x-auto leading-relaxed">
                      <div className="text-muted-foreground">// Mẫu cú pháp chuẩn cho mỗi câu MCQ (phân cách các câu bằng ---)</div>
                      <div className="text-sky-600 font-bold">[Tình huống] Bệnh nhân nam 62 tuổi vào viện vì khó thở... (tùy chọn)</div>
                      <div className="text-foreground font-bold">Câu hỏi: Dấu hiệu nào có độ đặc hiệu cao nhất cho chẩn đoán suy tim?</div>
                      <div className="text-emerald-700 dark:text-emerald-400">A. Tiếng T3 Gallop ở mỏm tim</div>
                      <div className="text-muted-foreground">B. Ran ẩm ở 2 đáy phổi</div>
                      <div className="text-muted-foreground">C. Phù ấn lõm hai chi dưới đối xứng</div>
                      <div className="text-muted-foreground">D. Nhịp tim nhanh lúc nghỉ (98 ck/phút)</div>
                      <div className="text-amber-600 dark:text-amber-400 font-bold">Đáp án: A <span className="text-[10px] text-muted-foreground font-normal">(hỗ trợ điền A, B, C, D)</span></div>
                      <div className="text-purple-600 dark:text-purple-400 font-bold">Bloom: ANALYZING <span className="text-[10px] text-muted-foreground font-normal">(REMEMBERING, UNDERSTANDING, APPLYING, ANALYZING, EVALUATING, CREATING hoặc Nhớ, Hiểu, Vận dụng, Phân tích...)</span></div>
                      <div className="text-blue-600 dark:text-blue-400">Giải thích: Tiếng T3 Gallop và JVD có độ đặc hiệu &gt; 95% theo Guideline ESC...</div>
                      <div className="text-muted-foreground font-bold">---</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-background border border-border font-mono text-[11px] sm:text-xs text-foreground space-y-1.5 overflow-x-auto leading-relaxed">
                        <div className="text-muted-foreground">// Cách 1: Định dạng theo khối thẻ (Khuyên dùng - Dễ đọc nhất cho cả người và AI)</div>
                        <div className="text-purple-600 font-bold">Mặt trước: Tam chứng Charcot trong nhiễm trùng đường mật cấp</div>
                        <div className="text-emerald-700 dark:text-emerald-400 font-bold">Mặt sau: 1. Đau hạ sườn phải - 2. Sốt rét run - 3. Vàng da vàng mắt</div>
                        <div className="text-amber-600 dark:text-amber-400">Gợi ý: Đau - Sốt - Vàng (tùy chọn)</div>
                        <div className="text-blue-600 dark:text-blue-400">Bloom: REMEMBERING (tùy chọn)</div>
                        <div className="text-muted-foreground font-bold">---</div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-muted/30 border border-border font-mono text-[11px] text-foreground space-y-1 overflow-x-auto">
                        <div className="text-muted-foreground">// Cách 2: Định dạng 1 dòng dùng dấu gạch đứng ( | )</div>
                        <div>Mặt trước | Mặt sau | Gợi ý (tùy chọn) | Bloom (tùy chọn)</div>
                        <div className="text-muted-foreground italic">VD: Tam chứng Charcot | 1. Đau HSP 2. Sốt 3. Vàng da | Đau-Sốt-Vàng | REMEMBERING</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* View 2: Ready AI Prompt for ChatGPT / Gemini / Claude */}
              {batchGuideTab === "PROMPT" && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      Bấm nút bên dưới để copy prompt chuẩn, dán vào <strong>ChatGPT, Claude, hoặc Google Gemini</strong> để AI tự động xuất câu hỏi đúng 100% cú pháp.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCopyAiPrompt(batchType)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 shrink-0 transition-all hover:scale-105"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>📋 Sao Chép Prompt Cho AI</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-background border border-indigo-200 dark:border-indigo-900 font-mono text-[11px] text-muted-foreground max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {batchType === "MCQ" ? MCQ_AI_PROMPT_TEMPLATE : FLASHCARD_AI_PROMPT_TEMPLATE}
                  </div>
                </div>
              )}
            </div>

            {/* 3. BATCH INPUT WORKSPACE */}
            <div className="p-6 sm:p-7 rounded-3xl border border-border bg-card shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
                <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                  <UploadCloud className="h-5 w-5 text-sky-600" />
                  <span>
                    KHUNG DÁN VĂN BẢN IMPORT {batchType === "MCQ" ? "TRẮC NGHIỆM MCQ" : "THẺ FLASHCARD"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyAiPrompt(batchType)}
                    className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 flex items-center gap-1.5 transition-all"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Prompt AI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePasteSample(batchType)}
                    className="px-3 py-1.5 rounded-xl border border-border bg-muted/60 text-xs font-semibold hover:bg-muted"
                  >
                    Dán Mẫu Thử
                  </button>
                </div>
              </div>

              {/* Target Deck Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Tên Bộ Đề Sẽ Tạo *</span>
                  <span className="text-[10px] text-muted-foreground">Sẽ hiển thị trong Phòng luyện &amp; Cây thư mục</span>
                </label>
                <input
                  type="text"
                  required
                  value={batchTargetDeckTitle}
                  onChange={(e) => setBatchTargetDeckTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-border bg-background text-sm font-semibold text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none"
                />
              </div>

              {/* Main Paste Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Dán Nội Dung Từ AI / Word / PDF / Tài Liệu Vào Đây *</span>
                  <span className="text-[10px] font-normal text-muted-foreground">
                    {batchRawInput.length > 0 ? `${batchRawInput.split("\n").length} dòng • ${batchRawInput.length} ký tự` : "Chưa có dữ liệu"}
                  </span>
                </div>
                <textarea
                  rows={9}
                  value={batchRawInput}
                  onChange={(e) => setBatchRawInput(e.target.value)}
                  placeholder={
                    batchType === "MCQ"
                      ? "Dán danh sách câu hỏi trắc nghiệm vào đây...\n\n[Tình huống] ...\nCâu hỏi: ...\nA. ...\nB. ...\nC. ...\nD. ...\nĐáp án: A\nBloom: ANALYZING\nGiải thích: ...\n---"
                      : "Dán danh sách thẻ ghi nhớ vào đây...\n\nMặt trước: ...\nMặt sau: ...\nGợi ý: ...\nBloom: REMEMBERING\n---"
                  }
                  className="w-full p-4 rounded-2xl border border-border bg-background font-mono text-xs text-foreground focus:ring-2 focus:ring-sky-500/50 outline-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleParseRawInput}
                  className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all hover:scale-105"
                >
                  <ListChecks className="h-4 w-4" />
                  <span>Phân Tích Dữ Liệu Ngay</span>
                </button>

                {(parsedMCQs.length > 0 || parsedFlashcards.length > 0) && (
                  <button
                    type="button"
                    onClick={handleSaveToLocalStorage}
                    className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all hover:scale-105"
                  >
                    <Save className="h-4 w-4" />
                    <span>
                      Lưu Vào Cây Thư Mục ({batchType === "MCQ" ? parsedMCQs.length : parsedFlashcards.length} {batchType === "MCQ" ? "câu MCQ" : "thẻ Flashcard"})
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* 4. ERROR ALERTS (IF ANY) */}
            {parseErrors.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>Phát hiện {parseErrors.length} lưu ý khi phân tích dữ liệu:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                  {parseErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 5. PARSED PREVIEW FOR MCQ */}
            {parsedMCQs.length > 0 && batchType === "MCQ" && (
              <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Đã Phân Tích Thành Công {parsedMCQs.length} Câu Hỏi Trắc Nghiệm:</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Kiểm tra lại nội dung và đáp án trước khi bấm lưu vào Cây Thư Mục
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveToLocalStorage}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 self-end sm:self-center transition-all hover:scale-105"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Lưu Toàn Bộ ({parsedMCQs.length} câu)</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {parsedMCQs.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-border bg-background text-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sky-600">Câu #{idx + 1}</span>
                        <BloomBadge level={q.bloomLevel} size="sm" />
                      </div>

                      {q.clinicalVignette && (
                        <div className="p-2.5 rounded-xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-900/60 italic text-muted-foreground leading-relaxed">
                          &ldquo;{q.clinicalVignette}&rdquo;
                        </div>
                      )}

                      <p className="font-bold text-foreground text-xs sm:text-sm">{q.questionText}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={cn(
                              "p-2.5 rounded-xl border flex items-center gap-2 font-medium",
                              oIdx === q.correctIndex
                                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 font-bold shadow-2xs"
                                : "bg-muted/30 text-muted-foreground border-border"
                            )}
                          >
                            <span className={cn(
                              "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black shrink-0",
                              oIdx === q.correctIndex
                                ? "bg-emerald-600 text-white"
                                : "bg-muted text-muted-foreground"
                            )}>
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="truncate">{opt}</span>
                            {oIdx === q.correctIndex && (
                              <Check className="h-3.5 w-3.5 text-emerald-600 ml-auto shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <div className="pt-1.5 border-t border-border/50 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
                          <span className="font-bold text-foreground shrink-0">💡 Giải thích:</span>
                          <span>{q.explanation}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. PARSED PREVIEW FOR FLASHCARD */}
            {parsedFlashcards.length > 0 && batchType === "FLASHCARD" && (
              <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-600" />
                      <span>Đã Phân Tích Thành Công {parsedFlashcards.length} Thẻ Ghi Nhớ Flashcard:</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Kiểm tra mặt trước và mặt sau thẻ trước khi lưu vào Cây Thư Mục
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveToLocalStorage}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 self-end sm:self-center transition-all hover:scale-105"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Lưu Toàn Bộ ({parsedFlashcards.length} thẻ)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {parsedFlashcards.map((fc, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-background text-xs space-y-3 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-purple-600">Thẻ Flashcard #{idx + 1}</span>
                        <BloomBadge level={fc.bloomLevel} size="sm" />
                      </div>

                      {/* Front */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase text-muted-foreground">Mặt trước (Front / Thuật ngữ):</div>
                        <div className="p-2.5 rounded-xl bg-muted/40 border border-border font-bold text-foreground">
                          {fc.front}
                        </div>
                      </div>

                      {/* Back */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">Mặt sau (Back / Định nghĩa &amp; Cơ chế):</div>
                        <div className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/60 text-foreground leading-relaxed whitespace-pre-line">
                          {fc.back}
                        </div>
                      </div>

                      {/* Hint */}
                      {fc.hint && (
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-lg border border-amber-200/60">
                          <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                          <span>Gợi ý: {fc.hint}</span>
                        </div>
                      )}
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
                <div className={cn(
                  "mx-auto flex h-16 w-16 items-center justify-center rounded-3xl shadow-inner",
                  successModalData.isAppended
                    ? "bg-purple-100 dark:bg-purple-950 text-purple-600"
                    : "bg-emerald-100 dark:bg-emerald-950 text-emerald-600"
                )}>
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                  successModalData.isAppended
                    ? "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200"
                    : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200"
                )}>
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>
                    {successModalData.isAppended ? "ĐÃ NẠP TIẾP THÀNH CÔNG VÀO BỘ ĐỀ!" : "NHẬP THÀNH CÔNG VÀO CÂY THƯ MỤC!"}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-foreground">
                  {successModalData.isAppended
                    ? `Đã Bổ Sung +${successModalData.addedCount} ${successModalData.type === "MCQ" ? "Câu Hỏi Mới" : "Thẻ Mới"}`
                    : "Đã Lưu Thành Công Bộ Đề"}
                </h2>
              </div>

              {/* Information Cards */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold">Tên bộ đề:</span>
                  <span className="font-bold text-foreground text-sm">{successModalData.title}</span>
                </div>
                {successModalData.isAppended && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-semibold">Đã nạp bổ sung:</span>
                    <span className="font-bold text-emerald-600 text-sm">
                      +{successModalData.addedCount} {successModalData.type === "MCQ" ? "câu hỏi mới" : "thẻ mới"}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold">Tổng hiện có trong bộ đề:</span>
                  <span className="font-extrabold text-sky-600">
                    {successModalData.type === "MCQ" ? `${successModalData.itemCount} câu hỏi` : `${successModalData.itemCount} thẻ ghi nhớ`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold">Chuyên khoa:</span>
                  <span className="font-bold text-foreground">{successModalData.specialty}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border/60 pt-2">
                  <span className="text-muted-foreground font-semibold">Vị trí Cây Thư Mục:</span>
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
