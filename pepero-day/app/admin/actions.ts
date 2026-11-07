"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabase, getAdminUser } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createServerSupabase();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}

/** Session-ийг "харсан" гэж тэмдэглэнэ — "Шинэ" badge арилна. RLS: зөвхөн admin update хийж чадна. */
export async function markSeen(sessionId: string) {
  const { supabase, isAdmin } = await getAdminUser();
  if (!supabase || !isAdmin) return;
  await supabase.from("sessions").update({ admin_seen_at: new Date().toISOString() }).eq("id", sessionId);
  revalidatePath("/admin");
  revalidatePath(`/admin/session/${sessionId}`);
}
