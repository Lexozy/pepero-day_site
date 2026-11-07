import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export class ConfigError extends Error {
  constructor() {
    super("Supabase environment variables are missing");
    this.name = "ConfigError";
  }
}

let cached: SupabaseClient | null = null;

/**
 * Service-role client. ЗӨВХӨН server талд (route handlers, server actions).
 * RLS-ийг тойрдог тул browser-т хэзээ ч өгөхгүй.
 */
export function createAdminClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || url.includes("YOUR-PROJECT-REF") || key.startsWith("your-")) {
    throw new ConfigError();
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
