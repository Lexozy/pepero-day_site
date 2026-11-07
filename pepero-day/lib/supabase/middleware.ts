import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicSupabaseEnv } from "@/lib/env";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/** Admin route-уудад auth cookie-г сэргээж, нэвтрээгүй бол login руу чиглүүлнэ. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = publicSupabaseEnv();
  const path = request.nextUrl.pathname;
  const isLogin = path === "/admin/login";

  if (!env) {
    // Тохиргоо дутуу: login хуудас өөрөө мессеж харуулна.
    return isLogin ? response : NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list: CookieToSet[]) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  if (user && isLogin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return response;
}