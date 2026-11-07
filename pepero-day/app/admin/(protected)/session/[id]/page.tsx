import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/server";
import type { EventRow, SessionRow } from "@/lib/types";
import { fmtDateTime, shortId } from "@/lib/format";
import { Field, Pill } from "@/components/admin/ui";
import MarkSeen from "@/components/admin/MarkSeen";

export const dynamic = "force-dynamic";

const EVENT_LABEL: Record<EventRow["type"], string> = {
  visit: "Website нээсэн",
  q1_answered: "Асуулт 1-д хариулсан",
  q2_answered: "Кино үзэх саналыг зөвшөөрсөн",
  no_button_dodge: "«Үгүй» товч зугтсан (analytics)",
  gift_opened: "Gift нээсэн",
  message_submitted: "Санал, хүсэлт илгээсэн",
  session_completed: "Session дууссан",
};

function describe(e: EventRow): string | null {
  const p = e.payload as Record<string, unknown>;
  switch (e.type) {
    case "visit":
      return typeof p.visit_number === "number" ? `${p.visit_number}-р оролт` : null;
    case "q1_answered":
      return p.answer === "yes" ? "Тийм" : p.answer === "no" ? "Үгүй" : null;
    case "no_button_dodge":
      return typeof p.count === "number" ? `${p.count} удаа` : null;
    case "message_submitted":
      return typeof p.length === "number" ? `${p.length} тэмдэгт` : null;
    case "session_completed":
      return p.reason === "declined_q1" ? "Асуулт 1-д Үгүй гэсэн" : p.reason === "message_submitted" ? "Хариулт илгээсэн" : null;
    default:
      return null;
  }
}

export default async function SessionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await getAdminUser();
  if (!supabase) return null;

  const [{ data: session }, { data: events }] = await Promise.all([
    supabase.from("sessions").select("*").eq("id", id).maybeSingle(),
    supabase.from("events").select("*").eq("session_id", id).order("created_at", { ascending: true }),
  ]);
  if (!session) notFound();

  const s = session as SessionRow;
  const list = (events ?? []) as EventRow[];
  const needsSeen = !s.admin_seen_at || new Date(s.admin_seen_at) < new Date(s.updated_at);

  return (
    <div className="flex flex-col gap-6">
      <MarkSeen sessionId={s.id} needed={needsSeen} />
      <div>
        <Link href="/admin" className="text-sm text-navy/60 hover:underline">
          ← Самбар
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-2xl text-navy sm:text-3xl">Session #{shortId(s.id)}</h1>
          {s.completed ? <Pill tone="yes">Дууссан</Pill> : <Pill tone="muted">Явагдаж байна</Pill>}
          {needsSeen && <Pill tone="new">Шинэ</Pill>}
        </div>
        <p className="mt-1 break-all font-mono text-xs text-navy/40">{s.id}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="glass-card px-6 py-5 lg:col-span-3">
          <h2 className="font-serif text-lg text-navy">Хариултууд</h2>
          <dl className="mt-3">
            <Field label="Website нээсэн">{fmtDateTime(s.created_at)}</Field>
            <Field label="Нийт visit">{s.visit_count}</Field>
            <Field label="Асуулт 1">
              {s.q1_answer === "yes" ? <Pill tone="yes">Тийм</Pill> : s.q1_answer === "no" ? <Pill tone="no">Үгүй</Pill> : <Pill tone="wait">Хариулаагүй</Pill>}
              {s.q1_answered_at && <span className="ml-2 text-navy/50">{fmtDateTime(s.q1_answered_at)}</span>}
            </Field>
            <Field label="Кино үзэх санал">
              {s.q2_answer === "yes" ? <Pill tone="yes">Тэгье</Pill> : <Pill tone="wait">Хариулаагүй</Pill>}
              {s.q2_answered_at && <span className="ml-2 text-navy/50">{fmtDateTime(s.q2_answered_at)}</span>}
            </Field>
            <Field label="«Үгүй» зугтсан тоо">{s.no_button_dodges} (analytics, хариулт биш)</Field>
            <Field label="Gift нээсэн">
              {s.gift_opened ? <Pill tone="yes">Нээсэн</Pill> : <Pill tone="wait">Нээгээгүй</Pill>}
              {s.gift_opened_at && <span className="ml-2 text-navy/50">{fmtDateTime(s.gift_opened_at)}</span>}
            </Field>
            <Field label="Хариулт илгээсэн цаг">{fmtDateTime(s.message_submitted_at)}</Field>
            <Field label="Session дууссан">{s.completed ? fmtDateTime(s.completed_at) : "Үгүй"}</Field>
            <Field label="Сүүлд идэвхтэй">{fmtDateTime(s.last_seen_at)}</Field>
            <Field label="Төхөөрөмж">
              <span className="break-all text-xs text-navy/60">{s.user_agent ?? "—"}</span>
            </Field>
          </dl>
          {s.message && (
            <div className="mt-5 rounded-2xl bg-baby/60 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-navy/50">Санал, хүсэлт</p>
              <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-navy">{s.message}</p>
            </div>
          )}
        </section>

        <section className="glass-card px-6 py-5 lg:col-span-2">
          <h2 className="font-serif text-lg text-navy">Timeline</h2>
          <ol className="mt-4 flex flex-col">
            {list.map((e, i) => (
              <li key={e.id} className="relative flex gap-4 pb-5 last:pb-0">
                {i < list.length - 1 && <span className="absolute left-[7px] top-4 h-full w-px bg-navy/10" aria-hidden />}
                <span
                  className={`mt-1 h-[15px] w-[15px] shrink-0 rounded-full ring-4 ring-white ${
                    e.is_analytics ? "bg-powder" : e.type === "session_completed" ? "bg-navy" : "bg-navy/70"
                  }`}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className={`text-sm ${e.is_analytics ? "text-navy/60" : "font-medium text-navy"}`}>{EVENT_LABEL[e.type] ?? e.type}</p>
                  {describe(e) && <p className="text-xs text-navy/60">{describe(e)}</p>}
                  <p className="text-xs text-navy/40">{fmtDateTime(e.created_at)}</p>
                </div>
              </li>
            ))}
            {list.length === 0 && <li className="text-sm text-navy/50">Event бүртгэгдээгүй.</li>}
          </ol>
        </section>
      </div>
    </div>
  );
}
