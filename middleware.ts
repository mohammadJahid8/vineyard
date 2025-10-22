import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Handle CORS for API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return new NextResponse(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With',
            'Access-Control-Max-Age': '86400',
          },
        });
      }

      // Add CORS headers to API responses
      const response = NextResponse.next();
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
      
      // Special handling for upload endpoint
      if (req.nextUrl.pathname === '/api/admin/upload') {
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.headers.set('CF-Cache-Status', 'BYPASS');
      }
      
      return response;
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log('🚀 ~ token:', token)
        // Protect routes that need authentication
        const protectedPaths = [
          "/plans", 
          "/profile", 
          "/plan", 
          "/explore", 
          "/day-trip",
          "/admin",
          "/itinerary"
        ]
        
        const isProtectedPath = protectedPaths.some(path => 
          req.nextUrl.pathname.startsWith(path)
        )
        
        if (isProtectedPath) {
          return !!token
        }
        
        return true
      },
    },
    pages: {
      signIn: '/sign-in',
    },
  }
)

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
