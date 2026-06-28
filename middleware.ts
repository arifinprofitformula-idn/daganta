import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import type { TenantResolveResult } from '@/lib/tenant/types';

const STOREFRONT_EXCLUDED_PREFIXES = [
  '/api',
  '/agent',
  '/dashboard',
  '/login',
  '/logout',
  '/signup',
  '/agent-waitlist',
  '/toko-tidak-aktif',
];

function cleanHostname(host: string) {
  return host.trim().split(':')[0].toLowerCase();
}

function isStorefrontRoute(pathname: string) {
  if (pathname.startsWith('/_next') || pathname === '/favicon.ico') {
    return false;
  }

  if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
    return false;
  }

  return !STOREFRONT_EXCLUDED_PREFIXES.some((prefix) => {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

function getInternalBaseUrl(request: NextRequest) {
  const configuredUrl = process.env.INTERNAL_APP_URL?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  if (process.env.NODE_ENV === 'production' && process.env.PORT) {
    return `http://127.0.0.1:${process.env.PORT}`;
  }

  return request.url;
}

function createInternalUrl(pathname: string, request: NextRequest) {
  return new URL(pathname, getInternalBaseUrl(request));
}

async function resolveTenantForMiddleware(request: NextRequest) {
  const url = createInternalUrl('/api/internal/tenant-resolve', request);
  url.searchParams.set('host', request.headers.get('host') ?? '');

  const response = await fetch(url, {
    headers: {
      host: request.headers.get('host') ?? '',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as TenantResolveResult;
}

async function resolveAgentAccessForMiddleware(request: NextRequest) {
  const url = createInternalUrl('/api/internal/agent-access', request);
  const response = await fetch(url, {
    headers: request.headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as {
    authenticated: boolean;
    isAgent: boolean;
  };
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get('host') ?? '';
  const rootDomain = (process.env.NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN || 'daganta.store').toLowerCase();
  const hostname = cleanHostname(host);

  if (hostname === `www.${rootDomain}`) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.hostname = rootDomain;
    redirectUrl.port = '';
    return NextResponse.redirect(redirectUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-daganta-pathname', pathname);

  if (isStorefrontRoute(pathname)) {
    const tenantResolution = await resolveTenantForMiddleware(request);

    if (!tenantResolution) {
      return new NextResponse('Toko tidak ditemukan', { status: 404 });
    }

    if (
      tenantResolution.status === 'SUSPENDED' ||
      tenantResolution.status === 'BLOCKED' ||
      tenantResolution.suspended
    ) {
      return NextResponse.redirect(new URL('/toko-tidak-aktif', request.url));
    }

    if (tenantResolution.status === 'RESERVED' || tenantResolution.status === 'NOT_FOUND') {
      return new NextResponse('Toko tidak ditemukan', { status: 404 });
    }

    if (tenantResolution.tenant) {
      requestHeaders.set('x-daganta-tenant-id', tenantResolution.tenant.id);
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const { response: sessionResponse, user } = await updateSession(
    request,
    response,
    requestHeaders
  );

  const isDashboardRoute =
    pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const isAgentRoute = pathname === '/agent' || pathname.startsWith('/agent/');
  const isLoginRoute = pathname === '/login';

  if (isDashboardRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAgentRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const agentAccess = await resolveAgentAccessForMiddleware(request);

    if (!agentAccess?.isAgent) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (isLoginRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return sessionResponse;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
