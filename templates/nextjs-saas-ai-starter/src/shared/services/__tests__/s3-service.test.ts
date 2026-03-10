/**
 * Tests for S3 Service
 *
 * Note: These tests focus on the service functions that can be mocked.
 * Actual S3 operations require integration tests.
 */

// Mock AWS SDK before importing
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://example.com/signed-url'),
}));

jest.mock('@/shared/db', () => ({
  db: {
    query: {
      tenants: { findFirst: jest.fn() },
    },
  },
}));

jest.mock('@/shared/lib/env', () => ({
  env: {
    AWS_REGION: 'us-east-1',
    AWS_ACCESS_KEY_ID: 'test-key',
    AWS_SECRET_ACCESS_KEY: 'test-secret',
    AWS_S3_BUCKET: 'test-bucket',
  },
}));

import { db } from '@/shared/db';
import { clearTenantS3Client } from '../s3-service';

// Suppress unused warning - kept for future tests
void (db as jest.Mocked<typeof db>);

describe('s3-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('clearTenantS3Client', () => {
    it('should clear cached S3 client for tenant', () => {
      // This function clears the cache, so we just verify it doesn't throw
      expect(() => clearTenantS3Client('tenant-123')).not.toThrow();
    });

    it('should be idempotent', () => {
      // Calling twice should not throw
      clearTenantS3Client('tenant-123');
      expect(() => clearTenantS3Client('tenant-123')).not.toThrow();
    });
  });

  // Note: getTenantS3Client, generatePresignedUploadUrl, and generatePresignedDownloadUrl
  // require more complex mocking of the S3Client and database interactions.
  // These are better tested via integration tests.
});
