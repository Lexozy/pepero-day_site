"use client";
import { createBrowserClient } from "@supabase/ssr";
import { publicSupabaseEnv } from "@/lib/env";

export function createBrowserSupabase() {
  const env = publicSupabaseEnv();
  if (!env) return null;
  return createBrowserClient(env.url, env.anonKey);
}
