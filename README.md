# 🩺 MediMind - Modern Medical Learning Platform & Bloom's Taxonomy Analytics Hub

> **Nền tảng Học tập Y khoa Hiện đại, Tối ưu Trải nghiệm Người dùng dành cho Sinh viên Đại học Y & Bác sĩ Nội trú**  
> Kết hợp trắc nghiệm MCQ phân loại theo **Thang đo tư duy Bloom**, Flashcard 3D Spaced Repetition, Cây thư mục đa cấp linh hoạt, Bộ đếm giờ thi tự động nộp bài và Trợ lý AI Y khoa (MediAI Tutor).

---

## 🌟 Giới Thiệu Dự Án

**MediMind** được thiết kế dựa trên phong cách giao diện hiện đại kết hợp giữa **Notion (tối giản, trực quan, khoảng trắng rộng rãi)**, **Duolingo (gamification, streak học tập, bảng thành tích)** và **Coursera (chuẩn mực học thuật chuyên sâu)**.

Dự án giải quyết trọn vẹn bài toán học tập của sinh viên ngành Y: không chỉ dừng lại ở việc học thuộc lòng các định nghĩa mà rèn luyện tư duy biện luận ca bệnh lâm sàng qua từng nấc thang tư duy của **Benjamin Bloom**.

---

## 🚀 Tính Năng Cốt Lõi (Core Features)

### 1. Trình Luyện Tập & Thi Trắc Nghiệm MCQ Chuẩn Bloom
- **6 Cấp độ Tư duy Bloom**: *1. Nhớ (Remembering) -> 2. Hiểu (Understanding) -> 3. Vận dụng (Applying) -> 4. Phân tích (Analyzing) -> 5. Đánh giá (Evaluating) -> 6. Sáng tạo (Creating)*.
- **Trải nghiệm Trực Quan Khi Chọn Đáp Án**:
  - Giữ nguyên trạng thái lựa chọn của người làm bài.
  - Đáp án đúng hiển thị **viền xanh lá (`border-emerald-500 bg-emerald-50/70`)** kèm dấu tick.
  - Đáp án người làm chọn nếu sai hiển thị **viền đỏ (`border-rose-500 bg-rose-50/70`)** kèm icon cảnh báo.
  - Lập tức hiển thị **Khung Giải thích Bệnh học & Cơ chế Lâm sàng Chi tiết**.
- **Bộ Hẹn Giờ Thi Thông Minh & Tự Động Nộp Bài**:
  - Người dùng tùy chỉnh thời gian (5, 10, 15, 30, 45 phút...).
  - Thanh tiến trình đếm ngược thời gian trực quan, nhấp nháy đỏ khi dưới 60 giây.
  - **Tự động nộp bài và chấm điểm ngay khi hết giờ**.
- **Bảng Báo Cáo & Ma Trận Đánh Giá Năng Lực Bloom**:
  - Thống kê tổng số câu làm đúng, làm sai, % điểm tổng quát.
  - **Bảng trạng thái & biểu đồ % chi tiết theo từng mốc thang đo Bloom**, giúp sinh viên biết rõ mình đang mạnh ở phần Nhớ hay yếu ở phần Phân tích ca lâm sàng.

### 2. Thẻ Ghi Nhớ Flashcard 3D & Lặp Lại Ngắt Quãng (Spaced Repetition)
- Thẻ học lật mặt 3D mượt mà xây dựng trên **Framer Motion**.
- Đánh giá mức độ tự tin (Chưa nhớ / Nhớ vừa / Đã thuộc) theo thuật toán SM-2.
- Gắn nhãn chuyên khoa (Dược lý, Giải phẫu, Sinh lý) và cấp độ Bloom.

### 3. Hệ Thống Thư Mục Đa Cấp Cá Nhân Hóa (Hierarchical Folder Tree)
- Người dùng có thể tạo không giới hạn các **Thư mục Lớn** (VD: *Y4 - Nội Bệnh Lý, Dược Lý Học*).
- Tạo các **Thư mục Con** lồng nhau (VD: *Module Tim Mạch -> Suy Tim*).
- Trong mỗi thư mục con có thể chứa: **Bộ đề MCQ**, **Bộ thẻ Flashcard**, hoặc **Cả hai (Hybrid Deck)**.

