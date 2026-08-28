# 📋 PROJECT_RULES.md - Quy Chuẩn Phát Triển Dự Án MediMind

> **Tài liệu Quy định Chuẩn mực Code, Kiến trúc, UI/UX và Quy trình Làm việc chuẩn Senior Fullstack 2026**

---

## 1. 🏷️ Naming Conventions (Quy ước đặt tên)

- **Components**: Sử dụng `kebab-case` cho tên file (VD: `question-card.tsx`, `bloom-badge.tsx`) và `PascalCase` cho tên React Component (VD: `QuestionCard`, `BloomBadge`).
- **Hooks**: Sử dụng tiền tố `use` kèm `camelCase` (VD: `useQuizTimer.ts`, `useBloomStats.ts`).
- **Types & Interfaces**: `PascalCase` không dùng tiền tố `I` (VD: `MCQQuestion`, `BloomScoreMatrix`, `FolderNode`).
- **Constants & Enums**: `UPPER_SNAKE_CASE` (VD: `BLOOM_TAXONOMY_MAP`, `MEDICAL_SPECIALTIES`).
- **CSS Classnames**: Dùng tiện ích Tailwind chuẩn, tránh viết class tùy ý nếu không cần thiết; dùng hàm helper `cn(...)` khi nối class động.

---

## 2. 🧩 Component Architecture Rules (Quy chuẩn Component)

- **Single Responsibility Principle**: Mỗi component chỉ đảm nhiệm một chức năng giao diện duy nhất (VD: `QuizTimer` chỉ quản lý thời gian đếm ngược, `BloomBadge` chỉ hiển thị nhãn cấp độ).
- **Server vs Client Components**:
  - Mặc định các trang hiển thị dữ liệu tĩnh là **Server Components**.
  - Chỉ thêm `"use client"` ở đầu file khi component có sử dụng React Hooks (`useState`, `useEffect`), sự kiện người dùng (`onClick`, `onChange`) hoặc thư viện Animation (`framer-motion`).
- **Props Typing**: Luôn khai báo interface rõ ràng cho Props, không dùng `any`.
- **Compound Components & Modularity**: Tách nhỏ các phần tử phức tạp (như Modal kết quả thi, Cây thư mục) thành các sub-components dễ bảo trì.

---

## 3. 📱 Responsive & Layout Rules (Quy chuẩn Responsive)

- **Mobile-First Approach**: Thiết kế ưu tiên màn hình điện thoại di động (tối thiểu 375px), sau đó mở rộng cho Tablet (`md: 768px`) và Desktop (`lg: 1024px`, `2xl: 1400px`).
- **Touch Targets**: Mọi nút bấm (A/B/C/D, nút lật thẻ) trên mobile phải có chiều cao tối thiểu `44px` để dễ bấm chính xác.
- **Spacing & Typography**:
  - Dùng hệ thống khoảng cách nhất quán của Tailwind (`gap-3`, `gap-6`, `p-4`, `p-8`).
  - Tiêu đề câu hỏi dùng kích thước chữ dễ đọc: `text-base sm:text-lg` với `line-height` thoáng (`leading-relaxed`).

---

## 4. 🎨 UI/UX & Dark Mode Rules

- **Màu sắc Trạng thái Y khoa**:
  - **Đáp án ĐÚNG**: Luôn sử dụng màu Xanh lá (`border-emerald-500 bg-emerald-50/70 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100`).
  - **Đáp án SAI**: Luôn sử dụng màu Đỏ (`border-rose-500 bg-rose-50/70 text-rose-950 dark:bg-rose-950/40 dark:text-rose-100`).
  - **Lựa chọn của người dùng**: Giữ nguyên viền nổi bật để người học so sánh câu mình đã chọn với câu đúng.
- **Dark Mode Support**:
  - Không sử dụng màu đen tuyệt đối `#000000` làm nền vì gây chói gắt mắt; sử dụng gam màu Deep Slate (`#0b0f19` hoặc `#0f172a`).
  - Mọi thành phần đều phải có biến màu tương ứng cho chế độ tối (sử dụng `dark:` modifier).

---

## 5. 🧹 Clean Code & Type-Safety Rules

- **Tuyệt đối Không Hardcode**:
  - Mọi hằng số về chuyên khoa, cấp độ Bloom, thời gian mặc định phải được định nghĩa tại thư mục `/constants` hoặc truyền qua Props.
- **Xử lý Dữ liệu Rỗng (Defensive Coding)**:
  - Luôn kiểm tra mảng rỗng trước khi render danh sách câu hỏi hoặc thẻ Flashcard (hiển thị Empty State thân thiện).
- **Tính toán Ma trận Bloom**:
  - Logic tính điểm và phân loại % theo thang đo Bloom phải nằm trong hàm thuần túy (Pure Function) tại `/lib/utils.ts` (`calculateBloomMatrix`).

---

## 6. ♿ Accessibility (a11y) Rules

- **Tương phản Màu Sắc**: Đảm bảo tỉ lệ tương phản chữ đạt chuẩn WCAG AA (tối thiểu 4.5:1).
- **Hỗ trợ Bàn Phím**: Người dùng có thể hoàn thành toàn bộ bài trắc nghiệm MCQ bằng phím Tab và Enter.
- **Hình ảnh & Icon**: Mọi icon đóng vai trò nút bấm phải có thuộc tính `aria-label` rõ ràng.

---

## 7. 🚀 Performance Rules

- **Hình ảnh**: Sử dụng component `next/image` với thuộc tính `priority` cho hình ảnh quan trọng ở Hero banner.
- **Giảm Bundle Size**: Không import toàn bộ thư viện Lucide (`import * as Icons`); chỉ import những icon thực sự sử dụng (`import { Stethoscope, Flame } from "lucide-react"`).
- **Timer Optimization**: Hook đếm giờ sử dụng `setInterval` chuẩn với hàm dọn dẹp (cleanup function) tránh memory leak khi chuyển trang.

---

## 8. 📝 Commit Message Standards (Chuẩn Git Commit)

Tuân thủ quy ước **Conventional Commits**:
- `feat:` Thêm tính năng mới (VD: `feat: add bloom taxonomy matrix calculation to quiz results`)
- `fix:` Sửa lỗi (VD: `fix: correct red border highlight on incorrect MCQ choice`)
- `ui:` Cải thiện giao diện, màu sắc, animation (VD: `ui: enhance 3d flip card smooth transition`)
- `docs:` Cập nhật tài liệu (VD: `docs: add comprehensive README and SKILL guide`)
- `refactor:` Tái cấu trúc mã nguồn không thay đổi logic (VD: `refactor: extract question card into modular component`)
- `perf:` Tối ưu hóa hiệu năng (VD: `perf: memoize bloom radar chart rendering`)

