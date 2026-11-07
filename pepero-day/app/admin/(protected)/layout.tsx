import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/server";
import { signOut } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Pepero Day" };

/** Server-side хамгаалалт: нэвтрээгүй → login; нэвтэрсэн ч admin биш → хориглоно. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = await getAdminUser();
  if (!user) redirect("/admin/login");

  if (!isAdmin) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-4">
        <div className="glass-card max-w-md px-8 py-10 text-center">
          <h1 className="font-serif text-2xl text-navy">Хандах эрхгүй</h1>
          <p className="mt-3 text-sm text-navy/70">
            <span className="font-medium">{user.email}</span> хаяг admin жагсаалтад байхгүй байна. Supabase SQL Editor дээр{" "}
            <code className="rounded bg-white px-1">admins</code> table-д нэмнэ үү.
          </p>
          <form action={signOut} className="mt-6">
            <button type="submit" className="btn-ghost">
              Гарах
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-navy/10 bg-baby/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/admin" className="flex items-baseline gap-2">
            <span className="font-serif text-lg text-navy">Pepero Day</span>
            <span className="text-xs uppercase tracking-[0.25em] text-navy/50">Admin</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-navy/60 sm:inline">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="rounded-full border border-navy/20 px-4 py-1.5 text-navy hover:bg-white">
                Гарах
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
