/**
 * API Error Handling Utilities
 *
 * Standardized error responses for API routes.
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { logger } from './logger';

/**
 * Standard API error response shape
 */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  requestId?: string;
}

/**
 * Create a standardized API error response
 */
export function createApiError(
  code: string,
  message: string,
  status: number,
  details?: unknown,
  requestId?: string,
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
      requestId,
    },
    { status },
  );
}

/**
 * Common error responses
 */
export const ApiErrors = {
  badRequest: (message: string, details?: unknown, requestId?: string) =>
    createApiError('BAD_REQUEST', message, 400, details, requestId),

  unauthorized: (message = 'Authentication required', requestId?: string) =>
    createApiError('UNAUTHORIZED', message, 401, undefined, requestId),

  forbidden: (message = 'Access denied', requestId?: string) =>
    createApiError('FORBIDDEN', message, 403, undefined, requestId),

  notFound: (resource = 'Resource', requestId?: string) =>
    createApiError('NOT_FOUND', `${resource} not found`, 404, undefined, requestId),

  conflict: (message: string, requestId?: string) => createApiError('CONFLICT', message, 409, undefined, requestId),

  validationError: (error: ZodError, requestId?: string) =>
    createApiError(
      'VALIDATION_ERROR',
      'Request validation failed',
      400,
      error.issues.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
      requestId,
    ),

  internalError: (message = 'Internal server error', requestId?: string) =>
    createApiError('INTERNAL_ERROR', message, 500, undefined, requestId),

  serviceUnavailable: (message = 'Service temporarily unavailable', requestId?: string) =>
    createApiError('SERVICE_UNAVAILABLE', message, 503, undefined, requestId),
};

/**
 * Handle errors in API routes
 */
export function handleApiError(error: unknown, requestId?: string): NextResponse<ApiError> {
  // Zod validation errors
  if (error instanceof ZodError) {
    return ApiErrors.validationError(error, requestId);
  }

  // Standard Error
  if (error instanceof Error) {
    logger.error({ error, requestId }, 'API Error');

    // Don't expose internal error details in production
    const message =
      process.env.NEXT_PUBLIC_STAGE === 'dev' || process.env.NODE_ENV === 'development'
        ? error.message
        : 'An unexpected error occurred';

    return ApiErrors.internalError(message, requestId);
  }

  // Unknown error type
  logger.error({ error, requestId }, 'API Error: Unknown error type');
  return ApiErrors.internalError('An unexpected error occurred', requestId);
}

/**
 * Generate a request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Wrap an API handler with error handling and request ID
 */
export function withApiHandler<T>(
  handler: (requestId: string) => Promise<NextResponse<T>>,
): () => Promise<NextResponse<T | ApiError>> {
  return async () => {
    const requestId = generateRequestId();
    try {
      return await handler(requestId);
    } catch (error) {
      return handleApiError(error, requestId);
    }
  };
}
