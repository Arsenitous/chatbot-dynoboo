import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth", "/api/setup", "/_next", "/favicon.ico", "/Logo_DynoBoo.png"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Izinkan path publik & static assets
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Cek session cookie — cukup cek keberadaan dan nilai tidak kosong
  const session = request.cookies.get("dynoboo_session")?.value;
  if (!session || session.length < 8) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|Logo_DynoBoo.png).*)"],
};
