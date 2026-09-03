import { NextResponse } from "next/server";
import { getGistData, updateGistFiles } from "@/lib/cloud-sync";

export const dynamic = "force-dynamic";

// GET user-specific folders & custom decks
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId parameter is required" },
        { status: 400 }
      );
    }

    const { folders, decks } = await getGistData();

    return NextResponse.json({
      success: true,
      folders: folders[userId] || [],
      decks: decks[userId] || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

// POST: Save user folders and/or custom decks
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, folders: newFolders, decks: newDecks } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const { folders, decks } = await getGistData();
    const updates: {
      folders?: Record<string, any[]>;
      decks?: Record<string, any[]>;
    } = {};

    if (newFolders !== undefined) {
      folders[userId] = newFolders;
      updates.folders = folders;
    }

    if (newDecks !== undefined) {
      decks[userId] = newDecks;
      updates.decks = decks;
    }

    const ok = await updateGistFiles(updates);

    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Failed to persist user data to cloud" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User data successfully synced to cloud",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to sync user data" },
      { status: 500 }
    );
  }
}

