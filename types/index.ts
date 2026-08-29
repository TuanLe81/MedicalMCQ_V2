// Type definitions for MedLearn Platform

export type BloomLevel = 
  | 'REMEMBERING'   // 1. Nhớ
  | 'UNDERSTANDING' // 2. Hiểu
  | 'APPLYING'      // 3. Vận dụng
  | 'ANALYZING'     // 4. Phân tích
  | 'EVALUATING'    // 5. Đánh giá
  | 'CREATING';     // 6. Sáng tạo

export interface BloomInfo {
  level: BloomLevel;
  vietnameseName: string;
  shortDesc: string;
  order: number;
  colorClass: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
}

export type DeckType = 'MCQ' | 'FLASHCARD' | 'HYBRID';

export interface MCQOption {
  id: string;
  text: string;
}

export interface MCQQuestion {
  id: string;
  deckId?: string;
  clinicalVignette?: string; // Tình huống lâm sàng
  questionText: string;
  bloomLevel: BloomLevel;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  options: string[]; // [A, B, C, D]
  correctIndex: number;
  explanation: string; // Giải thích bệnh học / cơ chế
}

export interface FlashcardItem {
  id: string;
  deckId?: string;
  front: string; // Mặt trước (Câu hỏi/Triệu chứng)
  back: string; // Mặt sau (Cơ chế/Giải đáp)
  hint?: string; // Gợi ý
  bloomLevel: BloomLevel;
  specialty?: string;
}

export interface Deck {
  id: string;
  title: string;
  description?: string;
  type: DeckType;
  specialty: string;
  folderId?: string | null;
  questions?: MCQQuestion[];
  flashcards?: FlashcardItem[];
  itemCount: number;
  updatedAt: string;
}

export interface FolderNode {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string | null;
  children?: FolderNode[];
  decks?: Deck[];
  createdAt?: string;
}

export interface BloomScoreMatrix {
  [level: string]: {
    bloomLevel: BloomLevel;
    vietnameseName: string;
    total: number;
    correct: number;
    percentage: number;
  };
}

export interface QuizResult {
  deckId: string;
  deckTitle: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  scorePercentage: number;
  timeSpentSeconds: number;
  bloomMatrix: BloomScoreMatrix;
  userAnswers: { [questionIndex: number]: number };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: 'STUDENT' | 'RESIDENT_DOCTOR' | 'LECTURER';
  medicalSchool: string;
  yearOfStudy: number;
  streakCount: number;
  totalQuestionsAnswered: number;
  overallAccuracy: number;
  bloomTaxonomyStats: {
    [key in BloomLevel]: {
      total: number;
      correct: number;
      percentage: number;
    }
  };
}
