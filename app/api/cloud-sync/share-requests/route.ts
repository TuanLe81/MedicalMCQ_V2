import { NextResponse } from "next/server";
import { getGistData, updateGistFiles } from "@/lib/cloud-sync";

export const dynamic = "force-dynamic";

// GET: Fetch share requests relevant to a user (as recipient or owner)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetIdentity = searchParams.get("targetIdentity")?.toLowerCase().trim();
    const ownerId = searchParams.get("ownerId");

    const { shareRequests } = await getGistData();

    if (!targetIdentity && !ownerId) {
      return NextResponse.json({
        success: true,
        shareRequests,
      });
    }

    const filtered = shareRequests.filter((r) => {
      const recipientMatch =
        targetIdentity &&
        (r.recipientIdentity?.toLowerCase().trim() === targetIdentity ||
          r.targetUsernameOrEmail?.toLowerCase().trim() === targetIdentity);
      const ownerMatch = ownerId && r.ownerId === ownerId;
      return recipientMatch || ownerMatch;
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

