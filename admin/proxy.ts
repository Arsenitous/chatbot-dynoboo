import { NextRequest, NextResponse } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET!;
const PUBLIC_PATHS = ["/login", "/api/auth", "/api/setup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Izinkan path publik
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Cek session cookie
  const session = request.cookies.get("dynoboo_session")?.value;
  if (session !== ADMIN_SECRET) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|Logo_DynoBoo.png).*)"],
};
