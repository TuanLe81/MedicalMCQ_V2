import { NextResponse } from "next/server";
import { getGistData, updateGistFiles } from "@/lib/cloud-sync";

export const dynamic = "force-dynamic";

// Known user ID aliases mapped to their primary canonical accounts
const USER_ALIASES: Record<string, string[]> = {
  // Account BS. Lê Anh Tuấn (leanhtuan812006@gmail.com / leanhtuan)
  "leanhtuan812006@gmail.com": [
    "user_tuan_le_primary",
    "user_1787990889812",
    "user_1788359970116",
    "user_1788455279250",
  ],
  "user_tuan_le_primary": [
    "user_tuan_le_primary",
    "user_1787990889812",
    "user_1788359970116",
    "user_1788455279250",
  ],
};

function mergeDeckLists(existingDecks: any[] = [], incomingDecks: any[] = []): any[] {
  const map = new Map<string, any>();
  for (const d of existingDecks) {
    if (d && d.id) map.set(d.id, d);
  }
  for (const d of incomingDecks) {
    if (!d || !d.id) continue;
    if (map.has(d.id)) {
      const existing = map.get(d.id);
      const existingCount = (existing.questions?.length || 0) + (existing.flashcards?.length || 0);
      const incomingCount = (d.questions?.length || 0) + (d.flashcards?.length || 0);
      if (incomingCount >= existingCount) {
        map.set(d.id, { ...existing, ...d });
      } else {
        map.set(d.id, { ...d, ...existing });
      }
    } else {
      map.set(d.id, d);
    }
  }
  return Array.from(map.values());
}

function mergeFolderLists(existingFolders: any[] = [], incomingFolders: any[] = []): any[] {
  const map = new Map<string, any>();
  for (const f of existingFolders) {
    if (f && f.id) map.set(f.id, f);
  }
  for (const f of incomingFolders) {
    if (!f || !f.id) continue;
    if (map.has(f.id)) {
      const existing = map.get(f.id);
      const mergedDecks = mergeDeckLists(existing.decks || [], f.decks || []);
      const mergedChildren = mergeFolderLists(existing.children || [], f.children || []);
      map.set(f.id, {
        ...existing,
        ...f,
        decks: mergedDecks,
        children: mergedChildren,
      });
    } else {
      map.set(f.id, f);
    }
  }
  return Array.from(map.values());
}

// GET user-specific folders & custom decks with non-destructive Deep Merge & Alias Consolidation
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email")?.toLowerCase().trim();

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, error: "userId or email parameter is required" },
        { status: 400 }
      );
    }

    const { folders, decks } = await getGistData();

    // Determine all candidate IDs for this user
    const candidateIds = new Set<string>();
    if (userId) candidateIds.add(userId);
    if (email && USER_ALIASES[email]) {
      USER_ALIASES[email].forEach((id) => candidateIds.add(id));
    }
    if (userId && USER_ALIASES[userId]) {
      USER_ALIASES[userId].forEach((id) => candidateIds.add(id));
    }

    let consolidatedFolders: any[] = [];
    let consolidatedDecks: any[] = [];

    // Deep merge from all candidate IDs
    for (const cid of candidateIds) {
      if (folders[cid] && Array.isArray(folders[cid])) {
        consolidatedFolders = mergeFolderLists(consolidatedFolders, folders[cid]);
      }
      if (decks[cid] && Array.isArray(decks[cid])) {
        consolidatedDecks = mergeDeckLists(consolidatedDecks, decks[cid]);
      }
    }

    // Also extract any decks embedded inside folders into consolidatedDecks
    const extractDecksFromFolders = (nodes: any[]): any[] => {
      let res: any[] = [];
      for (const n of nodes) {
        if (n.decks && Array.isArray(n.decks)) res.push(...n.decks);
        if (n.children && Array.isArray(n.children)) res.push(...extractDecksFromFolders(n.children));
      }
      return res;
    };
    const decksInsideFolders = extractDecksFromFolders(consolidatedFolders);
    consolidatedDecks = mergeDeckLists(consolidatedDecks, decksInsideFolders);

    // If consolidated data was found from aliases, write back under primary userId asynchronously
    if (userId && candidateIds.size > 1) {
      const needsUpdate =
        (!folders[userId] || folders[userId].length < consolidatedFolders.length) ||
        (!decks[userId] || decks[userId].length < consolidatedDecks.length);

      if (needsUpdate) {
        folders[userId] = consolidatedFolders;
        decks[userId] = consolidatedDecks;
        updateGistFiles({ folders, decks }).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      folders: consolidatedFolders,
      decks: consolidatedDecks,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

// POST: Save user folders and/or custom decks with Non-Destructive Deep Merge
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email, folders: incomingFolders, decks: incomingDecks, isFullReplace } = body;

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

    // Also gather any aliases
    const candidateIds = new Set<string>([userId]);
    const cleanEmail = email?.toLowerCase().trim();
    if (cleanEmail && USER_ALIASES[cleanEmail]) {
      USER_ALIASES[cleanEmail].forEach((id) => candidateIds.add(id));
    }
    if (USER_ALIASES[userId]) {
      USER_ALIASES[userId].forEach((id) => candidateIds.add(id));
    }

    if (incomingFolders !== undefined && Array.isArray(incomingFolders)) {
      if (isFullReplace) {
        folders[userId] = incomingFolders;
      } else {
        // Safe deep merge with existing folders across all aliases
        let baseFolders: any[] = folders[userId] || [];
        for (const cid of candidateIds) {
          if (cid !== userId && folders[cid]) {
            baseFolders = mergeFolderLists(baseFolders, folders[cid]);
          }
        }
        folders[userId] = mergeFolderLists(baseFolders, incomingFolders);
      }
      updates.folders = folders;
    }

    if (incomingDecks !== undefined && Array.isArray(incomingDecks)) {
      if (isFullReplace) {
        decks[userId] = incomingDecks;
      } else {
        // Safe deep merge with existing decks across all aliases
        let baseDecks: any[] = decks[userId] || [];
        for (const cid of candidateIds) {
          if (cid !== userId && decks[cid]) {
            baseDecks = mergeDeckLists(baseDecks, decks[cid]);
          }
        }
        decks[userId] = mergeDeckLists(baseDecks, incomingDecks);
      }
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
      message: "User data successfully synced to cloud with non-destructive merge",
      folders: folders[userId] || [],
      decks: decks[userId] || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to sync user data" },
      { status: 500 }
    );
  }
}
