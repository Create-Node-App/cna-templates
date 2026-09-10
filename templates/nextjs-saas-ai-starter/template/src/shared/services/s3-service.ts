/**
 * S3 Service - File upload and presigned URL generation
 *
 * Provides S3-compatible operations using AWS SDK. Works with both
 * AWS S3 and MinIO (local development).
 *
 * Supports tenant-specific storage settings with fallback to environment variables.
 */

import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { eq } from 'drizzle-orm';

import { db } from '@/shared/db';
import { tenants } from '@/shared/db/schema';
import { env } from '@/shared/lib/env';
import {
  DEFAULT_STORAGE,
  hasStorageConfigured,
  parseTenantSettings,
  type StorageSettings,
} from '@/shared/lib/tenant-settings';

// S3 client configuration - supports both AWS S3 and MinIO
// Uses internal endpoint (minio:9000) for server-side operations
const s3Config = {
  region: env.AWS_REGION || 'us-east-1',
  ...(process.env.S3_ENDPOINT && {
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true, // Required for MinIO
  }),
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_KEY || env.AWS_SECRET_ACCESS_KEY || '',
  },
};

const s3Client = new S3Client(s3Config);

// For presigned URLs, we need a browser-accessible endpoint
// S3_PUBLIC_ENDPOINT should be set to the externally accessible URL (e.g., http://localhost:9000)
const publicEndpoint = process.env.S3_PUBLIC_ENDPOINT || process.env.S3_ENDPOINT;

// Create a separate client for presigned URL generation with public endpoint
const presignClient = new S3Client({
  ...s3Config,
  ...(publicEndpoint && {
    endpoint: publicEndpoint,
    forcePathStyle: true,
  }),
});

const bucket = process.env.S3_BUCKET || env.AWS_S3_BUCKET || 'saas-template-uploads';

// Cache for tenant-specific S3 clients
const tenantS3Clients = new Map<string, { client: S3Client; presignClient: S3Client; bucket: string }>();

/**
 * Get S3 clients for a specific tenant.
 *
 * Returns the cached clients when present; otherwise reads the tenant's
 * storage settings (merged over {@link DEFAULT_STORAGE}) and builds
 * tenant-scoped clients, falling back to the environment-variable clients
 * when the tenant has no storage configured.
 *
 * @param tenantId - The tenant ID to resolve storage settings for.
 * @returns The S3 client, presign client, bucket, and effective settings.
 * @throws Never throws for missing settings (falls back to env defaults).
 */
export async function getTenantS3Client(tenantId: string): Promise<{
  client: S3Client;
  presignClient: S3Client;
  bucket: string;
  settings: StorageSettings;
}> {
  // Check cache first
  const cached = tenantS3Clients.get(tenantId);
  if (cached) {
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });
    const tenantSettings = tenant ? parseTenantSettings(tenant.settings) : {};
    const storageSettings = { ...DEFAULT_STORAGE, ...tenantSettings.storage };
    return { ...cached, settings: storageSettings };
  }

  // Fetch tenant settings
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
  });

  const tenantSettings = tenant ? parseTenantSettings(tenant.settings) : {};
  const storageSettings = { ...DEFAULT_STORAGE, ...tenantSettings.storage };

  // Check if tenant has storage configured
  if (hasStorageConfigured(tenantSettings)) {
    const storage = tenantSettings.storage!;
    const tenantConfig = {
      region: storage.region || 'us-east-1',
      ...(storage.endpoint && {
        endpoint: storage.endpoint,
        forcePathStyle: storage.forcePathStyle !== false,
      }),
      credentials: {
        accessKeyId: storage.accessKey!,
        secretAccessKey: storage.secretKey!,
      },
    };

    const client = new S3Client(tenantConfig);

    const presignEndpoint = storage.publicEndpoint || storage.endpoint;
    const presignClientTenant = new S3Client({
      ...tenantConfig,
      ...(presignEndpoint && {
        endpoint: presignEndpoint,
        forcePathStyle: storage.forcePathStyle !== false,
      }),
    });

    const result = {
      client,
      presignClient: presignClientTenant,
      bucket: storage.bucket!,
    };
    tenantS3Clients.set(tenantId, result);
    return { ...result, settings: storageSettings };
  }

  // Fallback to env vars
  return {
    client: s3Client,
    presignClient,
    bucket,
    settings: storageSettings,
  };
}

/**
 * Clear the cached S3 clients for a tenant.
 *
 * Call this after the tenant's storage settings change so the next request
 * picks up the new credentials/bucket instead of reusing stale clients.
 *
 * @param tenantId - The tenant whose cached clients should be dropped.
 * @returns Nothing.
 */
