import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { getSupabasePublicConfig } from '@/lib/config/env';

export async function updateSession(
  request: NextRequest,
  response: NextResponse,
  requestHeaders = request.headers
): Promise<{ response: NextResponse; user: User | null }> {
  let supabaseResponse = response;

  try {
    const { url, key } = getSupabasePublicConfig();

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    return {
      response: supabaseResponse,
      user,
    };
  } catch {
    return {
      response,
      user: null,
    };
  }
}
