import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const encodedSecret = () =>
  new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");

async function getRole(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("rd_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedSecret());
    return (payload as { role?: string }).role ?? null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const role = await getRole(req);
    if (role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/customer") && pathname !== "/customer/login") {
    const role = await getRole(req);
    if (role !== "customer") {
      const url = req.nextUrl.clone();
      url.pathname = "/customer/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/customer/:path*"],
};
