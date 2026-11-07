import "server-only";
import { NextResponse } from "next/server";
import { createAdminClient, ConfigError } from "@/lib/supabase/admin";
import type { ApiErr, ClientEvent, EventType, PublicSession, SessionRow } from "@/lib/types";

export const SID_COOKIE = "pd_sid";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ApiError extends Error {
  constructor(
    public code: ApiErr["code"],
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

const PUBLIC_COLUMNS =
  "id, created_at, updated_at, last_seen_at, visit_count, q1_answer, q1_answered_at, q2_answer, q2_answered_at, no_button_dodges, gift_opened, gift_opened_at, message, message_submitted_at, completed, completed_at";

export function isValidSid(sid: unknown): sid is string {
  return typeof sid === "string" && UUID_RE.test(sid);
}

async function insertEvent(
  sessionId: string,
  type: EventType,
  payload: Record<string, unknown> = {},
  isAnalytics = false,
) {
  const db = createAdminClient();
  const { error } = await db
    .from("events")
    .insert({ session_id: sessionId, type, payload, is_analytics: isAnalytics });
  if (error) throw new ApiError("server", error.message, 500);
}

async function fetchSession(sid: string): Promise<PublicSession | null> {
  const db = createAdminClient();
  const { data, error } = await db.from("sessions").select(PUBLIC_COLUMNS).eq("id", sid).maybeSingle();
  if (error) throw new ApiError("server", error.message, 500);
  return (data as PublicSession | null) ?? null;
}

/**
 * Cookie-д байгаа session-ийг сэргээнэ (visit тоолно), байхгүй бол шинээр үүсгэнэ.
 * Ингэснээр refresh хийхэд давхар session үүсэхгүй, progress хадгалагдана.
 */
export async function getOrCreateSession(
  sid: string | undefined,
  userAgent: string | null,
): Promise<{ session: PublicSession; created: boolean }> {
  const db = createAdminClient();

  if (isValidSid(sid)) {
    const existing = await fetchSession(sid);
    if (existing) {
      const { data, error } = await db
        .from("sessions")
        .update({ visit_count: existing.visit_count + 1, last_seen_at: new Date().toISOString() })
        .eq("id", sid)
        .select(PUBLIC_COLUMNS)
        .single();
      if (error) throw new ApiError("server", error.message, 500);
      await insertEvent(sid, "visit", { visit_number: existing.visit_count + 1 });
      return { session: data as PublicSession, created: false };
    }
  }

  const { data, error } = await db
    .from("sessions")
    .insert({ user_agent: userAgent?.slice(0, 500) ?? null })
    .select(PUBLIC_COLUMNS)
    .single();
  if (error) throw new ApiError("server", error.message, 500);
  const session = data as PublicSession;
  await insertEvent(session.id, "visit", { visit_number: 1 });
  return { session, created: true };
}

/**
 * Үйлдлийг session төлөвт хэрэгжүүлж, event бүртгэнэ.
 * Төлөвийн шилжилт бүр нөхцөлт UPDATE (өмнөх төлөв null байх ёстой) → давхар бичилт үүсэхгүй.
 */
export async function applyEvent(sid: string, ev: ClientEvent): Promise<PublicSession> {
  const db = createAdminClient();
  const now = new Date().toISOString();
  const current = await fetchSession(sid);
  if (!current) throw new ApiError("not_found", "Session not found", 404);

  /** Нөхцөлт UPDATE: guard нөхцөл биелэхгүй бол 0 мөр өөрчлөгдөж null буцаана (race-safe). */
  const conditional = async (
    patch: Partial<SessionRow>,
    guard: { column: keyof SessionRow; isNull: true } | { column: keyof SessionRow; equals: boolean },
  ) => {
    let q = db.from("sessions").update({ ...patch, last_seen_at: now }).eq("id", sid);
    q = "isNull" in guard ? q.is(guard.column, null) : q.eq(guard.column, guard.equals);
    const { data, error } = await q.select(PUBLIC_COLUMNS).maybeSingle();
    if (error) throw new ApiError("server", error.message, 500);
    return (data as PublicSession | null) ?? null;
  };

  switch (ev.type) {
    case "q1_answered": {
      if (ev.answer !== "yes" && ev.answer !== "no") throw new ApiError("bad_request", "Invalid answer", 400);
      if (current.q1_answer) return current; // idempotent: аль хэдийн хариулсан
      const isNo = ev.answer === "no";
      const updated = await conditional(
        {
          q1_answer: ev.answer,
          q1_answered_at: now,
          ...(isNo ? { completed: true, completed_at: now } : {}),
        },
        { column: "q1_answer", isNull: true },
      );
      if (!updated) return (await fetchSession(sid))!;
      await insertEvent(sid, "q1_answered", { answer: ev.answer });
      if (isNo) await insertEvent(sid, "session_completed", { reason: "declined_q1" });
      return updated;
    }

    case "q2_answered": {
      if (current.q1_answer !== "yes") throw new ApiError("conflict", "Q1 not answered", 409);
      if (current.q2_answer) return current;
      const updated = await conditional({ q2_answer: "yes", q2_answered_at: now }, { column: "q2_answer", isNull: true });
      if (!updated) return (await fetchSession(sid))!;
      await insertEvent(sid, "q2_answered", { answer: "yes" });
      return updated;
    }

    case "no_button_dodge": {
      // Analytics л бүртгэнэ — бодит хариулт БИШ.
      const count = Math.min(Math.max(Math.trunc(Number(ev.count) || 0), 1), 50);
      const { data, error } = await db
        .from("sessions")
        .update({ no_button_dodges: current.no_button_dodges + count, last_seen_at: now })
        .eq("id", sid)
        .select(PUBLIC_COLUMNS)
        .single();
      if (error) throw new ApiError("server", error.message, 500);
      await insertEvent(sid, "no_button_dodge", { count }, true);
      return data as PublicSession;
    }

    case "gift_opened": {
      if (current.q2_answer !== "yes") throw new ApiError("conflict", "Q2 not answered", 409);
      if (current.gift_opened) return current;
      const updated = await conditional({ gift_opened: true, gift_opened_at: now }, { column: "gift_opened", equals: false });
      if (!updated) return (await fetchSession(sid))!;
      await insertEvent(sid, "gift_opened");
      return updated;
    }

    case "message_submitted": {
      const message = typeof ev.message === "string" ? ev.message.trim() : "";
      if (!message) throw new ApiError("bad_request", "Message is empty", 400);
      if (message.length > 2000) throw new ApiError("bad_request", "Message too long", 400);
      if (!current.gift_opened) throw new ApiError("conflict", "Gift not opened", 409);
      if (current.message) return current; // давхар илгээлт → өмнөх төлөвийг буцаана
      const updated = await conditional(
        { message, message_submitted_at: now, completed: true, completed_at: now },
        { column: "message", isNull: true },
      );
      if (!updated) return (await fetchSession(sid))!;
      await insertEvent(sid, "message_submitted", { length: message.length });
      await insertEvent(sid, "session_completed", { reason: "message_submitted" });
      return updated;
    }

    default:
      throw new ApiError("bad_request", "Unknown event type", 400);
  }
}

export function sidCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
}

export function errorResponse(e: unknown) {
  if (e instanceof ConfigError) {
    return NextResponse.json<ApiErr>(
      { ok: false, code: "config", message: "Supabase environment variables are not configured" },
      { status: 503 },
    );
  }
  if (e instanceof ApiError) {
    return NextResponse.json<ApiErr>({ ok: false, code: e.code, message: e.message }, { status: e.status });
  }
  console.error("[api] unexpected error", e);
  return NextResponse.json<ApiErr>({ ok: false, code: "server", message: "Unexpected server error" }, { status: 500 });
}
