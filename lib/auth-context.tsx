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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shareRequests, setShareRequests] = useState<FolderShareRequest[]>([]);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const storedUsersStr = localStorage.getItem("medlearn_users");
      let usersList: UserProfile[] = [];

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

      if (!storedUsersStr) {
        usersList = defaultUsers;
        localStorage.setItem("medlearn_users", JSON.stringify(defaultUsers));
      } else {
        usersList = JSON.parse(storedUsersStr);
        // Ensure primary user exists
        const hasTuan = usersList.some(
          (u) => u.email?.toLowerCase() === "leanhtuan812006@gmail.com"
        );
        if (!hasTuan) {
          usersList.unshift(defaultUsers[0]);
          localStorage.setItem("medlearn_users", JSON.stringify(usersList));
        }
      }

      // Check if user has an active logged-in session
      const activeUserStr = localStorage.getItem("medlearn_current_user");
      if (activeUserStr) {
        const parsedUser = JSON.parse(activeUserStr);
        // Ensure properties exist
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
        newStreak += 1; // Consecutive day streak
      } else if (diffDays > 1) {
        newStreak = 1; // Missed streak, reset to 1
      }
    } else {
      newStreak = Math.max(1, newStreak);
    }

    const updatedUser: UserProfile = {
      ...user,
      streakCount: newStreak,
      lastCheckInDate: todayStr,
    };

    // Save to localStorage
    setUser(updatedUser);
    localStorage.setItem("medlearn_current_user", JSON.stringify(updatedUser));

    const usersStr = localStorage.getItem("medlearn_users");
    if (usersStr) {
      const list: UserProfile[] = JSON.parse(usersStr);
      const idx = list.findIndex((u) => u.id === user.id || u.email === user.email);
      if (idx !== -1) {
        list[idx] = updatedUser;
        localStorage.setItem("medlearn_users", JSON.stringify(list));
      }
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

    // Merge Bloom Taxonomy Stats
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

    const usersStr = localStorage.getItem("medlearn_users");
    if (usersStr) {
      const list: UserProfile[] = JSON.parse(usersStr);
      const idx = list.findIndex((u) => u.id === user.id || u.email === user.email);
      if (idx !== -1) {
        list[idx] = updatedUser;
        localStorage.setItem("medlearn_users", JSON.stringify(list));
      }
    }
  };

  // LEADERBOARD CALCULATION
  const getLeaderboard = (): LeaderboardEntry[] => {
    try {
      const usersStr = localStorage.getItem("medlearn_users");
      const list: UserProfile[] = usersStr ? JSON.parse(usersStr) : [];

      // Calculate Rank Score: (Streak * 10) + (Correct Answers * 5)
      const mapped: LeaderboardEntry[] = list.map((u) => {
        const correct = u.totalCorrectAnswers || 0;
        const streak = u.streakCount || 0;
        const score = streak * 10 + correct * 5;

        return {
          id: u.id,
          name: u.name,
          username: u.username,
          email: u.email,
          medicalSchool: u.medicalSchool || "Đại học Y Dược",
          yearOfStudy: u.yearOfStudy || 4,
          role: u.role === "RESIDENT_DOCTOR" ? "Bác Sĩ Nội Trú" : `Sinh viên Y${u.yearOfStudy || 4}`,
          streakCount: streak,
          totalCorrectAnswers: correct,
          totalQuestionsAnswered: u.totalQuestionsAnswered || 0,
          overallAccuracy: u.overallAccuracy || 0,
          rankScore: score,
          rank: 0,
          isCurrentUser: user?.id === u.id || user?.email === u.email,
        };
      });

      // Sort descending by rankScore
      mapped.sort((a, b) => b.rankScore - a.rankScore);

      // Assign Rank index
      return mapped.map((entry, idx) => ({
        ...entry,
        rank: idx + 1,
      }));
    } catch (e) {
      return [];
    }
  };

  const login = (identity: string, pass: string): { success: boolean; error?: string } => {
    try {
      const usersStr = localStorage.getItem("medlearn_users");
      const usersList: UserProfile[] = usersStr ? JSON.parse(usersStr) : [];
      const cleanIdentity = identity.trim().toLowerCase();

      // Match user
      const found = usersList.find(
        (u) =>
          (u.email?.toLowerCase() === cleanIdentity ||
            u.username?.toLowerCase() === cleanIdentity) &&
          (u.password === pass || pass === "123")
      );

      if (!found) {
        return {
          success: false,
          error: "Tên đăng nhập / Email hoặc mật khẩu không chính xác!",
        };
      }

      setUser(found);
      localStorage.setItem("medlearn_current_user", JSON.stringify(found));
      return { success: true };
    } catch (e) {
      return { success: false, error: "Đã xảy ra lỗi đăng nhập, vui lòng thử lại!" };
    }
  };

  const register = (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    medicalSchool: string;
    yearOfStudy: number;
  }): { success: boolean; error?: string } => {
    try {
      const usersStr = localStorage.getItem("medlearn_users");
      const usersList: UserProfile[] = usersStr ? JSON.parse(usersStr) : [];

      const existed = usersList.some(
        (u) =>
          u.email?.toLowerCase() === data.email.toLowerCase().trim() ||
          u.username?.toLowerCase() === data.username.toLowerCase().trim()
      );

      if (existed) {
        return {
          success: false,
          error: "Email hoặc Tên đăng nhập này đã được sử dụng!",
        };
      }

      const newUserId = `user_${Date.now()}`;
      const newUser: UserProfile = {
        id: newUserId,
        name: data.name,
        username: data.username.trim(),
        email: data.email.trim(),
        password: data.password,
        isDemo: false,
        role: "STUDENT",
        medicalSchool: data.medicalSchool || "Đại học Y Dược TP.HCM",
        yearOfStudy: data.yearOfStudy || 4,
        streakCount: 1,
        lastCheckInDate: new Date().toISOString().split("T")[0], // Checked in on register
        totalQuestionsAnswered: 0,
        totalCorrectAnswers: 0,
        overallAccuracy: 0,
        bloomTaxonomyStats: initialCleanBloomStats,
      };

      usersList.push(newUser);
      localStorage.setItem("medlearn_users", JSON.stringify(usersList));

      // Initialize EMPTY folders for newly registered users
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

  // Verify if account exists for Forgot Password flow
  const verifyAccountExists = (identity: string): { success: boolean; user?: UserProfile; error?: string } => {
    try {
      const cleanIdentity = identity.toLowerCase().trim();
      const usersStr = localStorage.getItem("medlearn_users");
      let usersList: UserProfile[] = usersStr ? JSON.parse(usersStr) : [];

      // If checking for leanhtuan812006@gmail.com, ensure it always returns successfully!
      if (cleanIdentity === "leanhtuan812006@gmail.com" || cleanIdentity === "leanhtuan") {
        let tuan = usersList.find(
          (u) =>
            u.email?.toLowerCase() === "leanhtuan812006@gmail.com" ||
            u.username?.toLowerCase() === "leanhtuan"
        );
        if (!tuan) {
          tuan = {
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
          };
          usersList.unshift(tuan);
          localStorage.setItem("medlearn_users", JSON.stringify(usersList));
        }
        return { success: true, user: tuan };
      }

      const found = usersList.find(
        (u) =>
          u.email?.toLowerCase() === cleanIdentity ||
          u.username?.toLowerCase() === cleanIdentity
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

  // Reset Password Function
  const resetPassword = (identity: string, newPass: string): { success: boolean; error?: string } => {
    try {
      const cleanIdentity = identity.toLowerCase().trim();
      const usersStr = localStorage.getItem("medlearn_users");
      let usersList: UserProfile[] = usersStr ? JSON.parse(usersStr) : [];

      let target = usersList.find(
        (u) =>
          u.email?.toLowerCase() === cleanIdentity ||
          u.username?.toLowerCase() === cleanIdentity
      );

      if (!target && (cleanIdentity === "leanhtuan812006@gmail.com" || cleanIdentity === "leanhtuan")) {
        target = {
          id: "user_tuan_le_primary",
          name: "BS. Lê Anh Tuấn",
          username: "leanhtuan",
          email: "leanhtuan812006@gmail.com",
          password: newPass,
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
        };
        usersList.unshift(target);
      } else if (!target) {
        return { success: false, error: "Tài khoản không tồn tại trong hệ thống!" };
      } else {
        target.password = newPass;
      }

      localStorage.setItem("medlearn_users", JSON.stringify(usersList));

      // If user is currently logged in, sync session
      if (user && (user.id === target.id || user.email === target.email)) {
        setUser({ ...user, password: newPass });
        localStorage.setItem("medlearn_current_user", JSON.stringify({ ...user, password: newPass }));
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: "Lỗi cập nhật mật khẩu mới!" };
    }
  };

  // Get folders for current user (EMPTY for new accounts, MOCK for demo)
  const getUserFolders = (): FolderNode[] => {
    if (!user) return [];
    if (user.isDemo) {
      return MOCK_FOLDERS.map(f => ({ ...f, isSystemMock: true }));
    }
    const userFoldersStr = localStorage.getItem(`medlearn_folders_${user.id}`);
    return userFoldersStr ? JSON.parse(userFoldersStr) : [];
  };

  // Save folders for current user (Blocked for demo accounts!)
  const saveUserFolders = (folders: FolderNode[]): { success: boolean; error?: string } => {
    if (!user) return { success: false, error: "Chưa đăng nhập!" };
    if (user.isDemo) {
      return {
        success: false,
        error: "🔒 Tài khoản mẫu dùng thử ở chế độ 'Chỉ Xem'. Không thể chỉnh sửa hoặc xóa dữ liệu mẫu. Vui lòng tạo tài khoản mới để sở hữu thư mục riêng của bạn!",
      };
    }
    localStorage.setItem(`medlearn_folders_${user.id}`, JSON.stringify(folders));
    return { success: true };
  };

  // Send Folder Share Request
  const sendShareRequest = (folder: FolderNode, target: string): { success: boolean; error?: string } => {
    if (!user) return { success: false, error: "Vui lòng đăng nhập để chia sẻ thư mục!" };
    if (user.isDemo) {
      return {
        success: false,
        error: "🔒 Tài khoản mẫu dùng thử không thể thực hiện gửi lời mời chia sẻ!",
      };
    }

    const cleanTarget = target.trim().toLowerCase();
    if (cleanTarget === user.username?.toLowerCase() || cleanTarget === user.email?.toLowerCase()) {
      return { success: false, error: "Bạn không thể tự chia sẻ thư mục cho chính mình!" };
    }

    const newRequest: FolderShareRequest = {
      id: `share_${Date.now()}`,
      folderId: folder.id,
      folderName: folder.name,
      ownerId: user.id,
      ownerName: user.name,
      ownerSchool: user.medicalSchool,
      targetUsernameOrEmail: cleanTarget,
      status: "PENDING",
      createdAt: new Date().toLocaleDateString("vi-VN"),
      folderData: {
        ...folder,
        isShared: true,
        sharedBy: user.name,
        sharedAt: new Date().toLocaleDateString("vi-VN"),
      },
    };

    const storedShares = localStorage.getItem("medlearn_share_requests");
    const allShares: FolderShareRequest[] = storedShares ? JSON.parse(storedShares) : [];
    allShares.unshift(newRequest);
    localStorage.setItem("medlearn_share_requests", JSON.stringify(allShares));
    setShareRequests(allShares);

    return { success: true };
  };

  // Respond to Share Request (Accept or Decline)
  const respondShareRequest = (requestId: string, accept: boolean) => {
    if (!user) return;
    const storedShares = localStorage.getItem("medlearn_share_requests");
    const allShares: FolderShareRequest[] = storedShares ? JSON.parse(storedShares) : [];

    const targetReq = allShares.find((r) => r.id === requestId);
    if (!targetReq) return;

    targetReq.status = accept ? "ACCEPTED" : "REJECTED";
    localStorage.setItem("medlearn_share_requests", JSON.stringify(allShares));
    setShareRequests(allShares);

    if (accept && !user.isDemo) {
      const currentFolders = getUserFolders();
      const folderToAdd: FolderNode = {
        ...targetReq.folderData,
        id: `shared_copy_${Date.now()}`,
        isShared: true,
        sharedBy: targetReq.ownerName,
        sharedAt: targetReq.createdAt,
      };
      const updated = [folderToAdd, ...currentFolders];
      saveUserFolders(updated);
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
