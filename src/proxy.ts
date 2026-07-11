import { convexAuthNextjsMiddleware, createRouteMatcher, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server";

const isPublicPage = createRouteMatcher([
  "/auth",
]);

// Next.js 16 expects a named export function called 'proxy'
export async function proxy(request: any, event: any) {
  // We wrap the Convex middleware runner and pass the arguments through
  return convexAuthNextjsMiddleware(async (req, { convexAuth }) => {
    if (!isPublicPage(req) && !(await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(req, "/auth");
    }
    if (isPublicPage(req) && (await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(req, "/");
    }
    
  })(request, event);
}

export const config = {
  // The matcher runs proxy logic on all routes except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};