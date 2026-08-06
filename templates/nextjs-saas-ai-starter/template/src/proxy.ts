import { NextResponse } from 'next/server';

import type { TenantRole } from '@/shared/db/schema/auth';
import { auth } from '@/shared/lib/auth';

/**
 * Proxy for Next.js SaaS AI Template application (formerly middleware)
 *
 * Responsibilities:
 * 1. Inject pathname header for server components
 * 2. Handle tenant route validation
 * 3. Auth protection via Auth.js
 * 4. RBAC protection for admin routes
 * 5. Allow tenant login pages without auth
 *
 * Note: In Next.js 16+, middleware is renamed to proxy.
 * See: https://nextjs.org/docs/messages/middleware-to-proxy
 */
export default auth((request) => {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Inject pathname for server components to access current path
  response.headers.set('x-pathname', pathname);

  // Inject tenant slug if in tenant route
  const tenantMatch = pathname.match(/^\/t\/([^/]+)/);
  if (tenantMatch) {
    const tenantSlug = tenantMatch[1];
    response.headers.set('x-tenant-slug', tenantSlug);

    // Skip auth check for tenant login page (handled by the page itself)
    if (pathname === `/t/${tenantSlug}/login`) {
      return response;
    }

    // Check for admin routes: /t/[tenant]/admin/*
    if (pathname.match(/^\/t\/[^/]+\/admin/)) {
      const userRoles = request.auth?.user?.roles as Record<string, TenantRole> | undefined;
      const userRole = userRoles?.[tenantSlug];

      // Fast path: require admin role for admin routes. Real authorization is always by permissions in layout/API (hasPermission); this hint avoids sending unauthenticated users into admin layout.
      if (userRole !== 'admin') {
        // Redirect to tenant dashboard with error
        const url = request.nextUrl.clone();
        url.pathname = `/t/${tenantSlug}`;
        url.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(url);
      }

      // Inject role header for admin pages
      response.headers.set('x-user-role', userRole);
    }
  }

  return response;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
