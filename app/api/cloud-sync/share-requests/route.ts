import { NextResponse } from "next/server";
import { getGistData, updateGistFiles } from "@/lib/cloud-sync";

export const dynamic = "force-dynamic";

// GET: Fetch share requests relevant to a user (as recipient only - for inbox)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetIdentity = searchParams.get("targetIdentity")?.toLowerCase().trim();
    const targetEmail = searchParams.get("targetEmail")?.toLowerCase().trim();
    const targetUsername = searchParams.get("targetUsername")?.toLowerCase().trim();
    const targetId = searchParams.get("targetId");

    const { shareRequests } = await getGistData();

    if (!targetIdentity && !targetEmail && !targetId && !targetUsername) {
      return NextResponse.json({
        success: true,
        shareRequests,
      });
    }

    const filtered = shareRequests.filter((r) => {
      // Match by recipientId first (most reliable)
      if (targetId && r.recipientId && r.recipientId === targetId) return true;
      // Match by email
      if (targetEmail && (
        r.recipientEmail?.toLowerCase().trim() === targetEmail ||
        r.recipientIdentity?.toLowerCase().trim() === targetEmail ||
        r.targetUsernameOrEmail?.toLowerCase().trim() === targetEmail
      )) return true;
      // Match by username
      if (targetUsername && (
        r.recipientUsername?.toLowerCase().trim() === targetUsername ||
        r.recipientIdentity?.toLowerCase().trim() === targetUsername ||
        r.targetUsernameOrEmail?.toLowerCase().trim() === targetUsername
      )) return true;
      // Fallback: match by general identity string
      if (targetIdentity && (
        r.recipientIdentity?.toLowerCase().trim() === targetIdentity ||
        r.recipientEmail?.toLowerCase().trim() === targetIdentity ||
        r.recipientUsername?.toLowerCase().trim() === targetIdentity ||
        r.targetUsernameOrEmail?.toLowerCase().trim() === targetIdentity
      )) return true;
      return false;
    });

    return NextResponse.json({
      success: true,
      shareRequests: filtered,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch share requests" },
      { status: 500 }
    );
  }
}

// POST: Add new share request or update status of existing share request
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { shareRequest, updateRequest } = body;

    const { shareRequests } = await getGistData();
    let updatedList = [...shareRequests];

    if (shareRequest) {
      // Add or replace
      const existingIdx = updatedList.findIndex((r) => r.id === shareRequest.id);
      if (existingIdx !== -1) {
        updatedList[existingIdx] = shareRequest;
      } else {
        updatedList.unshift(shareRequest);
      }
    } else if (updateRequest) {
      // Update status (ACCEPTED / REJECTED)
      const { id, status } = updateRequest;
      updatedList = updatedList.map((r) => {
        if (r.id === id) {
          return { ...r, status };
        }
        return r;
      });
    }

    const ok = await updateGistFiles({ shareRequests: updatedList });

    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Failed to persist share request to cloud" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      shareRequests: updatedList,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update share requests" },
      { status: 500 }
    );
  }
}

