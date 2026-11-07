import { NextResponse, type NextRequest } from "next/server";
import { errorResponse, getOrCreateSession, isValidSid, SID_COOKIE, sidCookieOptions } from "@/lib/session-server";
import type { ApiOk, PublicSession } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Website нээгдэх бүрт дуудагдана: session сэргээх эсвэл үүсгэх. */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { sid?: unknown };
    const cookieSid = req.cookies.get(SID_COOKIE)?.value;
    const sid = isValidSid(cookieSid) ? cookieSid : isValidSid(body.sid) ? body.sid : undefined;

    const { session, created } = await getOrCreateSession(sid, req.headers.get("user-agent"));

    const res = NextResponse.json<ApiOk<{ session: PublicSession; created: boolean }>>({
      ok: true,
      data: { session, created },
    });
    res.cookies.set(SID_COOKIE, session.id, sidCookieOptions());
    return res;
  } catch (e) {
    return errorResponse(e);
  }
}