### 4. Creator Studio (Biên Soạn & Chỉnh Sửa)
- Soạn câu hỏi trắc nghiệm: nhập tình huống ca bệnh (Vignette), nội dung câu hỏi, 4 phương án, chọn đáp án đúng, gắn bậc tư duy Bloom (1-6) và viết lời giải thích cơ chế.
- Soạn thẻ Flashcard 3D: Mặt trước, mặt sau, gợi ý lâm sàng và bậc Bloom.

### 5. Bảng Điều Khiển Năng Lực (Dashboard)
- **Chuỗi ngày học liên tục (Streak Flame - phong cách Duolingo)**.
- Biểu đồ phân tích năng lực 6 bậc Bloom tổng hợp qua các bài kiểm tra.
- Lịch sử ôn luyện và gợi ý lộ trình cải thiện từ AI.

### 6. Trợ Lý Y Khoa Thông Minh (MediAI Medical Tutor)
- Giải thích cơ chế bệnh sinh, phân tích ca lâm sàng step-by-step.
- Tự động sinh câu hỏi theo yêu cầu chuyên khoa và mức độ Bloom.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Thành Phần | Công Nghệ | Mô Tả |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14+ (App Router)** | Server Components, tối ưu SEO, code-splitting tự động |
| **Language** | **TypeScript 5+** | Type-safety tuyệt đối, giảm thiểu runtime error |
| **Styling** | **Tailwind CSS** | Medical palette dịu mắt, Dark mode chuẩn WCAG AA |
| **UI Components** | **shadcn/ui & Radix UI** | Reusable, Accessible, Modern minimal |
| **Animations** | **Framer Motion** | Hiệu ứng lật thẻ 3D, modal zoom, mượt nhẹ |
| **Icons & Gamification**| **Lucide Icons & Canvas Confetti** | Icon y khoa sắc nét & hiệu ứng pháo hoa khi đạt điểm cao |
| **Database & ORM** | **Prisma ORM & PostgreSQL** | Quản lý schema quan hệ đệ quy cho Folder và Bloom Analytics |
| **Theming** | **next-themes** | Chuyển đổi Light / Dark mode tức thì |

---

## 📂 Cấu Trúc Thư Mục Dự Án (File Structure)

```
medlearn-platform/
├── README.md                      # Hướng dẫn toàn diện dự án
├── SKILL.md                       # Bản đồ kỹ năng Senior Fullstack & AI Architect
├── PROJECT_RULES.md               # Bộ quy chuẩn code, responsive & clean architecture
├── .env.example                   # Biến môi trường mẫu
├── package.json                   # Cấu hình dependencies
├── tsconfig.json                  # Cấu hình TypeScript
├── tailwind.config.ts             # Theme Tailwind (Bảng màu Y khoa + 6 màu Bloom)
├── postcss.config.js              # Cấu hình PostCSS
├── next.config.mjs                # Cấu hình Next.js
│
├── prisma/
│   └── schema.prisma              # Schema PostgreSQL chuẩn y khoa & ma trận Bloom
│
├── app/
│   ├── layout.tsx                 # Root layout tích hợp ThemeProvider & Navbar
│   ├── page.tsx                   # Trang chủ (Hero, 6 bậc Bloom, Features, CTA)
│   ├── globals.css                # CSS variables, 3D flip card, Dark mode
│   ├── dashboard/
│   │   └── page.tsx               # Dashboard cá nhân, streak flame & ma trận Bloom
│   ├── folders/
│   │   └── page.tsx               # Quản lý cây thư mục đa cấp & bộ đề
│   ├── quiz/
│   │   └── [deckId]/
│   │       └── page.tsx           # Trình làm MCQ (Hẹn giờ, viền xanh/đỏ, giải thích)
│   ├── flashcards/
│   │   └── [deckId]/
│   │       └── page.tsx           # Trình lật thẻ Flashcard 3D Spaced Repetition
│   ├── create/
│   │   └── page.tsx               # Creator Studio soạn MCQ & Flashcard
│   └── ai-tutor/
│       └── page.tsx               # Trợ lý MediAI Tutor phân tích lâm sàng
│
├── components/
│   ├── navbar.tsx                 # Navbar responsive, streak badge & dark mode
│   ├── footer.tsx                 # Footer y khoa & bản quyền
│   ├── theme-provider.tsx         # NextThemes provider
│   ├── mcq/
│   │   ├── question-card.tsx      # Card câu hỏi MCQ với viền xanh/đỏ & rationale
│   │   ├── quiz-timer.tsx         # Đồng hồ đếm giờ & tự động nộp bài
│   │   ├── bloom-badge.tsx        # Huy hiệu 6 mức độ tư duy Bloom
│   │   └── quiz-result-modal.tsx  # Modal tổng kết điểm + Bảng ma trận Bloom %
│   ├── flashcard/
│   │   └── flashcard-viewer.tsx   # Trình lật thẻ 3D + Đánh giá mức độ nhớ
│   ├── folder/
│   │   └── folder-tree.tsx        # Cây thư mục lồng nhau tương tác
│   ├── dashboard/
│   │   ├── bloom-radar-chart.tsx  # Biểu đồ năng lực tư duy 6 cấp độ Bloom
│   │   ├── streak-card.tsx        # Card hiển thị streak học tập
│   │   └── recent-sessions.tsx    # Lịch sử luyện tập gần đây
│   └── ai/
│       └── ai-chat-box.tsx        # Chatbox tương tác MediAI Tutor
│
├── types/
│   └── index.ts                   # Định nghĩa types (BloomLevel, MCQ, Folder, Deck)
├── constants/
│   └── bloom.ts                   # Hằng số 6 cấp độ Bloom & chuyên khoa y học
├── lib/
│   ├── utils.ts                   # Helper functions (cn, formatTime, calculateBloomMatrix)
│   ├── mock-data.ts               # Ngân hàng ca lâm sàng y khoa phong phú
│   └── prisma.ts                  # Prisma Client instance
└── docs/
    └── architecture.md            # Tài liệu kiến trúc phần mềm
```

