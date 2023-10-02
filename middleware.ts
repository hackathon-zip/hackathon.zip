import { authMiddleware } from "@clerk/nextjs";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { getSubdomains } from "./lib/utils";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware

export default function middleware(
    request: NextRequest,
    event: NextFetchEvent
) {
    const withAuthentication = (callback: (req: NextRequest) => any) => {
        return authMiddleware({
            publicRoutes: ["/"],
            afterAuth: (auth: any, req: NextRequest) => {
                return callback(req);
            },
        })(request, event);
    };

    const withoutAuthentication = (
        route: string,
        callback: (req: NextRequest) => any
    ) => {
        return authMiddleware({
            publicRoutes: [route],
            afterAuth: (auth: any, req: NextRequest) => {
                return callback(req);
            },
        })(request, event);
    };

    const { pathname } = request.nextUrl;
    const hostname = request.headers.get("host"); // Get the hostname from the request headers, because Next.js doesn't like localhost subdomains (vercel/next.js#56320)
    const isApi = pathname.startsWith("/api");
    const isAttendeeApi = pathname.startsWith("/api/attendee/");
    let pathnameWithoutAPI = pathname.replace("/api", "");

    const rewrite = (path: string) =>
        NextResponse.rewrite(new URL(path, request.url));

    let subdomain: string | undefined;

    subdomain = getSubdomains(hostname)?.[0];

    switch (subdomain) {
        case "organizer": // you are on organizer.hackathon.zip
            return withAuthentication(
                isApi && !isAttendeeApi
                    ? () => rewrite("/api/organizer" + pathnameWithoutAPI)
                    : () => null
            );
        case "api": // you are on api.hackathon.zip
            return withoutAuthentication(pathname, () =>
                rewrite("/api/integration" + pathname)
            );

        case undefined: // you are on hackathon.zip
            return withoutAuthentication(pathname, () =>
                rewrite(
                    isApi ? `/api${pathnameWithoutAPI}` : `/landing${pathname}`
                )
            );
        default: // you are on [event].hackathon.zip
            return withoutAuthentication(pathname, () =>
                rewrite(
                    isApi
                        ? `/api/attendee/${subdomain}` + pathnameWithoutAPI
                        : `/attendee/${subdomain}` + pathname
                )
            );
    }
}

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

/**
 * Current Plan:
 *
 * hackathon.zip/route -> /route (LANDING PAGE)
 * hackathon.zip/api/route -> /api/route
 *
 * organizer.hackathon.zip/route -> /organizer/route
 * organizer.hackathon.zip/api/route -> /api/organizer/route
 *
 * [event].hackathon.zip/route -> /attendee/[event]/route
 * [event].hackathon.zip/api/route -> /api/attendee/[event]/route
 *
 * api.hackathon.zip/route -> /api/integration/route
 */

/**
 * Old Current Plan:
 *
 * hackathon.zip/route -> /route
 * hackathon.zip/api/route -> /api/organizer/route
 *
 * [event].hackathon.zip/route -> /attendee/[event]/route
 * [event].hackathon.zip/api/route -> /api/attendee/[event]/route
 *
 * api.hackathon.zip/route -> /api/integration/route
 */

/**
 * Tertiary Plan:
 *
 * hackathon.zip/route -> /route (LANDING PAGE)
 * hackathon.zip/api/route -> /api/route
 *
 * [event].hackathon.zip/route -> /attendee/[event]/route
 * [event].hackathon.zip/api/route -> /api/attendee/[event]/route
 *
 * [event].hackathon.zip/organizer/route -> /organizer/[event]/route
 * [event].hackathon.zip/api/organizer/route -> /api/organizer/[event]/route
 *
 * api.hackathon.zip/route -> /api/integration/route
 */