export function clearTenantS3Client(tenantId: string): void {
  tenantS3Clients.delete(tenantId);
}

export interface PresignedUrlOptions {
  /** File key (path) in S3 */
  key: string;
  /** Content type of the file */
  contentType: string;
  /** URL expiration in seconds (default: 3600 = 1 hour) */
  expiresIn?: number;
  /** Maximum file size in bytes (for uploads) */
  maxSize?: number;
}

export interface UploadResult {
  key: string;
  bucket: string;
  url: string;
}

/**
 * Generate a presigned URL for uploading a file to S3.
 *
 * Uses the public endpoint so browsers can PUT directly without routing
 * bytes through the app server.
 *
 * @param options - Target `key`, `contentType`, optional `expiresIn` (default 3600s) and `maxSize`.
 * @returns A presigned PUT URL.
 * @throws When URL signing fails (e.g. invalid credentials).
 */
export async function getPresignedUploadUrl(options: PresignedUrlOptions): Promise<string> {
  const { key, contentType, expiresIn = 3600 } = options;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(presignClient, command, { expiresIn });
  return url;
}

/**
 * Generate a presigned URL for downloading a file from S3.
 *
 * Uses the public endpoint so browsers can GET directly.
 *
 * @param key - File key (path) in S3.
 * @param expiresIn - URL lifetime in seconds (default 3600 = 1 hour).
 * @returns A presigned GET URL.
 * @throws When URL signing fails (e.g. invalid credentials).
 */
export async function getPresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const url = await getSignedUrl(presignClient, command, { expiresIn });
  return url;
}

/**
 * Generate a presigned upload URL using tenant-specific storage settings.
 *
 * Resolves the tenant's bucket and presign client via
 * {@link getTenantS3Client} so uploads land in the tenant's own storage.
 *
 * @param tenantId - The tenant owning the target bucket.
 * @param options - Target `key`, `contentType`, optional `expiresIn` (default 3600s) and `maxSize`.
 * @returns A presigned PUT URL for the tenant's bucket.
 * @throws When URL signing fails (e.g. invalid credentials).
 */
export async function getTenantPresignedUploadUrl(tenantId: string, options: PresignedUrlOptions): Promise<string> {
  const { key, contentType, expiresIn = 3600 } = options;
  const { presignClient: tenantPresignClient, bucket: tenantBucket } = await getTenantS3Client(tenantId);

  const command = new PutObjectCommand({
    Bucket: tenantBucket,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(tenantPresignClient, command, { expiresIn });
  return url;
}

/**
 * Generate a presigned download URL using tenant-specific storage settings.
 *
 * @param tenantId - The tenant owning the target bucket.
 * @param key - File key (path) in the tenant's bucket.
 * @param expiresIn - URL lifetime in seconds (default 3600 = 1 hour).
 * @returns A presigned GET URL for the tenant's bucket.
 * @throws When URL signing fails (e.g. invalid credentials).
 */
export async function getTenantPresignedDownloadUrl(tenantId: string, key: string, expiresIn = 3600): Promise<string> {
  const { presignClient: tenantPresignClient, bucket: tenantBucket } = await getTenantS3Client(tenantId);

  const command = new GetObjectCommand({
    Bucket: tenantBucket,
    Key: key,
  });

  const url = await getSignedUrl(tenantPresignClient, command, { expiresIn });
  return url;
}

/**
 * Generate a unique file key with tenant isolation.
 *
 * Layout is `<tenantId>/<category>/<timestamp>-<random>-<sanitized-name>`
 * so keys never collide across tenants and are safe for URLs.
 *
 * @param tenantId - Tenant prefix isolating the key.
 * @param category - Logical grouping, e.g. `'avatars'`.
 * @param filename - Original filename (sanitized to `[a-zA-Z0-9.-]`).
 * @returns The namespaced unique file key.
 */
export function generateFileKey(tenantId: string, category: string, filename: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${tenantId}/${category}/${timestamp}-${randomSuffix}-${sanitizedFilename}`;
}

/**
 * Get the public URL for a file.
 *
 * Only usable when the bucket has public read access; otherwise use
 * {@link getPresignedDownloadUrl}.
 *
 * @param key - File key (path) in S3.
 * @returns The direct public URL for the key.
 */
export function getPublicUrl(key: string): string {
  const endpoint = process.env.S3_ENDPOINT || `https://s3.${env.AWS_REGION || 'us-east-1'}.amazonaws.com`;
  return `${endpoint}/${bucket}/${key}`;
}

export { s3Client, bucket };
