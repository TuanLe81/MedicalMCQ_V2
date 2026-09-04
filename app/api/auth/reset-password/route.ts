import { NextResponse } from "next/server";
import { getGistData, updateGistFiles } from "@/lib/cloud-sync";

export const dynamic = "force-dynamic";

// GET: Check if account exists
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const identity = searchParams.get("identity")?.trim().toLowerCase();

    if (!identity) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin tài khoản cần tìm!" },
        { status: 400 }
      );
    }

    const { users } = await getGistData();
    const found = users.find(
      (u: any) =>
        u.email?.trim().toLowerCase() === identity ||
        u.username?.trim().toLowerCase() === identity
    );

    if (!found) {
      return NextResponse.json({
        success: false,
        error: "Không tìm thấy tài khoản nào khớp với Email hoặc Tên đăng nhập này!",
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: found.id,
        name: found.name,
        email: found.email,
        username: found.username,
        medicalSchool: found.medicalSchool,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Lỗi tìm kiếm tài khoản: " + err.message },
      { status: 500 }
    );
  }
}

// POST: Update password in Cloud Database
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const identity = body.identity?.trim().toLowerCase();
    const newPass = body.newPassword?.trim();

    if (!identity || !newPass) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập đầy đủ thông tin mật khẩu mới!" },
        { status: 400 }
      );
    }

    const { users } = await getGistData();
    const targetIdx = users.findIndex(
      (u: any) =>
        u.email?.trim().toLowerCase() === identity ||
        u.username?.trim().toLowerCase() === identity
    );

    if (targetIdx === -1) {
      return NextResponse.json({
        success: false,
        error: "Không tìm thấy tài khoản để đặt lại mật khẩu!",
      });
    }

    // Update password
    users[targetIdx].password = newPass;

    const ok = await updateGistFiles({ users });
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Không thể lưu mật khẩu mới lên đám mây, vui lòng thử lại!" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: users[targetIdx],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Lỗi đặt lại mật khẩu: " + err.message },
      { status: 500 }
    );
  }
}
