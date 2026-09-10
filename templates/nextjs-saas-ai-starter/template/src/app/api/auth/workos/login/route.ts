import { getSignInUrl } from '@workos-inc/authkit-nextjs';
import { NextResponse } from 'next/server';

/**
 * WorkOS AuthKit login entry point (advanced opt-in).
 *
 * Redirects to the hosted AuthKit login. Only useful in a deployment with
 * full AuthKit configuration; otherwise responds with 503.
 */
export async function GET() {
  try {
    const signInUrl = await getSignInUrl();
    return NextResponse.redirect(signInUrl);
  } catch {
    return NextResponse.json(
      { error: 'WorkOS AuthKit is not configured. See docs/AUTHENTICATION.md.' },
      { status: 503 },
    );
  }
}
