# 🏛️ MediMind - System Architecture & Design Document

> **Tài Liệu Thiết Kế Kiến Trúc Phần Mềm Nền Tảng Học Tập Y Khoa MediMind**

---

## 1. 📐 Kiến Trúc Tổng Thể (High-Level Architecture)

Hệ thống được xây dựng theo mô hình **Layered Clean Architecture** trên nền tảng **Next.js 14 App Router**:

```
+-------------------------------------------------------------+
|                     PRESENTATION LAYER                      |
|  - Next.js 14 App Pages (Dashboard, Quiz, Flashcards, AI)   |
|  - UI Components (shadcn/ui, Framer Motion 3D, Lucide)     |
|  - Dark Mode & Responsive Layout System                     |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                     APPLICATION & DOMAIN LAYER              |
|  - Bloom's Taxonomy Cognitive Scoring Engine                |
|  - Spaced Repetition (SM-2 Algorithm) for Flashcards        |
|  - Hierarchical Recursive Tree Manager (Folders & Decks)   |
|  - Timed Quiz State Machine & Auto-Submission Handler       |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                     DATA ACCESS & PERSISTENCE LAYER         |
|  - Prisma ORM Client                                        |
|  - PostgreSQL Database (Users, Folders, Decks, Questions)   |
|  - NextAuth / OAuth JWT Sessions                            |
+-------------------------------------------------------------+
```

---

## 2. 🧠 Thuật Toán Đánh Giá Ma Trận Tư Duy Bloom (Bloom's Taxonomy Engine)

Mỗi câu hỏi trong ngân hàng dữ liệu được gán một mức độ tư duy \( L_i \in \{\text{REMEMBERING}, \dots, \text{CREATING}\} \). Khi kết thúc bài thi, hàm `calculateBloomMatrix` tổng hợp kết quả theo công thức:

$$\text{Tỉ lệ chính xác theo bậc } L = \frac{\sum_{i \in L} \mathbb{I}(\text{Answer}_i = \text{Correct}_i)}{N_L} \times 100\%$$

Trong đó \( N_L \) là tổng số câu hỏi thuộc bậc tư duy \( L \) có trong đề.

---

## 3. 🌲 Cấu Trúc Dữ Liệu Cây Thư Mục Đa Cấp (Hierarchical Folder Tree)

Bảng `Folder` trong Prisma sử dụng liên kết tự tham chiếu (Self-referencing Foreign Key):

```prisma
model Folder {
  id       String   @id @default(cuid())
  name     String
  parentId String?
  parent   Folder?  @relation("SubFolders", fields: [parentId], references: [id])
  children Folder[] @relation("SubFolders")
  decks    Deck[]
}
```

Điều này cho phép người dùng mở rộng cấu trúc thư mục không giới hạn:
- **Root**: Y4 - Nội Khoa Bệnh Lý
  - **Child 1**: Module Tim Mạch
    - **Deck 1 (MCQ)**: Suy Tim & Hội Chứng Vành Cấp
    - **Deck 2 (Flashcard)**: Điện Tâm Đồ Nâng Cao
  - **Child 2**: Module Hô Hấp
    - **Deck 3 (MCQ)**: Viêm Phổi Cộng Đồng

