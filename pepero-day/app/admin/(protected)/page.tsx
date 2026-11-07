import Link from "next/link";
import { getAdminUser } from "@/lib/supabase/server";
import type { SessionRow } from "@/lib/types";
import { fmtDateTime, fmtRelative, shortId } from "@/lib/format";
import { Pill, StatCard } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

function isNew(s: SessionRow) {
  return !s.admin_seen_at || new Date(s.admin_seen_at) < new Date(s.updated_at);
}

export default async function AdminDashboard() {
  const { supabase } = await getAdminUser();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(500);

  if (error) {
    return (
      <div className="glass-card px-6 py-6 text-sm text-navy">
        Мэдээлэл татахад алдаа гарлаа: <code>{error.message}</code>. <code>supabase/schema.sql</code> ажилласан эсэхийг шалгана уу.
      </div>
    );
  }

  const sessions = (data ?? []) as SessionRow[];
  const totalVisits = sessions.reduce((n, s) => n + s.visit_count, 0);
  const stats = {
    sessions: sessions.length,
    q1Yes: sessions.filter((s) => s.q1_answer === "yes").length,
    q1No: sessions.filter((s) => s.q1_answer === "no").length,
    q2Yes: sessions.filter((s) => s.q2_answer === "yes").length,
    gift: sessions.filter((s) => s.gift_opened).length,
    messages: sessions.filter((s) => s.message).length,
    completed: sessions.filter((s) => s.completed).length,
    unseen: sessions.filter(isNew).length,
  };

  const messages = sessions
    .filter((s) => s.message)
    .sort((a, b) => new Date(b.message_submitted_at!).getTime() - new Date(a.message_submitted_at!).getTime());

  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl text-navy sm:text-3xl">Хяналтын самбар</h1>
            <p className="mt-1 text-sm text-navy/60">Бүх цаг Улаанбаатарын цагаар.</p>
          </div>
          {stats.unseen > 0 && <Pill tone="new">{stats.unseen} шинэ</Pill>}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Нийт visit" value={totalVisits} hint="refresh, дахин оролт орно" />
          <StatCard label="Нийт session" value={stats.sessions} />
          <StatCard label="Асуулт 1 — Тийм" value={stats.q1Yes} hint={`Үгүй: ${stats.q1No}`} />
          <StatCard label="Кино — Тэгье" value={stats.q2Yes} />
          <StatCard label="Gift нээсэн" value={stats.gift} />
          <StatCard label="Санал бичсэн" value={stats.messages} />
          <StatCard label="Дууссан session" value={stats.completed} />
          <StatCard label="Үгүй товч зугтсан" value={sessions.reduce((n, s) => n + s.no_button_dodges, 0)} hint="analytics" />
        </div>
      </section>

      {messages.length > 0 && (
        <section>
          <h2 className="font-serif text-xl text-navy">Санал, хүсэлтүүд</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {messages.map((s) => (
              <li key={s.id} className="glass-card px-5 py-4">
                <div className="flex items-center justify-between gap-3 text-xs text-navy/50">
                  <span>{fmtDateTime(s.message_submitted_at)}</span>
                  <div className="flex items-center gap-2">
                    {isNew(s) && <Pill tone="new">Шинэ</Pill>}
                    <Link href={`/admin/session/${s.id}`} className="underline-offset-2 hover:underline">
                      #{shortId(s.id)}
                    </Link>
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-navy">{s.message}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="font-serif text-xl text-navy">Session-ууд</h2>
        {sessions.length === 0 ? (
          <p className="mt-4 text-sm text-navy/60">Одоогоор session алга. Website нээгдэх үед энд гарч ирнэ.</p>
        ) : (
          <div className="glass-card mt-4 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-navy/50">
                <tr className="border-b border-navy/10">
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Нээсэн</th>
                  <th className="px-4 py-3">Асуулт 1</th>
                  <th className="px-4 py-3">Кино</th>
                  <th className="px-4 py-3">Gift</th>
                  <th className="px-4 py-3">Санал</th>
                  <th className="px-4 py-3">Төлөв</th>
                  <th className="px-4 py-3">Сүүлд</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b border-navy/5 transition-colors last:border-0 hover:bg-baby/50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/session/${s.id}`} className="flex items-center gap-2 font-medium text-navy hover:underline">
                        #{shortId(s.id)}
                        {isNew(s) && <Pill tone="new">Шинэ</Pill>}
                      </Link>
                      <span className="text-xs text-navy/40">{s.visit_count} visit</span>
                    </td>
                    <td className="px-4 py-3 text-navy/80">{fmtDateTime(s.created_at)}</td>
                    <td className="px-4 py-3">
                      {s.q1_answer === "yes" ? <Pill tone="yes">Тийм</Pill> : s.q1_answer === "no" ? <Pill tone="no">Үгүй</Pill> : <Pill tone="wait">—</Pill>}
                    </td>
                    <td className="px-4 py-3">
                      {s.q2_answer === "yes" ? <Pill tone="yes">Тэгье</Pill> : <Pill tone="wait">—</Pill>}
                      {s.no_button_dodges > 0 && <span className="ml-2 text-xs text-navy/40">{s.no_button_dodges}× зугтсан</span>}
                    </td>
                    <td className="px-4 py-3">{s.gift_opened ? <Pill tone="yes">Нээсэн</Pill> : <Pill tone="wait">—</Pill>}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-navy/80">{s.message ?? <span className="text-navy/30">—</span>}</td>
                    <td className="px-4 py-3">
                      {s.completed ? <Pill tone="yes">Дууссан</Pill> : <Pill tone="muted">Явагдаж байна</Pill>}
                    </td>
                    <td className="px-4 py-3 text-navy/60">{fmtRelative(s.last_seen_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
