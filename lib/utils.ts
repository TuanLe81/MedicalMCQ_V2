import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BloomLevel, BloomScoreMatrix, MCQQuestion } from "@/types";
import { BLOOM_TAXONOMY_MAP } from "@/constants/bloom";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Calculates detailed Bloom's Taxonomy score matrix from a completed quiz
 */
export function calculateBloomMatrix(
  questions: MCQQuestion[],
  userAnswers: { [questionIndex: number]: number }
): BloomScoreMatrix {
  const matrix: BloomScoreMatrix = {};

  // Initialize all Bloom levels
  const allLevels: BloomLevel[] = [
    "REMEMBERING",
    "UNDERSTANDING",
    "APPLYING",
    "ANALYZING",
    "EVALUATING",
    "CREATING",
  ];

  allLevels.forEach((lvl) => {
    matrix[lvl] = {
      bloomLevel: lvl,
      vietnameseName: BLOOM_TAXONOMY_MAP[lvl]?.vietnameseName || lvl,
      total: 0,
      correct: 0,
      percentage: 0,
    };
  });

  // Calculate stats per question
  questions.forEach((q, idx) => {
    const lvl = q.bloomLevel;
    if (!matrix[lvl]) {
      matrix[lvl] = {
        bloomLevel: lvl,
        vietnameseName: BLOOM_TAXONOMY_MAP[lvl]?.vietnameseName || lvl,
        total: 0,
        correct: 0,
        percentage: 0,
      };
    }
    matrix[lvl].total += 1;
    if (userAnswers[idx] === q.correctIndex) {
      matrix[lvl].correct += 1;
    }
  });

  // Compute percentages
  allLevels.forEach((lvl) => {
    if (matrix[lvl].total > 0) {
      matrix[lvl].percentage = Math.round(
        (matrix[lvl].correct / matrix[lvl].total) * 100
      );
    } else {
      matrix[lvl].percentage = 0;
    }
  });

  return matrix;
}

