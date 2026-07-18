import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "session_id";

function redirectTo(request: NextRequest, pathname: string) {
  return NextResponse.redirect(new URL(pathname, request.url));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const isCustomerAuthPage =
    pathname === "/customer/login" ||
    pathname === "/customer/register" ||
    pathname === "/customer/verify-email";

  if (
    !isCustomerAuthPage &&
    ["/customer", "/customer/lacak-resi", "/customer/buat-pesanan", "/customer/profile"].some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    ) &&
    !hasSession
  ) {
    return redirectTo(request, "/customer/login");
  }

  if (
    /^\/staff\/(admin|cashier|courier|manager|owner)(\/|$)/.test(pathname) &&
    !hasSession
  ) {
    return redirectTo(request, "/staff/login");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/customer/:path*", "/staff/:path*"],
};
