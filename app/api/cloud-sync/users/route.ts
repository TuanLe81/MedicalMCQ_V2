import { NextResponse } from "next/server";
import { getGistData, updateGistFiles } from "@/lib/cloud-sync";

export const dynamic = "force-dynamic";

// GET all registered users from Cloud Gist
export async function GET() {
  try {
    const { users } = await getGistData();
    return NextResponse.json({
      success: true,
      users,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch cloud users" },
      { status: 500 }
    );
  }
}

// POST: Save or merge user(s) into Cloud Gist
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const incomingUsers = Array.isArray(body.users)
      ? body.users
      : body.user
      ? [body.user]
      : [];

    if (incomingUsers.length === 0) {
      return NextResponse.json(
        { success: false, error: "No users provided" },
        { status: 400 }
      );
    }

    const { users: existingUsers } = await getGistData();
    const mergedMap = new Map<string, any>();

    // 1. Put existing users into map (keyed by ID or lowercase email/username)
    existingUsers.forEach((u) => {
      const key = u.id || u.email?.toLowerCase() || u.username?.toLowerCase();
      if (key) mergedMap.set(key, u);
    });

    // 2. Merge or add incoming users
    incomingUsers.forEach((incoming) => {
      const key =
        incoming.id ||
        incoming.email?.toLowerCase() ||
        incoming.username?.toLowerCase();

      // Check if user already exists by email or username
      let matchedKey: string | null = null;
      for (const [k, existing] of mergedMap.entries()) {
        const emailMatch =
          incoming.email &&
          existing.email &&
          incoming.email.toLowerCase().trim() ===
            existing.email.toLowerCase().trim();
        const usernameMatch =
          incoming.username &&
          existing.username &&
          incoming.username.toLowerCase().trim() ===
            existing.username.toLowerCase().trim();
        const idMatch = incoming.id && existing.id && incoming.id === existing.id;

        if (emailMatch || usernameMatch || idMatch) {
          matchedKey = k;
          break;
        }
      }

      if (matchedKey) {
        // Update existing user
        const current = mergedMap.get(matchedKey);
        mergedMap.set(matchedKey, {
          ...current,
          ...incoming,
          // Preserve streak, answers and stats if higher
          totalQuestionsAnswered: Math.max(
            current.totalQuestionsAnswered || 0,
            incoming.totalQuestionsAnswered || 0
          ),
          totalCorrectAnswers: Math.max(
            current.totalCorrectAnswers || 0,
            incoming.totalCorrectAnswers || 0
          ),
          streakCount: Math.max(
            current.streakCount || 1,
            incoming.streakCount || 1
          ),
        });
      } else {
        // Insert new user
        mergedMap.set(key, incoming);
      }
    });

    const finalUsers = Array.from(mergedMap.values());
    const ok = await updateGistFiles({ users: finalUsers });

    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Failed to persist users to cloud storage" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      users: finalUsers,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update users" },
      { status: 500 }
    );
  }
}

