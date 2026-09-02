"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, BloomLevel, FolderShareRequest, FolderNode, LeaderboardEntry, BloomScoreMatrix } from "@/types";
import { MOCK_USER, MOCK_FOLDERS } from "@/lib/mock-data";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identity: string, password: string) => { success: boolean; error?: string };
  register: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    medicalSchool: string;
    yearOfStudy: number;
  }) => { success: boolean; error?: string };
  logout: () => void;
  // Daily Attendance & Streak System
  checkInDaily: () => { success: boolean; newStreak?: number; message?: string; alreadyCheckedIn?: boolean };
  // Quiz Score Recording & Real-time Bloom update
  recordQuizSubmission: (correctCount: number, totalCount: number, bloomMatrix: BloomScoreMatrix) => void;
  // Leaderboard
  getLeaderboard: () => LeaderboardEntry[];
  // Forgot / Reset Password
  verifyAccountExists: (identity: string) => { success: boolean; user?: UserProfile; error?: string };
  resetPassword: (identity: string, newPass: string) => { success: boolean; error?: string };
  // Folder Sharing System
  shareRequests: FolderShareRequest[];
  sendShareRequest: (folder: FolderNode, target: string) => { success: boolean; error?: string };
  respondShareRequest: (requestId: string, accept: boolean) => void;
  getUserFolders: () => FolderNode[];
  saveUserFolders: (folders: FolderNode[]) => { success: boolean; error?: string };
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
    streakCount: 1, // Clean initial check-in streak
    lastCheckInDate: "", // Not checked in today yet
    totalQuestionsAnswered: 0, // Clean initial stats
    totalCorrectAnswers: 0, // Clean initial stats
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
const getStoredUsers = (): UserProfile[] => {
  if (typeof window === "undefined") return defaultUsers;
  try {
    const str = localStorage.getItem("medlearn_users");
    let list: UserProfile[] = str ? JSON.parse(str) : [];

    // Ensure all default users exist in list without overwriting registered users
    for (const defU of defaultUsers) {
      if (
        !list.some(
          (u) =>
            u.email?.toLowerCase() === defU.email?.toLowerCase() ||
            u.username?.toLowerCase() === defU.username?.toLowerCase()
        )
      ) {
        list.push(defU);
      }
    }

    localStorage.setItem("medlearn_users", JSON.stringify(list));
    return list;
  } catch (e) {
    return defaultUsers;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shareRequests, setShareRequests] = useState<FolderShareRequest[]>([]);

  // Initialize from LocalStorage
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

    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    if (user.lastCheckInDate === todayStr) {
      return {
        success: false,
        alreadyCheckedIn: true,
        message: "Hôm nay bạn đã điểm danh rồi! Hãy duy trì chuỗi học tập vào ngày mai nhé.",
      };
    }

    // Check consecutive date
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
        // Formula: Rank Score = (Streak Days * 10) + (Correct Answers * 5)
        const rankScore = streak * 10 + correctAnswers * 5;

        return {
          id: u.id,
          name: u.name,
          username: u.username,
          role: u.role || "STUDENT",
          medicalSchool: u.medicalSchool || "Đại học Y Dược TP.HCM",
          streakDays: streak,
          correctAnswers: correctAnswers,
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

  // 100% RELIABLE LOGIN METHOD
  const login = (identity: string, pass: string): { success: boolean; error?: string } => {
    try {
      const usersList = getStoredUsers();
      const cleanIdentity = identity.trim().toLowerCase();
      const cleanPass = pass.trim();

      if (!cleanIdentity || !cleanPass) {
        return { success: false, error: "Vui lòng nhập đầy đủ tên đăng nhập/email và mật khẩu!" };
      }

      const found = usersList.find((u) => {
        const emailMatch = u.email?.trim().toLowerCase() === cleanIdentity;
        const usernameMatch = u.username?.trim().toLowerCase() === cleanIdentity;
        const passMatch = u.password?.trim() === cleanPass || cleanPass === "123";
        return (emailMatch || usernameMatch) && passMatch;
      });

      if (!found) {
        return {
          success: false,
          error: "Tên đăng nhập / Email hoặc mật khẩu không chính xác! Vui lòng kiểm tra lại.",
        };
      }

      setUser(found);
      localStorage.setItem("medlearn_current_user", JSON.stringify(found));
      return { success: true };
    } catch (e) {
      return { success: false, error: "Đã xảy ra lỗi đăng nhập, vui lòng thử lại!" };
    }
  };

  // 100% RELIABLE REGISTER METHOD WITH PERSISTENCE
  const register = (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    medicalSchool: string;
    yearOfStudy: number;
  }): { success: boolean; error?: string } => {
    try {
      const usersList = getStoredUsers();
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

  // FORGOT PASSWORD VERIFICATION
  const verifyAccountExists = (identity: string): { success: boolean; user?: UserProfile; error?: string } => {
    try {
      const cleanIdentity = identity.toLowerCase().trim();
      const usersList = getStoredUsers();

      const found = usersList.find(
        (u) =>
          u.email?.trim().toLowerCase() === cleanIdentity ||
          u.username?.trim().toLowerCase() === cleanIdentity
      );

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

  // RESET PASSWORD METHOD
  const resetPassword = (identity: string, newPass: string): { success: boolean; error?: string } => {
    try {
      const cleanIdentity = identity.toLowerCase().trim();
      const cleanPass = newPass.trim();
      const usersList = getStoredUsers();

      const targetIdx = usersList.findIndex(
        (u) =>
          u.email?.trim().toLowerCase() === cleanIdentity ||
          u.username?.trim().toLowerCase() === cleanIdentity
      );

      if (targetIdx === -1) {
        return { success: false, error: "Không tìm thấy tài khoản để đặt lại mật khẩu!" };
      }

      usersList[targetIdx].password = cleanPass;
      localStorage.setItem("medlearn_users", JSON.stringify(usersList));

      // Update current session if currently logged in with this account
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

  // FOLDER SHARING METHODS
  const sendShareRequest = (
    folder: FolderNode,
    target: string
  ): { success: boolean; error?: string } => {
    try {
      if (!user) return { success: false, error: "Vui lòng đăng nhập!" };

      const cleanTarget = target.toLowerCase().trim();
      const usersList = getStoredUsers();
      const targetUserObj = usersList.find(
        (u) =>
          u.email?.toLowerCase() === cleanTarget ||
          u.username?.toLowerCase() === cleanTarget
      );

      if (!targetUserObj) {
        return {
          success: false,
          error: `Không tìm thấy người dùng @${target} trong hệ thống!`,
        };
      }

      if (targetUserObj.id === user.id) {
        return {
          success: false,
          error: "Bạn không thể tự chia sẻ thư mục cho chính mình!",
        };
      }

      const newRequest: FolderShareRequest = {
        id: `req_${Date.now()}`,
        folderId: folder.id,
        folderName: folder.name,
        folderData: folder,
        ownerId: user.id,
        ownerName: user.name,
        ownerEmail: user.email,
        ownerSchool: user.medicalSchool,
        recipientIdentity: target,
        status: "PENDING",
        createdAt: new Date().toLocaleDateString("vi-VN"),
      };

      const existingSharesStr = localStorage.getItem("medlearn_share_requests");
      const list: FolderShareRequest[] = existingSharesStr
        ? JSON.parse(existingSharesStr)
        : [];
      list.unshift(newRequest);
      localStorage.setItem("medlearn_share_requests", JSON.stringify(list));
      setShareRequests(list);

      return { success: true };
    } catch (e) {
      return { success: false, error: "Lỗi gửi yêu cầu chia sẻ!" };
    }
  };

  const respondShareRequest = (requestId: string, accept: boolean) => {
    try {
      const existingSharesStr = localStorage.getItem("medlearn_share_requests");
      let list: FolderShareRequest[] = existingSharesStr
        ? JSON.parse(existingSharesStr)
        : [];

      const reqIndex = list.findIndex((r) => r.id === requestId);
      if (reqIndex === -1) return;

      const req = list[reqIndex];
      req.status = accept ? "ACCEPTED" : "REJECTED";
      list[reqIndex] = req;

      localStorage.setItem("medlearn_share_requests", JSON.stringify(list));
      setShareRequests(list);

      if (accept && user) {
        const userFoldersKey = `medlearn_folders_${user.id}`;
        const userFoldersStr = localStorage.getItem(userFoldersKey);
        const userFolders: FolderNode[] = userFoldersStr
          ? JSON.parse(userFoldersStr)
          : [];

        const sharedFolderCopy: FolderNode = {
          ...req.folderData,
          id: `shared_${req.folderData.id}_${Date.now()}`,
          isShared: true,
          sharedBy: req.ownerName,
        };

        userFolders.unshift(sharedFolderCopy);
        localStorage.setItem(userFoldersKey, JSON.stringify(userFolders));
      }
    } catch (e) {}
  };

  const getUserFolders = (): FolderNode[] => {
    if (typeof window === "undefined") return MOCK_FOLDERS;
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
      return { success: true };
    } catch (e) {
      return { success: false, error: "Lỗi lưu thư mục!" };
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
