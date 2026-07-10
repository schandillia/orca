import { type NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth/auth"
import {
  apiRoutes,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  publicPrefixes,
  publicRoutes,
} from "@/routes"

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Never block API routes
  if (pathname.startsWith(apiRoutes)) {
    return NextResponse.next()
  }

  const isPublicRoute =
    publicRoutes.has(pathname) ||
    publicPrefixes.some((prefix) => pathname.startsWith(prefix))

  const isAuthRoute = authRoutes.has(pathname)

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  // Logged-in users should not see auth pages
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url))
  }

  // Public pages are always allowed
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Protected page without a session
  if (!session) {
    const loginUrl = new URL("/login", request.url)

    loginUrl.searchParams.set("callbackUrl", pathname + search)

    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
