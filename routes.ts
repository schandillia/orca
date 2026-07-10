import { DEFAULT_LOGIN_REDIRECT } from "@/config/app"

/**
 * Routes that can be accessed without authentication.
 * Using a Set for O(1) lookups.
 */
export const publicRoutes = new Set(["/", "/login", "/terms", "/privacy"])

/**
 * Prefixes for public routes with subroutes.
 */
export const publicPrefixes: string[] = []

/**
 * Maps root routes to their default subroutes.
 * Visiting a root route redirects to its first subroute instead of rendering a blank page.
 */
export const routeRedirects: Record<string, string> = {}

/**
 * Authentication pages.
 * Authenticated users should be redirected away from these.
 */
export const authRoutes = new Set(["/login"])

/**
 * Prefix for API routes that should never be blocked by auth middleware.
 */
export const apiRoutes = "/api/"

/**
 * Default redirect after successful login when no callbackUrl is provided.
 */
export { DEFAULT_LOGIN_REDIRECT }
