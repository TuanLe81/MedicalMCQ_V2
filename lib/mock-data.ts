import { FolderNode, Deck, MCQQuestion, FlashcardItem, UserProfile } from "@/types";

export const MOCK_USER: UserProfile = {
  id: "user_bs_y4_01",
  name: "BS. Lê Anh Tuấn",
  email: "tuan.le@med.edu.vn",
  role: "STUDENT",
  medicalSchool: "Đại học Y Dược TP.HCM (Khoa Y - Y4)",
  yearOfStudy: 4,
  streakCount: 14,
  totalQuestionsAnswered: 342,
  overallAccuracy: 84.5,
  bloomTaxonomyStats: {
    REMEMBERING: { total: 110, correct: 98, percentage: 89 },
    UNDERSTANDING: { total: 85, correct: 74, percentage: 87 },
    APPLYING: { total: 65, correct: 54, percentage: 83 },
    ANALYZING: { total: 50, correct: 40, percentage: 80 },
    EVALUATING: { total: 20, correct: 15, percentage: 75 },
    CREATING: { total: 12, correct: 8, percentage: 67 },
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
      "A. ACEi gây giãn tiểu động mạch đi cầu thận (efferent arteriole) làm giảm áp lực lọc GFR, đồng thời giảm bài tiết Aldosterone làm giảm thải K+ tại ống lượn xa",
      "B. ACEi gây co tiểu động mạch đến cầu thận làm giảm lưu lượng máu thận và tăng tái hấp thu K+",
      "C. ACEi kích thích trực tiếp thụ thể AT1 gây co thắt mạch thận diện rộng",
      "D. ACEi ức chế men Na+/K+-ATPase tại màng đáy tế bào ống thận"
    ],
    correctIndex: 0,
    explanation: "Angiotensin II bình thường có tác dụng co tiểu động mạch đi (efferent arteriole) để duy trì áp lực lọc cầu thận (GFR). Thuốc ACEi ngăn tạo Angiotensin II -> giãn tiểu động mạch đi -> giảm áp lực lọc qua màng cầu thận -> tăng nhẹ Creatinine. Đồng thời do giảm Aldosterone (vốn làm nhiệm vụ thải K+ đổi Na+ ở ống lượn xa và ống góp) -> giữ K+ trong máu gây tăng Kali máu."
  },
  {
    id: "mcq_4",
    deckId: "deck_cardio_01",
    clinicalVignette: "Bệnh nhân nam 70 tuổi, rung nhĩ cơn kịch phát, có tiền sử tăng huyết áp (HA 145/85), đái tháo đường type 2, chưa từng đột quỵ hay TIA, không có bệnh mạch máu ngoại biên, giới tính Nam.",
    questionText: "Tính điểm CHA2DS2-VASc cho bệnh nhân này và đưa ra quyết định điều trị kháng đông đường uống phù hợp nhất theo guideline?",
    bloomLevel: "APPLYING",
    difficulty: "MEDIUM",
    options: [
      "A. Điểm CHA2DS2-VASc = 2 điểm -> Khuyến cáo dùng kháng đông trực tiếp đường uống (DOAC/NOAC) nhóm I",
      "B. Điểm CHA2DS2-VASc = 1 điểm -> Chỉ cần dùng Aspirin 81mg/ngày",
      "C. Điểm CHA2DS2-VASc = 0 điểm -> Không cần điều trị kháng đông",
      "D. Điểm CHA2DS2-VASc = 3 điểm -> Bắt buộc dùng Kháng vitamin K (Warfarin) kết hợp Clopidogrel"
    ],
    correctIndex: 0,
    explanation: "Tính điểm CHA2DS2-VASc: Tuổi 70 (65-74 tuổi) = 1 điểm; Tăng huyết áp = 1 điểm; Đái tháo đường = 1 điểm; Nam giới = 0 điểm -> Tổng cộng = 3 điểm (hoặc ít nhất >= 2 ở nam). Với điểm >= 2 ở nam, khuyến cáo Nhóm I là dùng thuốc chống đông đường uống, ưu tiên NOAC/DOAC (Apixaban, Rivaroxaban, Dabigatran, Edoxaban) hơn là Warfarin trừ khi có hẹp van 2 lá cơ học."
  },
  {
    id: "mcq_5",
    deckId: "deck_cardio_01",
    clinicalVignette: "Bệnh nhân nữ 45 tuổi vào viện vì sốt cao dao động 2 tuần kèm mệt mỏi, sụt cân. Khám thấy âm thổi tâm thu mới xuất hiện 3/6 ở mỏm tim, nốt Osler ở đầu ngón tay. Siêu âm tim qua thực quản (TEE) phát hiện khối sùi kích thước 12mm ở lá trước van 2 lá kèm hở van 2 lá nặng cấp tính, huyết động bắt đầu suy tim ứ huyết không đáp ứng thuốc lợi tiểu.",
    questionText: "Đánh giá can thiệp tiếp theo nào là TỐI ƯU và CẤP THIẾT NHẤT để cải thiện tiên lượng sống còn cho bệnh nhân này?",
    bloomLevel: "EVALUATING",
    difficulty: "HARD",
    options: [
      "A. Chỉ định phẫu thuật tim cấp cứu/khẩn cấp thay hoặc sửa van 2 lá kèm kháng sinh đường tĩnh mạch trúng đích",
      "B. Tiếp tục trì hoãn phẫu thuật đợi đủ 6 tuần kháng sinh tĩnh mạch liều cao",
      "C. Chỉ định chụp CT mạch vành trước khi xét điều trị",
      "D. Dùng thuốc tiêu sợi huyết Alteplase để làm tan khối sùi van tim"
    ],
    correctIndex: 0,
    explanation: "Theo khuyến cáo ESC/AHA về Viêm nội tâm mạc nhiễm trùng (IE), các chỉ định phẫu thuật khẩn cấp gồm: (1) Suy tim cấp do hở van nặng; (2) Nhiễm trùng không kiểm soát được; (3) Nguy cơ tắc mạch cao (kích thước sùi > 10mm kèm hở van nặng). Việc chờ đợi kháng sinh 6 tuần sẽ làm tăng nguy cơ tử vong do phù phổi cấp hoặc thuyên tắc mạch não."
  },
  {
    id: "mcq_6",
    deckId: "deck_cardio_01",
    clinicalVignette: "Trong bối cảnh bệnh nhân suy tim nặng giai đoạn cuối kháng trị mọi thuốc tối ưu, khoa Tim mạch can thiệp muốn xây dựng một phác đồ can thiệp đa mô thức tích hợp thiết bị hỗ trợ tâm thất (LVAD) và cầu nối ghép tim (Bridge to Transplant).",
    questionText: "Bước thiết kế chiến lược quản lý toàn diện nào sau đây thể hiện sự phối hợp tối ưu giữa phòng ngừa biến chứng huyết khối và kiểm soát nhiễm trùng đường dẫn (driveline infection)?",
    bloomLevel: "CREATING",
    difficulty: "HARD",
    options: [
      "A. Thiết lập quy trình chăm sóc chân ống dẫn vô khuẩn nghiêm ngặt, theo dõi INR mục tiêu 2.0-3.0 kèm thuốc kháng kết tập tiểu cầu, và xây dựng kế hoạch tập phục hồi chức năng tim mạch sớm",
      "B. Dùng kháng sinh dự phòng toàn thân kéo dài suốt đời và duy trì INR > 4.0",
      "C. Cấm bệnh nhân vận động hoàn toàn và không dùng bất kỳ thuốc chống đông nào",
      "D. Chỉ kiểm tra khi có biểu hiện sốt hoặc chảy máu nặng trên lâm sàng"
    ],
    correctIndex: 0,
    explanation: "Chiến lược tối ưu cho bệnh nhân LVAD đòi hỏi cá thể hóa: duy trì chống đông kép cân bằng giữa nguy cơ chảy máu và tắc bơm (INR 2.0-3.0 + Antiplatelet), kết hợp quy trình vô khuẩn chân ống dẫn và phục hồi chức năng để chuẩn bị cho ca ghép tim."
  }
];

