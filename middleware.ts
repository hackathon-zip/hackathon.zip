import { authMiddleware } from "@clerk/nextjs";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
 
// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware

export default function middleware (request: NextRequest, event: NextFetchEvent) {
    const withAuthentication = (callback: (req: NextRequest) => any) => {
        return authMiddleware({
            publicRoutes: ["/"],
            afterAuth: (auth: any, req: NextRequest) => {
                return callback(req);
            }
        })(request, event);
    }
    const withoutAuthentication = (route: string, callback: (req: NextRequest) => any) => {
        return authMiddleware({
            publicRoutes: [route],
            afterAuth: (auth: any, req: NextRequest) => {
                return callback(req);
            }
        })(request, event);
    }

    const { hostname, pathname } = request.nextUrl;
    
    let subdomain: string | undefined;


    if (hostname.endsWith('hackathon.zip')) subdomain = hostname.split('.').reverse()[2];
    if (hostname.endsWith('localhost')) return withAuthentication(() => null);

    const isApi = pathname.startsWith('/api');

    const rewrite = (path: string) => NextResponse.rewrite(new URL(path, request.url));
    console.log({ hostname });
    console.log(request.nextUrl)

    if (subdomain === undefined) return withAuthentication(() => {
        if (isApi) return rewrite(`/api/organizer${pathname}`);
    });
    
    if (subdomain === 'api') return withoutAuthentication(pathname, () => rewrite(`/api/integration${pathname}`));
    
    return withoutAuthentication(pathname, () => rewrite(`/${isApi ? 'api/' : ''}attendee${subdomain}${pathname}`));

    


    subdomain = hostname.split('.')[0]             // subdomain.example.com
    let isAPI = pathname.startsWith('/api/')       // if pathname begins with "/api/"
    let pathnameWithoutAPI = pathname.replace("/api", "")

    switch (subdomain) {
      case 'hackathon': // you are on hackathon.zip
      case 'localhost': // or you are testing, which equivalent to being on hackathon.zip
          return withAuthentication(isAPI ? () => rewrite('/api/organizer' + pathnameWithoutAPI) : () => null);
      case 'api': // you are on api.hackathon.zip
        return withoutAuthentication(pathname, () => rewrite('/api/integration' + pathname));
      default: // you are on [event].hackathon.zip
        return withoutAuthentication(pathname, () => rewrite(
            isAPI ? 
              `/api/attendee/${subdomain}` + pathnameWithoutAPI :
              `/attendee/${subdomain}` + pathname
        ));
    }
}

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};

/**
 * Current Plan:
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
 * Backup Plan:
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