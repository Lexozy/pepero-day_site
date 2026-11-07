export type Q1Answer = "yes" | "no";

export type EventType =
  | "visit"
  | "q1_answered"
  | "q2_answered"
  | "no_button_dodge"
  | "gift_opened"
  | "message_submitted"
  | "session_completed";

export interface SessionRow {
  id: string;
  created_at: string;
  updated_at: string;
  last_seen_at: string;
  visit_count: number;
  user_agent: string | null;
  q1_answer: Q1Answer | null;
  q1_answered_at: string | null;
  q2_answer: "yes" | null;
  q2_answered_at: string | null;
  no_button_dodges: number;
  gift_opened: boolean;
  gift_opened_at: string | null;
  message: string | null;
  message_submitted_at: string | null;
  completed: boolean;
  completed_at: string | null;
  admin_seen_at: string | null;
}

export interface EventRow {
  id: number;
  session_id: string;
  type: EventType;
  is_analytics: boolean;
  payload: Record<string, unknown>;
  created_at: string;
}

/** Хүлээн авагчийн browser-т буцаах session (admin талбаруудгүй). */
export type PublicSession = Omit<SessionRow, "admin_seen_at" | "user_agent">;

export type Stage = "q1" | "declined" | "q2" | "gift" | "final" | "thanks";

export function stageOf(s: PublicSession): Stage {
  if (s.q1_answer === "no") return "declined";
  if (s.q1_answer !== "yes") return "q1";
  if (s.q2_answer !== "yes") return "q2";
  if (!s.gift_opened) return "gift";
  if (!s.message) return "final";
  return "thanks";
}

export type ClientEvent =
  | { type: "q1_answered"; answer: Q1Answer }
  | { type: "q2_answered" }
  | { type: "no_button_dodge"; count: number }
  | { type: "gift_opened" }
  | { type: "message_submitted"; message: string };

export interface ApiOk<T> {
  ok: true;
  data: T;
}
export interface ApiErr {
  ok: false;
  code: "config" | "bad_request" | "not_found" | "conflict" | "server";
  message: string;
}
export type ApiResponse<T> = ApiOk<T> | ApiErr;
