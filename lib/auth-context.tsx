"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, BloomLevel, FolderShareRequest, FolderNode } from "@/types";
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
  updateUserStreak: () => void;
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

const defaultStats: Record<BloomLevel, { total: number; correct: number; percentage: number }> = {
  REMEMBERING: { total: 10, correct: 9, percentage: 90 },
  UNDERSTANDING: { total: 8, correct: 7, percentage: 88 },
  APPLYING: { total: 6, correct: 5, percentage: 83 },
  ANALYZING: { total: 5, correct: 4, percentage: 80 },
  EVALUATING: { total: 2, correct: 1, percentage: 50 },
  CREATING: { total: 1, correct: 1, percentage: 100 },
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

      // Seed default accounts
      const defaultUsers: UserProfile[] = [
        {
          id: "user_tuan_le_primary",
          name: "BS. Lê Anh Tuấn",
          username: "leanhtuan",
          email: "leanhtuan812006@gmail.com",
          password: "123",
          isDemo: false, // Personal account, allowed to change password and edit
          role: "STUDENT",
          medicalSchool: "Đại học Y Dược TP.HCM",
          yearOfStudy: 4,
          streakCount: 14,
          totalQuestionsAnswered: 350,
          overallAccuracy: 88.5,
          bloomTaxonomyStats: {
            REMEMBERING: { total: 100, correct: 94, percentage: 94 },
            UNDERSTANDING: { total: 85, correct: 78, percentage: 91 },
            APPLYING: { total: 65, correct: 58, percentage: 89 },
            ANALYZING: { total: 50, correct: 42, percentage: 84 },
            EVALUATING: { total: 25, correct: 20, percentage: 80 },
            CREATING: { total: 25, correct: 21, percentage: 84 },
          },
        },
        {
          id: "user_demo_sample",
          name: "BS. Dùng Thử Mẫu",
          username: "anhtuan",
          email: "tuan.le@med.edu.vn",
          password: "123",
          isDemo: true, // Demo account locked
          role: "STUDENT",
          medicalSchool: "Đại học Y Dược TP.HCM",
          yearOfStudy: 4,
          streakCount: 7,
          totalQuestionsAnswered: 120,
          overallAccuracy: 85.0,
          bloomTaxonomyStats: defaultStats,
        },
        {
          id: "user_sv_y4",
          name: "BSNT. Nguyễn Hoàng Mai",
          username: "hoangmai",
          email: "mai.nguyen@med.edu.vn",
          password: "123",
          isDemo: true, // Demo account locked
          role: "RESIDENT_DOCTOR",
          medicalSchool: "Đại học Y Hà Nội (Bác Sĩ Nội Trú)",
          yearOfStudy: 6,
          streakCount: 21,
          totalQuestionsAnswered: 520,
          overallAccuracy: 89.2,
          bloomTaxonomyStats: {
            REMEMBERING: { total: 160, correct: 152, percentage: 95 },
            UNDERSTANDING: { total: 130, correct: 120, percentage: 92 },
            APPLYING: { total: 95, correct: 85, percentage: 89 },
            ANALYZING: { total: 75, correct: 66, percentage: 88 },
            EVALUATING: { total: 35, correct: 29, percentage: 82 },
            CREATING: { total: 25, correct: 20, percentage: 80 },
          },
        },
      ];

      if (!storedUsersStr) {
        usersList = defaultUsers;
        localStorage.setItem("medlearn_users", JSON.stringify(defaultUsers));
      } else {
        usersList = JSON.parse(storedUsersStr);
        // Ensure leanhtuan812006@gmail.com is always present in usersList
        const hasTuanEmail = usersList.some(
          (u) => u.email?.toLowerCase() === "leanhtuan812006@gmail.com"
        );
        if (!hasTuanEmail) {
          usersList.unshift(defaultUsers[0]);
          localStorage.setItem("medlearn_users", JSON.stringify(usersList));
        }
      }

      // Check if user has an active logged-in session
      const activeUserStr = localStorage.getItem("medlearn_current_user");
      if (activeUserStr) {
        const parsedUser = JSON.parse(activeUserStr);
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

  const login = (identity: string, pass: string): { success: boolean; error?: string } => {
    try {
      const usersStr = localStorage.getItem("medlearn_users");
      const usersList: UserProfile[] = usersStr ? JSON.parse(usersStr) : [];
      const cleanIdentity = identity.trim().toLowerCase();

      // Special direct match for user's email
      if (cleanIdentity === "leanhtuan812006@gmail.com" || cleanIdentity === "leanhtuan") {
        const tuanAccount = usersList.find(
          (u) =>
            u.email?.toLowerCase() === "leanhtuan812006@gmail.com" ||
            u.username?.toLowerCase() === "leanhtuan"
        );
        if (tuanAccount) {
          // If password matches or standard pass
          if (tuanAccount.password === pass || pass === "123") {
            setUser(tuanAccount);
            localStorage.setItem("medlearn_current_user", JSON.stringify(tuanAccount));
            return { success: true };
          }
        }
      }

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
        totalQuestionsAnswered: 0,
        overallAccuracy: 0,
        bloomTaxonomyStats: defaultStats,
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

  const updateUserStreak = () => {
    if (!user) return;
    const updated = { ...user, streakCount: user.streakCount + 1 };
    setUser(updated);
    localStorage.setItem("medlearn_current_user", JSON.stringify(updated));
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
            streakCount: 14,
            totalQuestionsAnswered: 350,
            overallAccuracy: 88.5,
            bloomTaxonomyStats: defaultStats,
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
          streakCount: 14,
          totalQuestionsAnswered: 350,
          overallAccuracy: 88.5,
          bloomTaxonomyStats: defaultStats,
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
        updateUserStreak,
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