export const MOCK_FLASHCARDS: FlashcardItem[] = [
  {
    id: "fc_1",
    deckId: "deck_pharm_01",
    front: "Tam chứng Charcot (Charcot's Triad) trong nhiễm trùng đường mật gồm những dấu hiệu gì?",
    back: "1. Đau hạ sườn phải\n2. Sốt (kèm lạnh run)\n3. Vàng da - Vàng mắt\n(Gặp trong viêm đường mật cấp do sỏi). Ngũ chứng Reynolds có thêm: Tụt huyết áp (Shock) + Rối loạn tri giác.",
    hint: "Đau - Sốt - Vàng",
    bloomLevel: "REMEMBERING",
    specialty: "Ngoại Tiêu Hóa"
  },
  {
    id: "fc_2",
    deckId: "deck_pharm_01",
    front: "Cơ chế tác dụng của thuốc Nitroglycerin trong cơn đau thắt ngực là gì?",
    back: "Nitroglycerin chuyển thành Nitric Oxide (NO) -> kích hoạt Guanylyl cyclase -> tăng cGMP -> giãn cơ trơn mạch máu (chủ yếu là hệ tĩnh mạch) -> Giảm tiền tải (Preload) -> Giảm công tim và nhu cầu oxy cơ tim, đồng thời giãn mạch vành.",
    hint: "Giảm tiền tải qua trung gian NO / cGMP",
    bloomLevel: "UNDERSTANDING",
    specialty: "Dược Lý Lâm Sàng"
  },
  {
    id: "fc_3",
    deckId: "deck_pharm_01",
    front: "Quy tắc 4 bước đọc điện tâm đồ (ECG) cấp cứu đối với Nhồi máu cơ tim ST chênh lên (STEMI)?",
    back: "1. Tần số & Nhịp\n2. Đoạn ST chênh lên >= 1mm ở >= 2 chuyển đạo liên tiếp (hoặc >= 1.5-2.5mm ở V2-V3)\n3. Tìm hình ảnh soi gương (Reciprocal changes)\n4. Xác định vùng thành tim bị tổn thương (Trước, Dưới, Bên, Thất phải).",
    hint: "ST chênh ở 2 chuyển đạo liên tiếp cùng vùng",
    bloomLevel: "APPLYING",
    specialty: "Nội Tim Mạch"
  },
  {
    id: "fc_4",
    deckId: "deck_pharm_01",
    front: "Phân biệt Đái tháo nhạt do trung ương (Central DI) và Đái tháo nhạt do thận (Nephrogenic DI) bằng nghiệm pháp gì?",
    back: "Dùng 'Nghiệm pháp nhịn nước' (Water Deprivation Test) sau đó tiêm Desmopressin (dDAVP):\n- Central DI: Tăng áp lực thẩm thấu nước tiểu (> 50%) sau tiêm dDAVP.\n- Nephrogenic DI: Không đáp ứng / tăng rất ít (< 10%) vì thụ thể V2 tại thận bị trơ hoặc đột biến.",
    hint: "Tiêm Desmopressin (dDAVP)",
    bloomLevel: "ANALYZING",
    specialty: "Nội Tiết"
  }
];

