# 🧠 SKILL.md - Senior Fullstack Developer + UI/UX Designer + AI Architect Matrix

> **Tài liệu Bản đồ Năng lực Kỹ thuật & Tiêu chuẩn Chuyên môn áp dụng cho Dự án MediMind**

---

## 1. 🎨 UI/UX Design & Aesthetic Engineering Skills
- **Modern Minimalist Aesthetics**: Khả năng thiết kế giao diện tinh tế, khoảng trắng (whitespace) thoáng đãng, phân cấp thị giác (Visual Hierarchy) rõ nét, lấy cảm hứng từ các sản phẩm hàng đầu: *Notion, Duolingo, Coursera, Linear*.
- **Medical-Specific Color Psychology**: Sử dụng bảng màu nhẹ dịu mắt, tránh gây mỏi mắt cho sinh viên y khoa ôn thi hàng giờ (Primary Sky Blue `#0284c7`, Soft Slate Dark Theme, màu Pastel cho các tag chuyên khoa).
- **Cognitive Load Reduction**: Thiết kế bố cục dạng card bo góc mềm (`rounded-2xl` / `rounded-3xl`), giảm tải thông tin thừa, phân tách rõ giữa câu hỏi tình huống và các phương án lựa chọn.
- **Feedback & Micro-interactions**: Thiết kế phản hồi tức thời trực quan: **Viền xanh lá (`border-emerald-500`)** cho đáp án đúng, **Viền đỏ (`border-rose-500`)** cho đáp án sai kèm rung lắc nhẹ hoặc icon rõ ràng.

---

## 2. ⚛️ Frontend Architecture Skills
- **Next.js 14+ App Router Mastery**: Phân định rõ ràng giữa React Server Components (RSC) cho việc render dữ liệu tĩnh nhanh chóng và Client Components (`"use client"`) cho các tương tác đếm giờ, lật thẻ 3D.
- **State Management & Data Flow**: Quản lý trạng thái bài làm, thời gian đếm ngược, lưu trữ tạm câu trả lời và tính toán ma trận Bloom mà không gây giật lag hoặc re-render thừa.
- **TypeScript 5+ Type-Safety**: Định nghĩa schema dữ liệu chặt chẽ cho 6 cấp độ Bloom (`REMEMBERING`, `UNDERSTANDING`, `APPLYING`, `ANALYZING`, `EVALUATING`, `CREATING`), câu hỏi MCQ, Flashcards và cây thư mục đệ quy.

---

## 3. 🎬 Animation & Micro-interaction Skills
- **Framer Motion 3D Flipping**: Kỹ thuật dựng hiệu ứng lật thẻ không gian 3 chiều (`perspective-1000`, `rotateY: 180deg`, `backface-visibility: hidden`) mượt mà 60 FPS trên cả thiết bị di động.
- **Gamification Feedback (Canvas Confetti)**: Tích hợp hiệu ứng pháo hoa chúc mừng khi người học hoàn thành bài thi với điểm số xuất sắc (>= 70%), kích thích dopamine học tập.
- **Smooth Page Transitions & Skeleton Loaders**: Tránh hiện tượng layout shift (CLS) khi tải dữ liệu câu hỏi hoặc chuyển đổi thư mục.

---

## 4. 🗄️ Backend, Database & ORM Skills
- **Prisma ORM & PostgreSQL Modeling**:
  - Thiết kế cấu trúc quan hệ cây thư mục tự tham chiếu (Self-referencing Recursive Relation: `parentId` -> `Folder`).
  - Lưu trữ kết quả phân tích tư duy Bloom dưới dạng JSON linh hoạt (`bloomMatrix`) trong bảng `QuizAttempt`.
  - Thiết kế chỉ mục (Indexes) tối ưu truy vấn theo `userId`, `deckId`, và `bloomLevel`.
- **Server Actions & API Security**: Xác thực dữ liệu đầu vào (Zod validation), xử lý chấm điểm an toàn phía server chống can thiệp từ client.

---

## 5. ♿ Accessibility (a11y) & Usability Skills
- **WCAG 2.1 AA Compliance**: Tỉ lệ tương phản màu chữ và nền đạt tối thiểu `4.5:1` ở cả hai chế độ Sáng và Tối.
- **Keyboard Navigation**: Hỗ trợ đầy đủ phím tắt: `Space` để lật thẻ Flashcard, `ArrowLeft` / `ArrowRight` để chuyển câu hỏi, `1-4` để chọn đáp án A/B/C/D.
- **Screen Reader Support**: Gắn nhãn ARIA (`aria-label`, `role="dialog"`, `role="timer"`) cho các thành phần tương tác.

---

## 6. ⚡ Performance & Web Vitals Optimization
- **Core Web Vitals Optimization**:
  - **LCP (Largest Contentful Paint)**: < 1.2s nhờ tối ưu phông chữ Google Inter và Server Rendering.
  - **FID / INP (Interaction to Next Paint)**: < 50ms nhờ xử lý state gọn nhẹ và debounce logic đếm giờ.
  - **CLS (Cumulative Layout Shift)**: = 0 nhờ đặt kích thước cố định cho khung thẻ và container.
- **Tree-shaking & Code Splitting**: Chỉ import các biểu tượng Lucide cần thiết, dynamic import các modal kết quả.

---

## 7. 🔍 SEO & Semantic HTML Skills
- **OpenGraph & Dynamic Metadata**: Tự động sinh thẻ meta title, description chuyên ngành y khoa chuẩn xác.
- **Structured Data (JSON-LD)**: Khai báo cấu trúc Schema.org dạng `Course`, `Quiz` và `EducationalApplication` giúp Google lập chỉ mục ngân hàng câu hỏi.

---

## 8. 🤖 AI Integration & Medical Prompt Engineering
- **Clinical Reasoning System Prompts**: Xây dựng cấu trúc prompt chuyên sâu cho MediAI: phân tích triệu chứng theo cơ chế bệnh sinh (Pathophysiology), chẩn đoán phân biệt (Differential Diagnosis), và đề xuất phác đồ theo hướng dẫn chuẩn (ESC, AHA, Bộ Y Tế).
- **Bloom Taxonomy Alignment Engine**: Prompt AI có khả năng thẩm định và phân loại một câu hỏi trắc nghiệm vào đúng 1 trong 6 cấp độ tư duy Bloom.

