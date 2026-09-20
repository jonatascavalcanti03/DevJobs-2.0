/**
 * Proxy Next.js 16 — Sincronização de Sessão e Proteção Base Supabase
 *
 * Este proxy (arquitetura oficial do Next.js 16) garante que a sessão do usuário
 * seja atualizada em cada requisição através do Supabase SSR, mantendo os cookies
 * sincronizados e fornecendo proteção básica de entrada para rotas autenticadas.
 *
 * NOTA: Regras complexas de negócio e RBAC (ownership, roles de empresa, etc.)
 * pertencem aos Server Components e Server Actions no backend, não a este proxy.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Em ambientes de desenvolvimento sem variáveis configuradas, permitir o tráfego
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Validação segura de sessão via Supabase Auth server (evita confiar em JWT forjado)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Proteção básica de rotas privadas (preparação de infraestrutura)
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/perfil") ||
    pathname.startsWith("/empresa") ||
    pathname.startsWith("/admin");

  if (isProtectedRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Executar em todas as rotas exceto recursos estáticos e internos do Next.js
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
