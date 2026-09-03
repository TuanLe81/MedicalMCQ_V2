"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, BloomLevel, FolderShareRequest, FolderNode, LeaderboardEntry, BloomScoreMatrix, Deck, MCQQuestion, FlashcardItem } from "@/types";
import { MOCK_USER, MOCK_FOLDERS, MOCK_MCQ_QUESTIONS, MOCK_FLASHCARDS } from "@/lib/mock-data";

export interface DeckWithFolder extends Deck {
  folderName?: string;
  folderId?: string;
  folderColor?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identity: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    medicalSchool: string;
    yearOfStudy: number;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  // Daily Attendance & Streak System
  checkInDaily: () => { success: boolean; newStreak?: number; message?: string; alreadyCheckedIn?: boolean };
  // Quiz Score Recording & Real-time Bloom update
  recordQuizSubmission: (correctCount: number, totalCount: number, bloomMatrix: BloomScoreMatrix) => void;
  // Leaderboard
  getLeaderboard: () => LeaderboardEntry[];
  // Forgot / Reset Password
  verifyAccountExists: (identity: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  resetPassword: (identity: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  // Folder & Deck Sharing System
  shareRequests: FolderShareRequest[];
  sendShareRequest: (
    item: FolderNode | Deck,
    target: string,
    itemType?: "FOLDER" | "DECK"
  ) => Promise<{ success: boolean; error?: string }>;
  respondShareRequest: (
    requestId: string,
    accept: boolean,
    targetFolderId?: string
  ) => Promise<{ success: boolean; error?: string }>;
  getUserFolders: () => FolderNode[];
  saveUserFolders: (folders: FolderNode[]) => { success: boolean; error?: string };
  getUserDecks: (typeFilter?: "MCQ" | "FLASHCARD") => DeckWithFolder[];
  saveUserDeck: (
    deck: Deck,
    targetFolderId: string,
    newFolderName?: string,
    parentFolderId?: string
  ) => { success: boolean; error?: string };
  deleteUserDeck: (deckId: string) => { success: boolean; error?: string };
  appendItemsToExistingDeck: (
    deckId: string,
    newQuestions?: MCQQuestion[],
    newFlashcards?: FlashcardItem[]
  ) => { success: boolean; error?: string; updatedDeck?: Deck; folderName?: string };
  updateUserDeck: (
    deckId: string,
    updates: { title?: string; specialty?: string; description?: string }
  ) => { success: boolean; error?: string; updatedDeck?: Deck };
}

// Initial clean Bloom taxonomy stats starting from 0
const initialCleanBloomStats: Record<BloomLevel, { total: number; correct: number; percentage: number }> = {
  REMEMBERING: { total: 0, correct: 0, percentage: 0 },
  UNDERSTANDING: { total: 0, correct: 0, percentage: 0 },
  APPLYING: { total: 0, correct: 0, percentage: 0 },
  ANALYZING: { total: 0, correct: 0, percentage: 0 },
  EVALUATING: { total: 0, correct: 0, percentage: 0 },
  CREATING: { total: 0, correct: 0, percentage: 0 },
};

// Seed core users and benchmark leaderboard peers
const defaultUsers: UserProfile[] = [
  {
    id: "user_tuan_le_primary",
    name: "BS. Lê Anh Tuấn",
    username: "leanhtuan",
    email: "leanhtuan812006@gmail.com",
    password: "123",
    isDemo: false,
    role: "STUDENT",
    medicalSchool: "Đại học Y Dược TP.HCM",
    yearOfStudy: 4,
    streakCount: 1,
    lastCheckInDate: "",
    totalQuestionsAnswered: 0,
    totalCorrectAnswers: 0,
    overallAccuracy: 0,
    bloomTaxonomyStats: initialCleanBloomStats,
  },
  {
    id: "user_top1_mai",
    name: "BSNT. Nguyễn Hoàng Mai",
    username: "hoangmai",
    email: "mai.nguyen@med.edu.vn",
    password: "123",
    isDemo: true,
    role: "RESIDENT_DOCTOR",
    medicalSchool: "Đại học Y Hà Nội (Bác Sĩ Nội Trú)",
    yearOfStudy: 6,
    streakCount: 15,
    lastCheckInDate: new Date().toISOString().split("T")[0],
    totalQuestionsAnswered: 240,
    totalCorrectAnswers: 216,
    overallAccuracy: 90.0,
    bloomTaxonomyStats: {
      REMEMBERING: { total: 70, correct: 66, percentage: 94 },
      UNDERSTANDING: { total: 60, correct: 55, percentage: 92 },
      APPLYING: { total: 45, correct: 40, percentage: 89 },
      ANALYZING: { total: 35, correct: 30, percentage: 86 },
      EVALUATING: { total: 18, correct: 14, percentage: 78 },
      CREATING: { total: 12, correct: 11, percentage: 92 },
    },
  },
  {
    id: "user_top2_duc",
    name: "BS. Trần Minh Đức",
    username: "minhduc",
    email: "duc.tran@med.edu.vn",
    password: "123",
    isDemo: true,
    role: "STUDENT",
    medicalSchool: "Khoa Y - ĐHQG TP.HCM",
    yearOfStudy: 5,
    streakCount: 10,
    lastCheckInDate: new Date().toISOString().split("T")[0],
    totalQuestionsAnswered: 160,
    totalCorrectAnswers: 136,
    overallAccuracy: 85.0,
    bloomTaxonomyStats: initialCleanBloomStats,
  },
  {
    id: "user_top3_huong",
    name: "BS. Phạm Thị Hương",
    username: "thihuong",
    email: "huong.pham@med.edu.vn",
    password: "123",
    isDemo: true,
    role: "STUDENT",
    medicalSchool: "Đại học Y Dược Cần Thơ",
    yearOfStudy: 4,
    streakCount: 7,
    lastCheckInDate: new Date().toISOString().split("T")[0],
    totalQuestionsAnswered: 110,
    totalCorrectAnswers: 92,
    overallAccuracy: 83.6,
    bloomTaxonomyStats: initialCleanBloomStats,
  },
];

// Helper to safely get stored users with permanent persistence
// NEVER removes existing registered users — only adds missing defaults
const getStoredUsers = (): UserProfile[] => {
  if (typeof window === "undefined") return defaultUsers;
  try {
    const str = localStorage.getItem("medlearn_users");
    let list: UserProfile[] = str ? JSON.parse(str) : [];

    // Ensure list is always an array
    if (!Array.isArray(list)) list = [];

    // Add default/demo users only if they don't already exist (match by id, email, OR username)
    for (const defU of defaultUsers) {
      const alreadyExists = list.some(
        (u) =>
          u.id === defU.id ||
          (u.email && defU.email && u.email.toLowerCase().trim() === defU.email.toLowerCase().trim()) ||
          (u.username && defU.username && u.username.toLowerCase().trim() === defU.username.toLowerCase().trim())
      );
      if (!alreadyExists) {
        list.push(defU);
      }
    }

    localStorage.setItem("medlearn_users", JSON.stringify(list));
    return list;
  } catch (e) {
    return defaultUsers;
  }
};

// Sync registered users bidirectionally between LocalStorage and Cloud Database
// CRITICAL: This function MUST NEVER delete or overwrite an existing registered account
const syncUsersWithCloud = async (): Promise<UserProfile[]> => {
  if (typeof window === "undefined") return defaultUsers;
  try {
    const res = await fetch("/api/cloud-sync/users", { cache: "no-store" });
    if (!res.ok) return getStoredUsers();
    const data = await res.json();
    if (!data.success || !Array.isArray(data.users)) return getStoredUsers();

    const cloudUsers: UserProfile[] = data.users;
    const localUsers = getStoredUsers();

    // ========================================================================
    // SAFE MERGE STRATEGY:
    // 1. Start with ALL local users (never lose a local account)
    // 2. Add cloud-only users that don't exist locally
    // 3. For users that exist in BOTH, keep the version with more data/password
    // ========================================================================
    const mergedMap = new Map<string, UserProfile>();

    // Phase 1: Index ALL local users by ID, email, username
    localUsers.forEach((u) => {
      mergedMap.set(u.id, u);
    });

    // Phase 2: Merge cloud users — only ADD new ones, never overwrite existing with password
    cloudUsers.forEach((cloudUser) => {
      // Find existing local user by ID, email, or username
      let existingKey: string | null = null;

      if (mergedMap.has(cloudUser.id)) {
        existingKey = cloudUser.id;
      } else {
        // Search by email or username
        for (const [key, localUser] of mergedMap.entries()) {
          const emailMatch =
            cloudUser.email &&
            localUser.email &&
            cloudUser.email.toLowerCase().trim() === localUser.email.toLowerCase().trim();
          const usernameMatch =
            cloudUser.username &&
            localUser.username &&
            cloudUser.username.toLowerCase().trim() === localUser.username.toLowerCase().trim();
          if (emailMatch || usernameMatch) {
            existingKey = key;
            break;
          }
        }
      }

      if (existingKey) {
        // User exists locally — carefully merge, NEVER lose password or stats
        const existing = mergedMap.get(existingKey)!;
        const merged: UserProfile = {
          ...existing,
          // Keep the password that actually exists (local password takes priority)
          password: existing.password || cloudUser.password,
          // Keep higher stats
          totalQuestionsAnswered: Math.max(
            existing.totalQuestionsAnswered || 0,
            cloudUser.totalQuestionsAnswered || 0
          ),
          totalCorrectAnswers: Math.max(
            existing.totalCorrectAnswers || 0,
            cloudUser.totalCorrectAnswers || 0
          ),
          streakCount: Math.max(
            existing.streakCount || 1,
            cloudUser.streakCount || 1
          ),
          // Keep the more complete email/username
          email: existing.email || cloudUser.email,
          username: existing.username || cloudUser.username,
          name: existing.name || cloudUser.name,
          medicalSchool: existing.medicalSchool || cloudUser.medicalSchool,
        };
        mergedMap.set(existingKey, merged);
      } else {
        // New user from cloud — add it
        mergedMap.set(cloudUser.id || `cloud_${Date.now()}_${Math.random().toString(36).slice(2)}`, cloudUser);
      }
    });

    const merged = Array.from(mergedMap.values());
    localStorage.setItem("medlearn_users", JSON.stringify(merged));

    // Upload any local-only non-demo users to cloud
    const newLocalToUpload: UserProfile[] = [];
    localUsers.forEach((loc) => {
      if (loc.isDemo) return;
      const inCloud = cloudUsers.some(
        (c) =>
          c.id === loc.id ||
          (loc.email && c.email?.toLowerCase().trim() === loc.email?.toLowerCase().trim()) ||
          (loc.username && c.username?.toLowerCase().trim() === loc.username?.toLowerCase().trim())
      );
      if (!inCloud) {
        newLocalToUpload.push(loc);
      }
    });

    if (newLocalToUpload.length > 0) {
      fetch("/api/cloud-sync/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: newLocalToUpload }),
      }).catch(() => {});
    }

    return merged;
  } catch (e) {
    return getStoredUsers();
  }
};

// Sync folders and custom decks for a user from Cloud Database
const syncUserDataFromCloud = async (userId: string) => {
  if (typeof window === "undefined" || !userId) return;
  try {
    const res = await fetch(`/api/cloud-sync/user-data?userId=${userId}`, {
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = await res.json();
    if (!data.success) return;

    const foldersKey = `medlearn_folders_${userId}`;
    const decksKey = `medlearn_custom_decks_${userId}`;

    const localFoldersRaw = localStorage.getItem(foldersKey);
    const localDecksRaw = localStorage.getItem(decksKey);

    const localFolders = localFoldersRaw ? JSON.parse(localFoldersRaw) : [];
    const localDecks = localDecksRaw ? JSON.parse(localDecksRaw) : [];

    // If cloud has folders and local is empty, update local
    if (data.folders && Array.isArray(data.folders) && data.folders.length > 0) {
      if (!localFolders || localFolders.length === 0) {
        localStorage.setItem(foldersKey, JSON.stringify(data.folders));
      }
    } else if (localFolders && localFolders.length > 0) {
      // Local has folders, cloud is empty: push local to cloud
      fetch("/api/cloud-sync/user-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, folders: localFolders }),
      }).catch(() => {});
    }

    // If cloud has custom decks and local is empty, update local
    if (data.decks && Array.isArray(data.decks) && data.decks.length > 0) {
      if (!localDecks || localDecks.length === 0) {
        localStorage.setItem(decksKey, JSON.stringify(data.decks));
      }
    } else if (localDecks && localDecks.length > 0) {
      // Local has decks, cloud is empty: push local to cloud
      fetch("/api/cloud-sync/user-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, decks: localDecks }),
      }).catch(() => {});
    }
  } catch (e) {}
};

// Helper to sync share requests from cloud
const syncShareRequestsFromCloud = async (
  currentUser: UserProfile
): Promise<FolderShareRequest[]> => {
  if (typeof window === "undefined" || !currentUser) return [];
  try {
    const params = new URLSearchParams();
    if (currentUser.email) params.set("targetEmail", currentUser.email.toLowerCase().trim());
    if (currentUser.username) params.set("targetUsername", currentUser.username.toLowerCase().trim());
    if (currentUser.id) params.set("targetId", currentUser.id);
    // Legacy support
    const targetIdentity = currentUser.email || currentUser.username;
    if (targetIdentity) params.set("targetIdentity", targetIdentity.toLowerCase().trim());

    const res = await fetch(
      `/api/cloud-sync/share-requests?${params.toString()}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (data.success && Array.isArray(data.shareRequests)) {
      // Only keep PENDING or recent requests for the inbox display
      const inboxRequests = data.shareRequests.filter(
        (r: FolderShareRequest) => r.status === "PENDING" || r.status === "ACCEPTED" || r.status === "REJECTED"
      );
      localStorage.setItem(
        "medlearn_share_requests",
        JSON.stringify(inboxRequests)
      );
      return inboxRequests;
    }
  } catch (e) {}
  return [];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shareRequests, setShareRequests] = useState<FolderShareRequest[]>([]);

  // Initialize from LocalStorage and sync in background with Cloud
  useEffect(() => {
    try {
      getStoredUsers(); // Seed and persist users

      // Check active logged-in session
      const activeUserStr = localStorage.getItem("medlearn_current_user");
      if (activeUserStr) {
        const parsedUser: UserProfile = JSON.parse(activeUserStr);
        parsedUser.totalCorrectAnswers = parsedUser.totalCorrectAnswers ?? 0;
        parsedUser.streakCount = parsedUser.streakCount ?? 1;
        setUser(parsedUser);
      } else {
        setUser(null);
      }

      // Load Share Requests
      const storedShares = localStorage.getItem("medlearn_share_requests");
      if (storedShares) {
        setShareRequests(JSON.parse(storedShares));
      }
    } catch (e) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }

    // Run background cloud sync
    syncUsersWithCloud().then(() => {
      const activeUserStr = localStorage.getItem("medlearn_current_user");
      if (activeUserStr) {
        const parsed = JSON.parse(activeUserStr);
        if (parsed?.id && !parsed.isDemo) {
          syncUserDataFromCloud(parsed.id);
          syncShareRequestsFromCloud(parsed).then((reqs) => {
            if (reqs && reqs.length > 0) {
              setShareRequests(reqs);
            }
          });
        }
      }
    });
  }, []);

  // DAILY CHECK-IN & STREAK SYSTEM
  const checkInDaily = (): {
    success: boolean;
    newStreak?: number;
    message?: string;
    alreadyCheckedIn?: boolean;
  } => {
    if (!user) {
      return { success: false, message: "Vui lòng đăng nhập để điểm danh!" };
    }

    const todayStr = new Date().toISOString().split("T")[0];

    if (user.lastCheckInDate === todayStr) {
      return {
        success: false,
        alreadyCheckedIn: true,
        message: "Hôm nay bạn đã điểm danh rồi! Hãy duy trì chuỗi học tập vào ngày mai nhé.",
      };
    }

    let newStreak = user.streakCount || 0;
    if (user.lastCheckInDate) {
      const lastDate = new Date(user.lastCheckInDate);
      const today = new Date(todayStr);
      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = Math.max(1, newStreak);
    }

    const updatedUser: UserProfile = {
      ...user,
      streakCount: newStreak,
      lastCheckInDate: todayStr,
    };

    setUser(updatedUser);
    localStorage.setItem("medlearn_current_user", JSON.stringify(updatedUser));

    const list = getStoredUsers();
    const idx = list.findIndex((u) => u.id === user.id || u.email?.toLowerCase() === user.email?.toLowerCase());
    if (idx !== -1) {
      list[idx] = updatedUser;
      localStorage.setItem("medlearn_users", JSON.stringify(list));
    }

    return {
      success: true,
      newStreak,
      message: `Điểm danh thành công! Chuỗi học tập của bạn đạt ${newStreak} ngày liên tục (+10 điểm BXH).`,
    };
  };

  // RECORD QUIZ SUBMISSION & UPDATE BLOOM MATRIX
  const recordQuizSubmission = (
    correctCount: number,
    totalCount: number,
    bloomMatrix: BloomScoreMatrix
  ) => {
    if (!user) return;

    const currentTotalQ = (user.totalQuestionsAnswered || 0) + totalCount;
    const currentCorrect = (user.totalCorrectAnswers || 0) + correctCount;
    const newAccuracy = currentTotalQ > 0 ? Math.round((currentCorrect / currentTotalQ) * 100) : 0;

    const updatedBloom = { ...user.bloomTaxonomyStats };
    Object.keys(bloomMatrix).forEach((key) => {
      const bKey = key as BloomLevel;
      const matrixItem = bloomMatrix[bKey];
      if (matrixItem && updatedBloom[bKey]) {
        const newTot = (updatedBloom[bKey].total || 0) + matrixItem.total;
        const newCor = (updatedBloom[bKey].correct || 0) + matrixItem.correct;
        const newPct = newTot > 0 ? Math.round((newCor / newTot) * 100) : 0;
        updatedBloom[bKey] = {
          total: newTot,
          correct: newCor,
          percentage: newPct,
        };
      }
    });

    const updatedUser: UserProfile = {
      ...user,
      totalQuestionsAnswered: currentTotalQ,
      totalCorrectAnswers: currentCorrect,
      overallAccuracy: newAccuracy,
      bloomTaxonomyStats: updatedBloom,
    };

    setUser(updatedUser);
    localStorage.setItem("medlearn_current_user", JSON.stringify(updatedUser));

    const list = getStoredUsers();
    const idx = list.findIndex((u) => u.id === user.id || u.email?.toLowerCase() === user.email?.toLowerCase());
    if (idx !== -1) {
      list[idx] = updatedUser;
      localStorage.setItem("medlearn_users", JSON.stringify(list));
    }
  };

  // LEADERBOARD RANKINGS GENERATION
  const getLeaderboard = (): LeaderboardEntry[] => {
    try {
      const usersList = getStoredUsers();

      const mapped: LeaderboardEntry[] = usersList.map((u) => {
        const streak = u.streakCount || 1;
        const correctAnswers = u.totalCorrectAnswers || 0;
        const rankScore = streak * 10 + correctAnswers * 5;

        return {
          id: u.id,
          name: u.name,
          username: u.username,
          email: u.email,
          role: u.role || "STUDENT",
          medicalSchool: u.medicalSchool || "Đại học Y Dược TP.HCM",
          yearOfStudy: u.yearOfStudy || 4,
          streakCount: streak,
          streakDays: streak,
          totalCorrectAnswers: correctAnswers,
          correctAnswers: correctAnswers,
          totalQuestionsAnswered: u.totalQuestionsAnswered || 0,
          overallAccuracy: u.overallAccuracy || 0,
          rankScore: rankScore,
          isCurrentUser: user?.id === u.id || user?.email?.toLowerCase() === u.email?.toLowerCase(),
          rank: 1,
        };
      });

      mapped.sort((a, b) => b.rankScore - a.rankScore);

      return mapped.map((entry, idx) => ({
        ...entry,
        rank: idx + 1,
      }));
    } catch (e) {
      return [];
    }
  };

  // LOGIN METHOD (Cross-Device Cloud-Synchronized)
  const login = async (
    identity: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanIdentity = identity.trim().toLowerCase();
      const cleanPass = pass.trim();

      if (!cleanIdentity || !cleanPass) {
        return { success: false, error: "Vui lòng nhập đầy đủ tên đăng nhập/email và mật khẩu!" };
      }

      let usersList = getStoredUsers();

      // Step 1: Find user by email or username (ignore password first)
      let accountMatch = usersList.find((u) => {
        const emailMatch = u.email?.trim().toLowerCase() === cleanIdentity;
        const usernameMatch = u.username?.trim().toLowerCase() === cleanIdentity;
        return emailMatch || usernameMatch;
      });

      // Step 2: If not in local, sync from Cloud Database
      if (!accountMatch) {
        usersList = await syncUsersWithCloud();
        accountMatch = usersList.find((u) => {
          const emailMatch = u.email?.trim().toLowerCase() === cleanIdentity;
          const usernameMatch = u.username?.trim().toLowerCase() === cleanIdentity;
          return emailMatch || usernameMatch;
        });
      }

      // Step 3: Account not found anywhere
      if (!accountMatch) {
        return {
          success: false,
          error: "Tài khoản không tồn tại! Vui lòng kiểm tra lại email/tên đăng nhập hoặc tạo tài khoản mới.",
        };
      }

      // Step 4: Account found — now check password
      if (accountMatch.password?.trim() !== cleanPass) {
        return {
          success: false,
          error: "Mật khẩu không chính xác! Vui lòng thử lại hoặc sử dụng tính năng Quên Mật Khẩu.",
        };
      }

      // Step 5: Login successful — safely persist user to localStorage
      const found = accountMatch;
      setUser(found);
      localStorage.setItem("medlearn_current_user", JSON.stringify(found));

      // Ensure this user is persisted in the local users list (prevents account loss)
      const existsInList = usersList.some(
        (u) => u.id === found.id ||
          (u.email && found.email && u.email.toLowerCase().trim() === found.email.toLowerCase().trim())
      );
      if (!existsInList) {
        usersList.push(found);
        localStorage.setItem("medlearn_users", JSON.stringify(usersList));
      }

      // Download user's folders, custom decks & share requests from cloud onto this device
      if (!found.isDemo) {
        await syncUserDataFromCloud(found.id);
        syncShareRequestsFromCloud(found).then((reqs) => {
          if (reqs && reqs.length > 0) setShareRequests(reqs);
        });
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: "Đã xảy ra lỗi đăng nhập, vui lòng thử lại!" };
    }
  };


  // REGISTER METHOD (Cross-Device Cloud-Synchronized)
  const register = async (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    medicalSchool: string;
    yearOfStudy: number;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      // Sync with cloud to ensure latest email/username records
      const usersList = await syncUsersWithCloud();
      const cleanEmail = data.email.trim().toLowerCase();
      const cleanUsername = data.username.trim().toLowerCase();
      const cleanPass = data.password.trim();

      if (!cleanEmail || !cleanUsername || !cleanPass) {
        return {
          success: false,
          error: "Vui lòng điền đầy đủ tất cả các trường thông tin!",
        };
      }

      const existed = usersList.some(
        (u) =>
          u.email?.trim().toLowerCase() === cleanEmail ||
          u.username?.trim().toLowerCase() === cleanUsername
      );

      if (existed) {
        return {
          success: false,
          error: "Email hoặc Tên đăng nhập này đã tồn tại trên hệ thống!",
        };
      }

      const newUserId = `user_${Date.now()}`;
      const newUser: UserProfile = {
        id: newUserId,
        name: data.name.trim() || data.username.trim(),
        username: cleanUsername,
        email: cleanEmail,
        password: cleanPass,
        isDemo: false,
        role: "STUDENT",
        medicalSchool: data.medicalSchool || "Đại học Y Dược TP.HCM",
        yearOfStudy: data.yearOfStudy || 4,
        streakCount: 1,
        lastCheckInDate: new Date().toISOString().split("T")[0],
        totalQuestionsAnswered: 0,
        totalCorrectAnswers: 0,
        overallAccuracy: 0,
        bloomTaxonomyStats: initialCleanBloomStats,
      };

      usersList.push(newUser);
      localStorage.setItem("medlearn_users", JSON.stringify(usersList));
      localStorage.setItem(`medlearn_folders_${newUserId}`, JSON.stringify([]));
      localStorage.setItem(`medlearn_custom_decks_${newUserId}`, JSON.stringify([]));

      // Push new user to Cloud Database
      try {
        await fetch("/api/cloud-sync/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: newUser }),
        });
      } catch (err) {}

      setUser(newUser);
      localStorage.setItem("medlearn_current_user", JSON.stringify(newUser));
      return { success: true };
    } catch (e) {
      return { success: false, error: "Lỗi tạo tài khoản, vui lòng thử lại!" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("medlearn_current_user");
  };

  // FORGOT PASSWORD (Cross-Device Cloud-Synchronized)
  const verifyAccountExists = async (
    identity: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    try {
      const cleanIdentity = identity.toLowerCase().trim();
      let usersList = getStoredUsers();

      let found = usersList.find(
        (u) =>
          u.email?.trim().toLowerCase() === cleanIdentity ||
          u.username?.trim().toLowerCase() === cleanIdentity
      );

      // If not in local, check cloud
      if (!found) {
        usersList = await syncUsersWithCloud();
        found = usersList.find(
          (u) =>
            u.email?.trim().toLowerCase() === cleanIdentity ||
            u.username?.trim().toLowerCase() === cleanIdentity
        );
      }

      if (!found) {
        return {
          success: false,
          error: "Không tìm thấy tài khoản nào khớp với Email hoặc Tên đăng nhập này!",
        };
      }

      return { success: true, user: found };
    } catch (e) {
      return { success: false, error: "Lỗi kiểm tra tài khoản, vui lòng thử lại!" };
    }
  };

  // RESET PASSWORD (Cross-Device Cloud-Synchronized)
  const resetPassword = async (
    identity: string,
    newPass: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanIdentity = identity.toLowerCase().trim();
      const cleanPass = newPass.trim();
      let usersList = getStoredUsers();

      let targetIdx = usersList.findIndex(
        (u) =>
          u.email?.trim().toLowerCase() === cleanIdentity ||
          u.username?.trim().toLowerCase() === cleanIdentity
      );

      if (targetIdx === -1) {
        usersList = await syncUsersWithCloud();
        targetIdx = usersList.findIndex(
          (u) =>
            u.email?.trim().toLowerCase() === cleanIdentity ||
            u.username?.trim().toLowerCase() === cleanIdentity
        );
      }

      if (targetIdx === -1) {
        return { success: false, error: "Không tìm thấy tài khoản để đặt lại mật khẩu!" };
      }

      usersList[targetIdx].password = cleanPass;
      localStorage.setItem("medlearn_users", JSON.stringify(usersList));

      // Push updated password to Cloud Database
      try {
        await fetch("/api/cloud-sync/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: usersList[targetIdx] }),
        });
      } catch (e) {}

      if (user && (user.email?.toLowerCase() === cleanIdentity || user.username?.toLowerCase() === cleanIdentity)) {
        const updated = { ...user, password: cleanPass };
        setUser(updated);
        localStorage.setItem("medlearn_current_user", JSON.stringify(updated));
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: "Lỗi đặt lại mật khẩu!" };
    }
  };

  // Helper to push user folders & custom decks to cloud
  const pushUserDecksAndFoldersToCloud = (targetUserId?: string) => {
    const uid = targetUserId || user?.id;
    if (!uid || user?.isDemo) return;
    try {
      const foldersRaw = localStorage.getItem(`medlearn_folders_${uid}`);
      const decksRaw = localStorage.getItem(`medlearn_custom_decks_${uid}`);
      fetch("/api/cloud-sync/user-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: uid,
          folders: foldersRaw ? JSON.parse(foldersRaw) : undefined,
          decks: decksRaw ? JSON.parse(decksRaw) : undefined,
        }),
      }).catch(() => {});
    } catch (e) {}
  };

  // USER FOLDERS
  const getUserFolders = (): FolderNode[] => {
    if (typeof window === "undefined") return [];
    try {
      if (!user) return [];
      const key = `medlearn_folders_${user.id}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
      if (user.isDemo) {
        return MOCK_FOLDERS;
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  const saveUserFolders = (folders: FolderNode[]): { success: boolean; error?: string } => {
    try {
      if (!user) return { success: false, error: "Vui lòng đăng nhập!" };
      const key = `medlearn_folders_${user.id}`;
      localStorage.setItem(key, JSON.stringify(folders));

      // Asynchronously push to cloud
      pushUserDecksAndFoldersToCloud(user.id);

      return { success: true };
    } catch (e) {
      return { success: false, error: "Lỗi lưu thư mục!" };
    }
  };

  // SCOPED DECKS PER USER (100% Data Isolation)
  const getUserDecks = (typeFilter?: "MCQ" | "FLASHCARD"): DeckWithFolder[] => {
    if (typeof window === "undefined") return [];
    if (!user) return [];

    const collected: DeckWithFolder[] = [];
    const visitedIds = new Set<string>();

    // 1. Traverse current user's folders
    const folders = getUserFolders();
    function traverse(nodes: FolderNode[], pathPrefix: string = "") {
      for (const f of nodes) {
        const currentPath = pathPrefix ? `${pathPrefix} > ${f.name}` : f.name;
        if (f.decks && f.decks.length > 0) {
          for (const d of f.decks) {
            if (!visitedIds.has(d.id) && (!typeFilter || d.type === typeFilter)) {
              visitedIds.add(d.id);
              collected.push({
                ...d,
                folderName: currentPath,
                folderId: f.id,
                folderColor: f.color,
              });
            }
          }
        }
        if (f.children && f.children.length > 0) {
          traverse(f.children, currentPath);
        }
      }
    }
    traverse(folders);

    // 2. Also check user-scoped custom decks
    try {
      const userCustomKey = `medlearn_custom_decks_${user.id}`;
      const userCustomStr = localStorage.getItem(userCustomKey);
      if (userCustomStr) {
        const list: Deck[] = JSON.parse(userCustomStr);
        for (const d of list) {
          if (!visitedIds.has(d.id) && (!typeFilter || d.type === typeFilter)) {
            visitedIds.add(d.id);
            collected.push({
              ...d,
              folderName: "Thư Mục Gốc",
            });
          }
        }
      }
    } catch (e) {}

    // 3. If demo user and empty, fallback to demo decks
    if (collected.length === 0 && user.isDemo) {
      if (!typeFilter || typeFilter === "MCQ") {
        collected.push({
          id: "deck_cardio_01",
          title: "Bộ Đề MCQ Mẫu: Suy Tim & Bệnh Mạch Vành (Demo)",
          description: "Bộ câu hỏi mẫu phân loại theo 6 bậc Bloom về suy tim phân suất tống máu giảm và hội chứng vành cấp.",
          type: "MCQ",
          specialty: "Nội Tim Mạch",
          itemCount: MOCK_MCQ_QUESTIONS.length,
          questions: MOCK_MCQ_QUESTIONS,
          updatedAt: new Date().toISOString().split("T")[0],
          folderName: "Thư Mục Mẫu (Demo)",
        });
      }
      if (!typeFilter || typeFilter === "FLASHCARD") {
        collected.push({
          id: "deck_pharm_01",
          title: "Flashcard Cơ Chế Thuốc Tim Mạch & Cấp Cứu (Demo)",
          description: "Ghi nhớ cơ chế tác dụng, chỉ định & chống chỉ định các nhóm thuốc tim mạch và hồi sức cấp cứu.",
          type: "FLASHCARD",
          specialty: "Dược Lý Lâm Sàng",
          itemCount: MOCK_FLASHCARDS.length,
          flashcards: MOCK_FLASHCARDS,
          updatedAt: new Date().toISOString().split("T")[0],
          folderName: "Thư Mục Mẫu (Demo)",
        });
      }
    }

    return collected;
  };

  // SAVE DECK PER USER & ATTACH TO TARGET FOLDER
  const saveUserDeck = (
    deck: Deck,
    targetFolderId: string,
    newFolderName?: string,
    parentFolderId?: string
  ): { success: boolean; error?: string } => {
    if (!user) return { success: false, error: "Vui lòng đăng nhập!" };

    // 1. Save to User's Scoped Custom Decks
    try {
      const userCustomKey = `medlearn_custom_decks_${user.id}`;
      const stored = localStorage.getItem(userCustomKey);
      const list: Deck[] = stored ? JSON.parse(stored) : [];
      list.unshift(deck);
      localStorage.setItem(userCustomKey, JSON.stringify(list));
    } catch (e) {}

    // 2. Attach to Destination Folder in User's Folder Tree
    const currentFolders = getUserFolders();
    if (targetFolderId === "CREATE_NEW") {
      const newFolder: FolderNode = {
        id: `folder_${Date.now()}`,
        name: newFolderName || "Thư Mục Mới",
        description: `Thư mục môn học ${deck.specialty}`,
        color: deck.type === "MCQ" ? "#0284c7" : "#8b5cf6",
        icon: "Folder",
        decks: [deck],
        children: [],
        createdAt: new Date().toLocaleDateString("vi-VN"),
      };

      if (parentFolderId && parentFolderId !== "ROOT") {
        function insertIntoParent(nodes: FolderNode[]): FolderNode[] {
          return nodes.map((f) => {
            if (f.id === parentFolderId) {
              return {
                ...f,
                children: [newFolder, ...(f.children || [])],
              };
            }
            if (f.children && f.children.length > 0) {
              return {
                ...f,
                children: insertIntoParent(f.children),
              };
            }
            return f;
          });
        }
        const updated = insertIntoParent(currentFolders);
        saveUserFolders(updated);
      } else {
        saveUserFolders([newFolder, ...currentFolders]);
      }
    } else {
      function addDeckToTree(nodes: FolderNode[]): FolderNode[] {
        return nodes.map((f) => {
          if (f.id === targetFolderId) {
            return {
              ...f,
              decks: [deck, ...(f.decks || [])],
            };
          }
          if (f.children && f.children.length > 0) {
            return {
              ...f,
              children: addDeckToTree(f.children),
            };
          }
          return f;
        });
      }
      const updated = addDeckToTree(currentFolders);
      saveUserFolders(updated);
    }

    return { success: true };
  };

  // DELETE DECK PER USER (Synchronized across all views)
  const deleteUserDeck = (deckId: string): { success: boolean; error?: string } => {
    if (!user) return { success: false, error: "Vui lòng đăng nhập!" };

    // 1. Remove from User's Folders
    const currentFolders = getUserFolders();
    const removeDeckFromHierarchy = (nodes: FolderNode[]): FolderNode[] => {
      return nodes.map((f) => ({
        ...f,
        decks: (f.decks || []).filter((d) => d.id !== deckId),
        children: f.children ? removeDeckFromHierarchy(f.children) : [],
      }));
    };
    const updated = removeDeckFromHierarchy(currentFolders);
    saveUserFolders(updated);

    // 2. Remove from User's Scoped Custom Decks
    try {
      const userCustomKey = `medlearn_custom_decks_${user.id}`;
      const stored = localStorage.getItem(userCustomKey);
      if (stored) {
        const list: Deck[] = JSON.parse(stored);
        const filtered = list.filter((d) => d.id !== deckId);
        localStorage.setItem(userCustomKey, JSON.stringify(filtered));
      }
    } catch (e) {}

    return { success: true };
  };

  // APPEND ITEMS (MCQ / FLASHCARDS) TO AN EXISTING DECK
  const appendItemsToExistingDeck = (
    deckId: string,
    newQuestions?: MCQQuestion[],
    newFlashcards?: FlashcardItem[]
  ): { success: boolean; error?: string; updatedDeck?: Deck; folderName?: string } => {
    if (!user) return { success: false, error: "Vui lòng đăng nhập!" };

    let foundDeck: Deck | null = null;
    let foundFolderName = "Cây Thư Mục";
    const currentFolders = getUserFolders();

    // 1. Update inside User's Folder Tree
    const updateInTree = (nodes: FolderNode[], pathPrefix = ""): FolderNode[] => {
      return nodes.map((f) => {
        const currentPath = pathPrefix ? `${pathPrefix} / ${f.name}` : f.name;
        const updatedDecks = (f.decks || []).map((d) => {
          if (d.id === deckId) {
            const updatedQuestions = newQuestions && newQuestions.length > 0
              ? [...(d.questions || []), ...newQuestions]
              : d.questions;
            const updatedCards = newFlashcards && newFlashcards.length > 0
              ? [...(d.flashcards || []), ...newFlashcards]
              : d.flashcards;
            const newCount = d.type === "MCQ" ? (updatedQuestions?.length || 0) : (updatedCards?.length || 0);

            const modified: Deck = {
              ...d,
              questions: updatedQuestions,
              flashcards: updatedCards,
              itemCount: newCount,
              updatedAt: new Date().toISOString().split("T")[0],
            };
            foundDeck = modified;
            foundFolderName = currentPath;
            return modified;
          }
          return d;
        });

        return {
          ...f,
          decks: updatedDecks,
          children: f.children ? updateInTree(f.children, currentPath) : [],
        };
      });
    };

    const updatedFolders = updateInTree(currentFolders);
    saveUserFolders(updatedFolders);

    // 2. Also update in User's Scoped Custom Decks
    try {
      const userCustomKey = `medlearn_custom_decks_${user.id}`;
      const stored = localStorage.getItem(userCustomKey);
      if (stored) {
        const list: Deck[] = JSON.parse(stored);
        const updatedList = list.map((d) => {
          if (d.id === deckId) {
            const updatedQuestions = newQuestions && newQuestions.length > 0
              ? [...(d.questions || []), ...newQuestions]
              : d.questions;
            const updatedCards = newFlashcards && newFlashcards.length > 0
              ? [...(d.flashcards || []), ...newFlashcards]
              : d.flashcards;
            const newCount = d.type === "MCQ" ? (updatedQuestions?.length || 0) : (updatedCards?.length || 0);

            const modified: Deck = {
              ...d,
              questions: updatedQuestions,
              flashcards: updatedCards,
              itemCount: newCount,
              updatedAt: new Date().toISOString().split("T")[0],
            };
            if (!foundDeck) foundDeck = modified;
            return modified;
          }
          return d;
        });
        localStorage.setItem(userCustomKey, JSON.stringify(updatedList));
      }
    } catch (e) {}

    if (!foundDeck) {
      return { success: false, error: "Không tìm thấy bộ đề trong hệ thống!" };
    }

    return { success: true, updatedDeck: foundDeck, folderName: foundFolderName };
  };

  // UPDATE DECK (RENAME & CHANGE MEDICAL SPECIALTY)
  const updateUserDeck = (
    deckId: string,
    updates: { title?: string; specialty?: string; description?: string }
  ): { success: boolean; error?: string; updatedDeck?: Deck } => {
    if (!user) return { success: false, error: "Vui lòng đăng nhập!" };

    let foundDeck: Deck | null = null;
    const currentFolders = getUserFolders();

    // 1. Update in User's Folder Tree
    const updateInTree = (nodes: FolderNode[]): FolderNode[] => {
      return nodes.map((f) => {
        const updatedDecks = (f.decks || []).map((d) => {
          if (d.id === deckId) {
            const modified: Deck = {
              ...d,
              ...(updates.title?.trim() ? { title: updates.title.trim() } : {}),
              ...(updates.specialty?.trim() ? { specialty: updates.specialty.trim() } : {}),
              ...(updates.description !== undefined ? { description: updates.description.trim() } : {}),
              updatedAt: new Date().toISOString().split("T")[0],
            };
            foundDeck = modified;
            return modified;
          }
          return d;
        });

        return {
          ...f,
          decks: updatedDecks,
          children: f.children ? updateInTree(f.children) : [],
        };
      });
    };

    const updatedFolders = updateInTree(currentFolders);
    saveUserFolders(updatedFolders);

    // 2. Also update in User's Scoped Custom Decks
    try {
      const userCustomKey = `medlearn_custom_decks_${user.id}`;
      const stored = localStorage.getItem(userCustomKey);
      if (stored) {
        const list: Deck[] = JSON.parse(stored);
        const updatedList = list.map((d) => {
          if (d.id === deckId) {
            const modified: Deck = {
              ...d,
              ...(updates.title?.trim() ? { title: updates.title.trim() } : {}),
              ...(updates.specialty?.trim() ? { specialty: updates.specialty.trim() } : {}),
              ...(updates.description !== undefined ? { description: updates.description.trim() } : {}),
              updatedAt: new Date().toISOString().split("T")[0],
            };
            if (!foundDeck) foundDeck = modified;
            return modified;
          }
          return d;
        });
        localStorage.setItem(userCustomKey, JSON.stringify(updatedList));
      }
    } catch (e) {}

    if (!foundDeck) {
      return { success: false, error: "Không tìm thấy bộ đề để cập nhật!" };
    }

    return { success: true, updatedDeck: foundDeck };
  };

  // FOLDER & DECK SHARING (Cloud Synchronized)
  const sendShareRequest = async (
    item: FolderNode | Deck,
    target: string,
    itemType: "FOLDER" | "DECK" = "FOLDER"
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) return { success: false, error: "Vui lòng đăng nhập!" };

      const cleanTarget = target.toLowerCase().trim();
      let usersList = getStoredUsers();
      let targetUserObj = usersList.find(
        (u) =>
          u.email?.toLowerCase().trim() === cleanTarget ||
          u.username?.toLowerCase().trim() === cleanTarget
      );

      // If not in local, check cloud database
      if (!targetUserObj) {
        try {
          const res = await fetch(
            `/api/cloud-sync/users?identity=${encodeURIComponent(cleanTarget)}`,
            { cache: "no-store" }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.users) {
              const cloudUsers: any[] = data.users;
              targetUserObj = cloudUsers.find(
                (u: any) =>
                  u.email?.toLowerCase().trim() === cleanTarget ||
                  u.username?.toLowerCase().trim() === cleanTarget
              );
              if (targetUserObj) {
                // Merge into local
                const merged = [...usersList, targetUserObj];
                try { localStorage.setItem("medlearn_users", JSON.stringify(merged)); } catch (e) {}
              }
            }
          }
        } catch (fetchErr) {}
      }

      // Fallback: full sync
      if (!targetUserObj) {
        usersList = await syncUsersWithCloud();
        targetUserObj = usersList.find(
          (u) =>
            u.email?.toLowerCase().trim() === cleanTarget ||
            u.username?.toLowerCase().trim() === cleanTarget
        );
      }

      if (!targetUserObj) {
        return {
          success: false,
          error: `Không tìm thấy người dùng "${target}" trong hệ thống! Vui lòng kiểm tra lại email hoặc tên đăng nhập.`,
        };
      }

      if (targetUserObj.id === user.id) {
        return {
          success: false,
          error: "Bạn không thể tự chia sẻ tài liệu cho chính mình!",
        };
      }

      const isDeck = itemType === "DECK";
      const folderItem = !isDeck ? (item as FolderNode) : undefined;
      const deckItem = isDeck ? (item as Deck) : undefined;

      const newRequest: FolderShareRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        folderId: folderItem?.id || "",
        folderName: folderItem?.name || deckItem?.title || "Tài Liệu Y Khoa",
        folderData: folderItem,
        deckData: deckItem,
        deckTitle: deckItem?.title,
        itemType,
        ownerId: user.id,
        ownerName: user.name,
        ownerEmail: user.email,
        ownerSchool: user.medicalSchool,
        // Store BOTH email and username of recipient for matching
        recipientIdentity: targetUserObj.email?.toLowerCase().trim() || targetUserObj.username?.toLowerCase().trim(),
        recipientEmail: targetUserObj.email?.toLowerCase().trim(),
        recipientUsername: targetUserObj.username?.toLowerCase().trim(),
        targetUsernameOrEmail: targetUserObj.email?.toLowerCase().trim() || targetUserObj.username?.toLowerCase().trim(),
        recipientId: targetUserObj.id,
        status: "PENDING",
        createdAt: new Date().toLocaleDateString("vi-VN"),
      };

      // Push ONLY to Cloud Gist — do NOT add to sender's local shareRequests state
      // so that the invitation only appears in the RECIPIENT's inbox
      try {
        const res = await fetch("/api/cloud-sync/share-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shareRequest: newRequest }),
        });
        if (!res.ok) {
          return { success: false, error: "Không thể gửi lời mời lên đám mây, vui lòng thử lại!" };
        }
      } catch (err) {
        return { success: false, error: "Lỗi kết nối khi gửi lời mời chia sẻ!" };
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: "Lỗi gửi yêu cầu chia sẻ!" };
    }
  };


  const respondShareRequest = async (
    requestId: string,
    accept: boolean,
    targetFolderId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const existingSharesStr = localStorage.getItem("medlearn_share_requests");
      let list: FolderShareRequest[] = existingSharesStr
        ? JSON.parse(existingSharesStr)
        : [];

      const reqIndex = list.findIndex((r) => r.id === requestId);
      if (reqIndex === -1) return { success: false, error: "Yêu cầu không tồn tại!" };

      const req = list[reqIndex];
      req.status = accept ? "ACCEPTED" : "REJECTED";
      list[reqIndex] = req;

      localStorage.setItem("medlearn_share_requests", JSON.stringify(list));
      setShareRequests(list);

      // Push update status to Cloud Gist
      try {
        fetch("/api/cloud-sync/share-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updateRequest: { id: requestId, status: req.status } }),
        }).catch(() => {});
      } catch (e) {}

      if (accept && user) {
        const userFolders = getUserFolders();

        if (req.itemType === "DECK" && req.deckData) {
          // Add single shared deck to user's collection
          const sharedDeckCopy: Deck = {
            ...req.deckData,
            id: `shared_deck_${Date.now()}`,
            title: `${req.deckData.title} (Từ ${req.ownerName})`,
            updatedAt: new Date().toISOString().split("T")[0],
          };

          saveUserDeck(
            sharedDeckCopy,
            targetFolderId || (userFolders.length > 0 ? userFolders[0].id : "CREATE_NEW"),
            "Thư Mục Được Chia Sẻ"
          );
        } else if (req.folderData) {
          // Add whole folder
          const sharedFolderCopy: FolderNode = {
            ...req.folderData,
            id: `shared_folder_${Date.now()}`,
            name: `${req.folderData.name} (Từ ${req.ownerName})`,
            isShared: true,
            sharedBy: req.ownerName,
          };

          const updatedFolders = [sharedFolderCopy, ...userFolders];
          saveUserFolders(updatedFolders);

          // Extract all decks from shared folder into user's custom decks
          const customKey = `medlearn_custom_decks_${user.id}`;
          const currentCustomDecks: Deck[] = localStorage.getItem(customKey)
            ? JSON.parse(localStorage.getItem(customKey)!)
            : [];

          const extractDecks = (nodes: FolderNode[]): Deck[] => {
            let res: Deck[] = [];
            for (const n of nodes) {
              if (n.decks) res.push(...n.decks);
              if (n.children) res.push(...extractDecks(n.children));
            }
            return res;
          };

          const decksInSharedFolder = extractDecks([sharedFolderCopy]);
          const newDecksList = [...decksInSharedFolder, ...currentCustomDecks];
          localStorage.setItem(customKey, JSON.stringify(newDecksList));
          pushUserDecksAndFoldersToCloud(user.id);
        }
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: "Lỗi xử lý phản hồi chia sẻ!" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        checkInDaily,
        recordQuizSubmission,
        getLeaderboard,
        verifyAccountExists,
        resetPassword,
        shareRequests,
        sendShareRequest,
        respondShareRequest,
        getUserFolders,
        saveUserFolders,
        getUserDecks,
        saveUserDeck,
        deleteUserDeck,
        appendItemsToExistingDeck,
        updateUserDeck,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
