"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, BloomLevel } from "@/types";
import { MOCK_USER } from "@/lib/mock-data";

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

  // Initialize from LocalStorage (Do NOT auto-login, require user to log in)
  useEffect(() => {
    try {
      const storedUsersStr = localStorage.getItem("medlearn_users");
      if (!storedUsersStr) {
        // Seed default user database
        const defaultUsers: UserProfile[] = [
          {
            ...MOCK_USER,
            username: "anhtuan",
            password: "123",
          },
          {
            id: "user_sv_y4",
            name: "BSNT. Nguyễn Hoàng Mai",
            username: "hoangmai",
            email: "mai.nguyen@med.edu.vn",
            password: "123",
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
        localStorage.setItem("medlearn_users", JSON.stringify(defaultUsers));
      }

      // Check if user has an active logged-in session
      const activeUserStr = localStorage.getItem("medlearn_current_user");
      if (activeUserStr) {
        setUser(JSON.parse(activeUserStr));
      } else {
        setUser(null); // No active session -> require login
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
      const usersList: UserProfile[] = usersStr ? JSON.parse(usersStr) : [MOCK_USER];

      const found = usersList.find(
        (u) =>
          (u.email?.toLowerCase() === identity.toLowerCase() ||
            u.username?.toLowerCase() === identity.toLowerCase()) &&
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
          u.email?.toLowerCase() === data.email.toLowerCase() ||
          u.username?.toLowerCase() === data.username.toLowerCase()
      );

      if (existed) {
        return {
          success: false,
          error: "Email hoặc Tên đăng nhập này đã được sử dụng!",
        };
      }

      const newUser: UserProfile = {
        id: `user_${Date.now()}`,
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
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
