import { FolderNode, Deck, MCQQuestion, FlashcardItem, UserProfile } from "@/types";

export const MOCK_USER: UserProfile = {
  id: "user_tuan_le_primary",
  name: "BS. Lê Anh Tuấn",
  email: "leanhtuan812006@gmail.com",
  username: "leanhtuan",
  role: "STUDENT",
  medicalSchool: "Đại học Y Dược TP.HCM",
  yearOfStudy: 4,
  streakCount: 1, // Clean initial checkin streak
  totalQuestionsAnswered: 0, // Clean initial stats
  totalCorrectAnswers: 0,
  overallAccuracy: 0,
  lastCheckInDate: "",
  bloomTaxonomyStats: {
    REMEMBERING: { total: 0, correct: 0, percentage: 0 },
    UNDERSTANDING: { total: 0, correct: 0, percentage: 0 },
    APPLYING: { total: 0, correct: 0, percentage: 0 },
    ANALYZING: { total: 0, correct: 0, percentage: 0 },
    EVALUATING: { total: 0, correct: 0, percentage: 0 },
    CREATING: { total: 0, correct: 0, percentage: 0 },
  },
};

export const MOCK_MCQ_QUESTIONS: MCQQuestion[] = [
  {
    id: "mcq_1",
    deckId: "deck_cardio_01",
    clinicalVignette: "Bệnh nhân nam 62 tuổi, tiền căn tăng huyết áp và đái tháo đường type 2, nhập viện vì khó thở tăng dần khi nằm đầu bằng (orthopnea) và phù hai chi dưới mức độ vừa. Khám lâm sàng: HA 150/90 mmHg, nhịp tim 98 ck/phút, tĩnh mạch cổ nổi tư thế 45 độ, ran ẩm rải rác 2 đáy phổi, T3 gallop ở mỏm tim. NT-proBNP huyết tương: 3.200 pg/mL.",
    questionText: "Dấu hiệu thăm khám lâm sàng nào sau đây có ĐỘ ĐẶC HIỆU (Specificity) cao nhất cho chẩn đoán suy tim sung huyết mất bù ở bệnh nhân này?",
    bloomLevel: "ANALYZING",
    difficulty: "HARD",
    options: [
      "A. Tiếng T3 Gallop (Third heart sound) ở mỏm tim",
      "B. Ran ẩm ở 2 đáy phổi khi nghe tim phổi",
      "C. Phù ấn lõm hai chi dưới đối xứng",
      "D. Nhịp tim nhanh lúc nghỉ (98 chu kỳ/phút)"
    ],
    correctIndex: 0,
    explanation: "Tiếng T3 Gallop và tĩnh mạch cổ nổi (JVD) là hai dấu hiệu lâm sàng có độ đặc hiệu rất cao (> 90-95%) trong chẩn đoán suy tim sung huyết có quá tải thể tích và áp lực làm đầy thất trái tăng cao. Trong khi đó, phù ngoại biên và ran phổi có độ nhạy vừa phải nhưng độ đặc hiệu thấp (dễ gặp trong bệnh phổi mạn hoặc suy van tĩnh mạch)."
  },
  {
    id: "mcq_2",
    deckId: "deck_cardio_01",
    clinicalVignette: "Bệnh nhân nữ 55 tuổi được chẩn đoán Suy tim phân suất tống máu giảm (HFrEF, EF = 32%), NYHA II. Bác sĩ đang xem xét bắt đầu phác đồ 'Tứ trụ' (Four Pillars of HFrEF) theo khuyến cáo ESC/AHA.",
    questionText: "Nhóm thuốc nào sau đây thuộc nhóm ức chế đồng vận chuyển Natri-Glucose 2 (SGLT2i) được chứng minh giảm tử vong do tim mạch và tái nhập viện vì suy tim kể cả khi bệnh nhân KHÔNG mắc đái tháo đường?",
    bloomLevel: "REMEMBERING",
    difficulty: "EASY",
    options: [
      "A. Empagliflozin và Dapagliflozin",
      "B. Metformin và Pioglitazone",
      "C. Gliclazide và Glimepiride",
      "D. Sitagliptin và Vildagliptin"
    ],
    correctIndex: 0,
    explanation: "Empagliflozin (thử nghiệm EMPEROR-Reduced/Preserved) và Dapagliflozin (thử nghiệm DAPA-HF/DELIVER) là 2 thuốc SGLT2i được FDA và các hội Tim mạch toàn cầu phê duyệt để điều trị suy tim bất kể tình trạng đái tháo đường. Đây là 1 trong 4 trụ cột điều trị suy tim."
  },
  {
    id: "mcq_3",
    deckId: "deck_cardio_01",
    clinicalVignette: "Bệnh nhân nam 68 tuổi sau nhồi máu cơ tim cấp thành trước rộng 3 tuần, đang dùng Enalapril 10mg/ngày. Tái khám xét nghiệm Creatinine huyết thanh tăng từ 1.1 mg/dL lên 1.8 mg/dL, Kali máu (K+) là 5.9 mEq/L. ECG thấy sóng T nhọn đối xứng.",
    questionText: "Dựa trên cơ chế tác động của hệ Renin-Angiotensin-Aldosterone (RAAS) lên huyết động cầu thận, giải thích nào sau đây là ĐÚNG về nguyên nhân làm tăng Creatinine và Kali máu khi dùng thuốc ức chế men chuyển (ACEi)?",
    bloomLevel: "UNDERSTANDING",
    difficulty: "MEDIUM",
    options: [
      "A. Giãn tiểu động mạch đi cầu thận làm giảm áp lực lọc cầu thận (GFR) và ức chế tiết Aldosterone làm giảm thải Kali ở ống lượn xa",
      "B. Co thắt tiểu động mạch đến làm tăng áp lực lọc cầu thận",
      "C. Tăng bài tiết Aldosterone làm giữ Kali và thải Natri",
      "D. Độc trực tiếp lên tế bào biểu mô ống lượn gần gây hoại tử ống thận cấp"
    ],
    correctIndex: 0,
    explanation: "Angiotensin II bình thường gây co tiểu động mạch đi (efferent arteriole) để duy trì GFR khi tưới máu thận giảm. Thuốc ACEi ngăn tạo Angiotensin II -> giãn tiểu động mạch đi -> giảm áp lực lọc cầu thận -> tăng Creatinine. Đồng thời ức chế Aldosterone -> giảm bài xuất K+ ở ống lượn xa và ống góp -> gây tăng Kali máu."
  }
];