---

## ⚡ Hướng Dẫn Cài Đặt & Chạy Dự Án (Getting Started)

### 1. Yêu cầu môi trường
- **Node.js**: Phiên bản `>= 18.17.0` (Khuyên dùng Node 20 LTS)
- **npm** hoặc **pnpm** / **yarn**

### 2. Cài đặt Dependencies
```bash
# Di chuyển vào thư mục dự án
cd medlearn-platform

# Cài đặt các gói phụ thuộc
npm install
```

### 3. Cấu hình Biến Môi Trường
Sao chép file `.env.example` thành `.env`:
```bash
cp .env.example .env
```

### 4. Khởi tạo Prisma Schema (Tùy chọn khi dùng DB thật)
```bash
npx prisma generate
```

### 5. Chạy Môi Trường Phát Triển (Development Mode)
```bash
npm run dev
```
Mở trình duyệt và truy cập: **[http://localhost:3000](http://localhost:3000)** để trải nghiệm!

---

## 🚀 Hướng Dẫn Deploy Lên Vercel

1. Đẩy mã nguồn lên kho lưu trữ GitHub / GitLab.
2. Truy cập **[Vercel Dashboard](https://vercel.com)** và chọn **Add New Project**.
3. Import repository dự án.
4. Cấu hình Environment Variables theo `.env.example`.
5. Nhấn **Deploy** — Vercel sẽ tự động build và cung cấp domain HTTPS miễn phí.

---

## 🏆 Tiêu Chuẩn Best Practices 2026
- **Accessibility (a11y)**: Hỗ trợ chuyển đổi Dark / Light mode tương phản cao, phím tắt lật thẻ Flashcard (`Space`, `ArrowKeys`), nhãn ARIA đầy đủ.
- **Performance**: Zero Cumulative Layout Shift (CLS), tải trước Server Components, lazy loading các modal nặng.
- **Maintainability**: Phân tách rõ ràng giữa Presentation Components và Business Logic, kiểu dữ liệu chặt chẽ không sử dụng `any`.

---

## 👨‍⚕️ Thông Tin Tác Giả & Nhà Sáng Tạo (Author & Creator)

- **Họ và Tên**: **Lê Anh Tuấn**
- **ZALO**: [`0813194249`](https://zalo.me/0813194249)
- **FACEBOOK**: [`https://www.facebook.com/le.tuan.934451`](https://www.facebook.com/le.tuan.934451)
- **Email**: `leanhtuan812006@gmail.com`
- **Dự Án**: MediMind - Nền tảng Học tập & Đánh giá Năng lực Y Khoa theo Thang đo Tư duy Bloom.


