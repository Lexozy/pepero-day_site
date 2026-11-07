import { NextResponse, type NextRequest } from "next/server";
import { ApiError, applyEvent, errorResponse, isValidSid, SID_COOKIE } from "@/lib/session-server";
import type { ApiOk, ClientEvent, PublicSession } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["q1_answered", "q2_answered", "no_button_dodge", "gift_opened", "message_submitted"]);

/** Үйлдэл бүрийг хийгдсэн даруйд хадгална. */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as (ClientEvent & { sid?: unknown }) | null;
    if (!body || typeof body !== "object" || !ALLOWED.has(String(body.type))) {
      throw new ApiError("bad_request", "Invalid event", 400);
    }
    const cookieSid = req.cookies.get(SID_COOKIE)?.value;
    const sid = isValidSid(cookieSid) ? cookieSid : isValidSid(body.sid) ? body.sid : null;
    if (!sid) throw new ApiError("not_found", "No session", 404);

    const session = await applyEvent(sid, body);
    return NextResponse.json<ApiOk<{ session: PublicSession }>>({ ok: true, data: { session } });
  } catch (e) {
    return errorResponse(e);
  }
}