export const MOCK_FLASHCARDS: FlashcardItem[] = [
  {
    id: "fc_1",
    deckId: "deck_pharm_01",
    front: "Tam chứng Charcot trong nhiễm trùng đường mật cấp gồm những triệu chứng kinh điển nào?",
    back: "1. Đau hạ sườn phải\n2. Sốt (kèm lạnh run / rét run)\n3. Vàng da - Vàng mắt\n(Xuất hiện theo đúng trình tự Đau -> Sốt -> Vàng)",
    hint: "Đau - Sốt - Vàng",
    bloomLevel: "REMEMBERING",
    specialty: "Ngoại Tiêu Hóa"
  },
  {
    id: "fc_2",
    deckId: "deck_pharm_01",
    front: "Ngũ chứng Reynolds trong viêm đường mật hoại tử / sốc nhiễm trùng đường mật gồm các dấu hiệu gì?",
    back: "Tam chứng Charcot (Đau + Sốt + Vàng da) CỘNG VỚI:\n4. Tụt huyết áp (Sốc nhiễm trùng / Shock)\n5. Rối loạn tri giác (Hôn mê, lơ mơ, bứt rứt)\n=> Chỉ định can thiệp dẫn lưu đường mật cấp cứu khẩn!",
    hint: "Charcot + Sốc + Tri giác",
    bloomLevel: "ANALYZING",
    specialty: "Ngoại Cấp Cứu"
  },
  {
    id: "fc_3",
    deckId: "deck_pharm_01",
    front: "Cơ chế tác dụng dược lý của Nitroglycerin (NTG) trong điều trị cơn đau thắt ngực cấp?",
    back: "NTG chuyển hóa giải phóng Nitric Oxide (NO) trong tế bào cơ trơn mạch máu -> kích hoạt Guanylyl Cyclase -> tăng nồng độ cGMP -> khử phosphoryl myosin light chain -> Giãn hệ tĩnh mạch là chủ yếu -> Giảm lượng máu tĩnh mạch về tim (Giảm tiền tải) -> Giảm sức căng thành thất trái và giảm nhu cầu tiêu thụ oxy của cơ tim.",
    hint: "Giải phóng NO -> cGMP -> Giảm tiền tải",
    bloomLevel: "UNDERSTANDING",
    specialty: "Dược Lý Tim Mạch"
  },
  {
    id: "fc_4",
    deckId: "deck_pharm_01",
    front: "Chỉ số Shock Index (SI) được tính như thế nào và ngưỡng báo động sốc mất máu / sốc tim?",
    back: "Shock Index (SI) = Tần số tim (HR) / Huyết áp tâm thu (SBP)\n- Bình thường: 0.5 - 0.7\n- SI >= 0.9 - 1.0: Cảnh báo huyết động không ổn định, sốc mất máu hoặc giảm thể tích tuần hoàn nặng dù huyết áp có thể chưa tụt rõ.",
    hint: "Nhịp tim / HA tâm thu (Ngưỡng >= 0.9)",
    bloomLevel: "APPLYING",
    specialty: "Hồi Sức Cấp Cứu"
  }
];

