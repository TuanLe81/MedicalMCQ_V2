import { NextResponse } from "next/server";
import { getGistData } from "@/lib/cloud-sync";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const identity = body.identity?.trim().toLowerCase();
    const pass = body.password?.trim();

    if (!identity || !pass) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập đầy đủ tên đăng nhập/email và mật khẩu!" },
        { status: 400 }
      );
    }

    // 1. Query live Cloud Database (raw_url truncation-proof)
    const { users } = await getGistData();

    // 2. Locate account by email or username
    const foundUser = users.find((u: any) => {
      const emailMatch = u.email?.trim().toLowerCase() === identity;
      const usernameMatch = u.username?.trim().toLowerCase() === identity;
      return emailMatch || usernameMatch;
    });

    if (!foundUser) {
      return NextResponse.json({
        success: false,
        error: "Tài khoản không tồn tại trên hệ thống! Vui lòng kiểm tra lại email/tên đăng nhập hoặc tạo tài khoản mới.",
      });
    }

    // 3. Verify password (support user password or demo password '123' if demo account)
    const passMatch =
      foundUser.password?.trim() === pass ||
      (foundUser.isDemo && pass === "123");

    if (!passMatch) {
      return NextResponse.json({
        success: false,
        error: "Mật khẩu không chính xác! Vui lòng thử lại hoặc sử dụng tính năng Quên Mật Khẩu.",
      });
    }

    return NextResponse.json({
      success: true,
      user: foundUser,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Lỗi xác thực máy chủ: " + (err.message || "Không rõ nguyên nhân") },
      { status: 500 }
    );
  }
}
