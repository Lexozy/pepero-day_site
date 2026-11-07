import { Suspense } from "react";
import LoginForm from "@/components/admin/LoginForm";
import { publicSupabaseEnv } from "@/lib/env";

export const metadata = { title: "Admin нэвтрэх — Pepero Day" };
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const configured = Boolean(publicSupabaseEnv());
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="glass-card w-full max-w-sm px-7 py-9">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-navy/50">Pepero Day</p>
        <h1 className="mt-2 font-serif text-2xl text-navy">Admin нэвтрэх</h1>
        {configured ? (
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        ) : (
          <p className="mt-6 rounded-2xl border border-blush bg-blush/25 px-4 py-3 text-sm text-navy">
            Supabase тохиргоо дутуу байна. <code className="rounded bg-white px-1">.env.local</code> файлд{" "}
            <code className="rounded bg-white px-1">NEXT_PUBLIC_SUPABASE_URL</code> болон{" "}
            <code className="rounded bg-white px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> оруулаад серверийг дахин асаана уу.
          </p>
        )}
      </div>
    </main>
  );
}