export const MOCK_FOLDERS: FolderNode[] = [
  {
    id: "folder_y4_noi",
    name: "Nội Khoa Lâm Sàng (Y4 - Bác Sĩ)",
    description: "Các module bệnh học Tim mạch, Hô hấp, Tiêu hóa, Thận học theo guideline mới nhất",
    color: "#0284c7",
    icon: "HeartPulse",
    isSystemMock: true,
    children: [
      {
        id: "folder_cardio",
        name: "Module Tim Mạch",
        description: "Suy tim HFrEF/HFpEF, Hội chứng vành cấp, Rối loạn nhịp tim",
        color: "#f43f5e",
        parentId: "folder_y4_noi",
        isSystemMock: true,
        children: [],
        decks: [
          {
            id: "deck_cardio_01",
            title: "Bộ Đề MCQ Suy Tim & Bệnh Mạch Vành (Demo)",
            description: "6 ca lâm sàng thực tế phân tích theo 6 mức độ Bloom: Nhớ, Hiểu, Vận dụng, Phân tích, Đánh giá, Sáng tạo",
            type: "MCQ",
            specialty: "Nội Tim Mạch",
            folderId: "folder_cardio",
            questions: MOCK_MCQ_QUESTIONS,
            itemCount: MOCK_MCQ_QUESTIONS.length,
            updatedAt: "2026-08-28",
            isSystemMock: true,
          }
        ]
      }
    ],
    decks: []
  },
  {
    id: "folder_pharm",
    name: "Dược Lý Lâm Sàng & Độc Chất Học",
    description: "Cơ chế tác dụng thuốc, tương tác thuốc nguy hiểm, phác đồ liều theo eGFR",
    color: "#8b5cf6",
    icon: "Pill",
    isSystemMock: true,
    children: [
      {
        id: "folder_pharm_cardio",
        name: "Thuốc Tim Mạch & Cấp Cứu",
        description: "Thuốc vận mạch, chống loạn nhịp, lợi tiểu, hạ áp",
        color: "#a855f7",
        parentId: "folder_pharm",
        isSystemMock: true,
        children: [],
        decks: [
          {
            id: "deck_pharm_01",
            title: "Flashcard Cơ Chế Thuốc Tim Mạch & Cấp Cứu (Demo)",
            description: "Thẻ ghi nhớ cơ chế bệnh học và dược lý 3D hỗ trợ Spaced Repetition",
            type: "FLASHCARD",
            specialty: "Dược Lý Lâm Sàng",
            folderId: "folder_pharm_cardio",
            flashcards: MOCK_FLASHCARDS,
            itemCount: MOCK_FLASHCARDS.length,
            updatedAt: "2026-08-28",
            isSystemMock: true,
          }
        ]
      }
    ],
    decks: []
  }
];