export const MOCK_FOLDERS: FolderNode[] = [
  {
    id: "folder_y4_noi",
    name: "Y4 - Nội Khoa Bệnh Lý",
    description: "Tài liệu học tập & ngân hàng câu hỏi lâm sàng Nội 1 & 2",
    color: "#0284c7",
    icon: "HeartPulse",
    children: [
      {
        id: "folder_cardio",
        name: "Module Tim Mạch",
        description: "Suy tim, Hội chứng vành cấp, Tăng huyết áp, Rối loạn nhịp",
        color: "#f43f5e",
        icon: "Activity",
        parentId: "folder_y4_noi",
        decks: [
          {
            id: "deck_cardio_01",
            title: "Bộ Đề MCQ Suy Tim & Bệnh Mạch Vành (Chuẩn Bloom)",
            description: "6 câu hỏi tình huống lâm sàng sâu với đầy đủ 6 mức độ tư duy Bloom",
            type: "MCQ",
            specialty: "Nội Tim Mạch",
            folderId: "folder_cardio",
            questions: MOCK_MCQ_QUESTIONS,
            itemCount: 6,
            updatedAt: "2026-08-28",
          },
          {
            id: "deck_ecg_flash",
            title: "Flashcard Điện Tâm Đồ (ECG) Nâng Cao",
            description: "Thẻ nhận diện rối loạn nhịp và hội chứng vành cấp",
            type: "FLASHCARD",
            specialty: "Nội Tim Mạch",
            folderId: "folder_cardio",
            flashcards: MOCK_FLASHCARDS,
            itemCount: 4,
            updatedAt: "2026-08-27",
          }
        ]
      },
      {
        id: "folder_respiratory",
        name: "Module Hô Hấp",
        description: "Viêm phổi cộng đồng, Hen phế quản, COPD, Tràn dịch màng phổi",
        color: "#0ea5e9",
        icon: "Wind",
        parentId: "folder_y4_noi",
        decks: [
          {
            id: "deck_resp_01",
            title: "MCQ Viêm Phổi & Kháng Sinh Liệu Pháp",
            description: "Đánh giá mức độ nặng theo CURB-65 và phác đồ empiric",
            type: "MCQ",
            specialty: "Nội Hô Hấp",
            folderId: "folder_respiratory",
            itemCount: 15,
            updatedAt: "2026-08-25",
          }
        ]
      },
      {
        id: "folder_gi",
        name: "Module Tiêu Hóa - Gan Mật",
        description: "Xơ gan mất bù, Xuất huyết tiêu hóa trên, Viêm tụy cấp",
        color: "#f59e0b",
        icon: "Utensils",
        parentId: "folder_y4_noi",
        decks: []
      }
    ]
  },
  {
    id: "folder_pharm",
    name: "Dược Lý Học & Độc Chất",
    description: "Cơ chế tác dụng, chỉ định, chống chỉ định, độc tính và tương tác thuốc",
    color: "#8b5cf6",
    icon: "Pill",
    children: [
      {
        id: "folder_pharm_cardio",
        name: "Thuốc Tim Mạch & Thận",
        description: "ACEi, ARB, ARNI, Beta-blocker, SGLT2i, Lợi tiểu",
        color: "#a855f7",
        icon: "ShieldAlert",
        parentId: "folder_pharm",
        decks: [
          {
            id: "deck_pharm_01",
            title: "Flashcard Cơ Chế Thuốc Tim Mạch & Cấp Cứu",
            description: "Thẻ học lặp lại ngắt quãng Spaced Repetition",
            type: "FLASHCARD",
            specialty: "Dược Lý Lâm Sàng",
            folderId: "folder_pharm_cardio",
            flashcards: MOCK_FLASHCARDS,
            itemCount: 4,
            updatedAt: "2026-08-28",
          }
        ]
      }
    ]
  },
  {
    id: "folder_anatomy",
    name: "Giải Phẫu & Phôi Thai Học",
    description: "Giải phẫu định khu, thần kinh sọ, mạch máu và cấu trúc ổ bụng",
    color: "#10b981",
    icon: "Layers",
    children: []
  }
];

