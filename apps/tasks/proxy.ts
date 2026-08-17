import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = ["/signin", "/api/auth", "/api/health"].some((p) =>
    nextUrl.pathname.startsWith(p)
  );

  if (isApiAuthRoute) return NextResponse.next();
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/signin", nextUrl));
  }
  if (isLoggedIn && nextUrl.pathname === "/signin") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|.*\\.svg$).*)"],
};
