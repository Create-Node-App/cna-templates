/**
 * File download URL (for embedding in rich text)
 *
 * GET /api/tenants/[tenant]/files/[fileId]
 * Redirects to a presigned download URL. Used as img src or link href for
 * file attachments.
 */

import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/shared/db';
import { fileObjects, persons, tenants } from '@/shared/db/schema';
import { ApiErrors, handleApiError } from '@/shared/lib/api-errors';
import { auth } from '@/shared/lib/auth';
import { getPresignedDownloadUrl } from '@/shared/services/s3-service';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ tenant: string; fileId: string }> }) {
  try {
    const { tenant: tenantSlug, fileId } = await params;
    const session = await auth();
    if (!session?.user?.email) {
      return ApiErrors.unauthorized();
    }

    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.slug, tenantSlug),
    });
    if (!tenant) return ApiErrors.notFound('Tenant');

    const person = await db.query.persons.findFirst({
      where: and(eq(persons.tenantId, tenant.id), eq(persons.email, session.user.email)),
    });
    if (!person) return ApiErrors.notFound('Person');

    const file = await db.query.fileObjects.findFirst({
      where: and(eq(fileObjects.id, fileId), eq(fileObjects.tenantId, tenant.id)),
    });
    if (!file) return ApiErrors.notFound('File');

    const url = await getPresignedDownloadUrl(file.s3Key, 3600);
    return NextResponse.redirect(url, 302);
  } catch (error) {
    return handleApiError(error);
  }
}
