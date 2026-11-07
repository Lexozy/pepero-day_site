import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicSupabaseEnv } from "@/lib/env";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Нэвтэрсэн хэрэглэгчийн (admin) нэрийн өмнөөс ажиллах server client.
 * RLS бүрэн үйлчилнэ — анон key ашигладаг.
 */
export async function createServerSupabase() {
  const env = publicSupabaseEnv();
  if (!env) return null;
  const cookieStore = await cookies();
  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list: CookieToSet[]) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component дотроос cookie бичих боломжгүй — middleware сэргээнэ.
        }
      },
    },
  });
}

/** Нэвтэрсэн бөгөөд admins table-д байгаа хэрэглэгчийг буцаана, үгүй бол null. */
export async function getAdminUser() {
  const supabase = await createServerSupabase();
  if (!supabase) return { supabase: null, user: null, isAdmin: false } as const;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false } as const;
  const { data } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return { supabase, user, isAdmin: Boolean(data) } as const;
}