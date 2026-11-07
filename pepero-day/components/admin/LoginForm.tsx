"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createBrowserSupabase();
    if (!supabase) {
      setError("Supabase тохиргоо дутуу байна.");
      setBusy(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("И-мэйл эсвэл нууц үг буруу байна.");
      setBusy(false);
      return;
    }
    const next = params.get("next");
    router.replace(next && next.startsWith("/admin") ? next : "/admin");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm text-navy/80">
        И-мэйл
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field py-3"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-navy/80">
        Нууц үг
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field py-3"
        />
      </label>
      {error && (
        <p role="alert" className="rounded-2xl border border-blush bg-blush/25 px-4 py-3 text-sm text-navy">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className="btn-primary mt-2 w-full">
        {busy ? "Нэвтэрч байна..." : "Нэвтрэх"}
      </button>
    </form>
  );
}
