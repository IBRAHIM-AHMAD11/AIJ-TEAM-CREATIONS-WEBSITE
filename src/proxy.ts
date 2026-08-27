import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

// Publicly accessible pages (anyone can visit)
const isPublicPage = createRouteMatcher(["/", "/auth"]);

// Pages reserved for non-authenticated users
const isAuthPage = createRouteMatcher(["/auth"]);

export async function proxy(request: any, event: any) {
  return convexAuthNextjsMiddleware(async (req, { convexAuth }) => {
    const isAuthenticated = await convexAuth.isAuthenticated();

    // 1. Unauthenticated users accessing private routes (like /store) -> redirect to /auth
    if (!isPublicPage(req) && !isAuthenticated) {
      return nextjsMiddlewareRedirect(req, "/auth");
    }

    // 2. Authenticated users landing on /auth -> redirect to /store
    if (isAuthPage(req) && isAuthenticated) {
      return nextjsMiddlewareRedirect(req, "/store");
    }

    // Admin role checks are handled by the admin layout using the current user query.
  })(request, event);
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};