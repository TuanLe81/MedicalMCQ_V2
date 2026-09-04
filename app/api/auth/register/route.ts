import { NextResponse } from "next/server";
import { getGistData, updateGistFiles } from "@/lib/cloud-sync";

export const dynamic = "force-dynamic";

const initialCleanBloomStats = {
  REMEMBERING: { total: 0, correct: 0, percentage: 0 },
  UNDERSTANDING: { total: 0, correct: 0, percentage: 0 },
  APPLYING: { total: 0, correct: 0, percentage: 0 },
  ANALYZING: { total: 0, correct: 0, percentage: 0 },
  EVALUATING: { total: 0, correct: 0, percentage: 0 },
  CREATING: { total: 0, correct: 0, percentage: 0 },
};

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const cleanEmail = data.email?.trim().toLowerCase();
    const cleanUsername = data.username?.trim().toLowerCase();
    const cleanPass = data.password?.trim();

    if (!cleanEmail || !cleanUsername || !cleanPass) {
      return NextResponse.json(
        { success: false, error: "Vui lòng điền đầy đủ tất cả các trường thông tin!" },
        { status: 400 }
      );
    }

    // 1. Fetch fresh users from Cloud Gist
    const { users } = await getGistData();

    // 2. Check if email or username already taken
    const existed = users.some(
      (u: any) =>
        u.email?.trim().toLowerCase() === cleanEmail ||
        u.username?.trim().toLowerCase() === cleanUsername
    );

    if (existed) {
      return NextResponse.json({
        success: false,
        error: "Email hoặc Tên đăng nhập này đã tồn tại trên hệ thống!",
      });
    }

    // 3. Create full new UserProfile
    const newUserId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newUser = {
      id: newUserId,
      name: data.name?.trim() || data.username?.trim(),
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

    // 4. Save to Cloud Gist Database
    const updatedUsers = [newUser, ...users];
    const ok = await updateGistFiles({ users: updatedUsers });

    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Không thể lưu tài khoản lên Cloud. Vui lòng thử lại!" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: newUser,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Lỗi đăng ký: " + (err.message || "Không xác định") },
      { status: 500 }
    );
  }
}
