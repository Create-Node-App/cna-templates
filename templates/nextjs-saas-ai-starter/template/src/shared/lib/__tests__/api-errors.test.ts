/**
 * Tests for API error handling utilities
 */

import { z, ZodError } from 'zod';

// Create a mock NextResponse class before importing the module
class MockNextResponse {
  private body: unknown;
  public status: number;

  constructor(body: unknown, init?: { status?: number; headers?: HeadersInit }) {
    this.body = body;
    this.status = init?.status ?? 200;
    // Headers are accepted but not stored as they're not used in tests
    void init?.headers;
  }

  async json() {
    return this.body;
  }

  static json(data: unknown, init?: { status?: number; headers?: HeadersInit }) {
    return new MockNextResponse(data, init);
  }
}

// Mock next/server before importing the module
jest.mock('next/server', () => ({
  NextResponse: MockNextResponse,
}));

// Mock the logger
jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

import {
  type ApiError,
  ApiErrors,
  createApiError,
  generateRequestId,
  handleApiError,
  withApiHandler,
} from '../api-errors';

describe('api-errors', () => {
  describe('createApiError', () => {
    it('should create a standardized API error response', async () => {
      const response = createApiError('TEST_ERROR', 'Test message', 400);

      expect(response).toBeInstanceOf(MockNextResponse);
      expect(response.status).toBe(400);

      const body: ApiError = await response.json();
      expect(body.error.code).toBe('TEST_ERROR');
      expect(body.error.message).toBe('Test message');
      expect(body.timestamp).toBeDefined();
    });

    it('should include details when provided', async () => {
      const details = { field: 'email', issue: 'invalid' };
      const response = createApiError('VALIDATION_ERROR', 'Validation failed', 400, details);

      const body: ApiError = await response.json();
      expect(body.error.details).toEqual(details);
    });

    it('should include requestId when provided', async () => {
      const response = createApiError('TEST_ERROR', 'Test message', 500, undefined, 'req_123');

      const body: ApiError = await response.json();
      expect(body.requestId).toBe('req_123');
    });
  });

  describe('ApiErrors', () => {
    describe('badRequest', () => {
      it('should create a 400 response', async () => {
        const response = ApiErrors.badRequest('Invalid input');

        expect(response.status).toBe(400);
        const body: ApiError = await response.json();
        expect(body.error.code).toBe('BAD_REQUEST');
        expect(body.error.message).toBe('Invalid input');
      });

      it('should include details when provided', async () => {
        const details = { field: 'name' };
        const response = ApiErrors.badRequest('Invalid input', details);

        const body: ApiError = await response.json();
        expect(body.error.details).toEqual(details);
      });
    });

    describe('unauthorized', () => {
      it('should create a 401 response with default message', async () => {
        const response = ApiErrors.unauthorized();

        expect(response.status).toBe(401);
        const body: ApiError = await response.json();
        expect(body.error.code).toBe('UNAUTHORIZED');
        expect(body.error.message).toBe('Authentication required');
      });

      it('should use custom message when provided', async () => {
        const response = ApiErrors.unauthorized('Token expired');

        const body: ApiError = await response.json();
        expect(body.error.message).toBe('Token expired');
      });
    });

    describe('forbidden', () => {
      it('should create a 403 response with default message', async () => {
        const response = ApiErrors.forbidden();

        expect(response.status).toBe(403);
        const body: ApiError = await response.json();
        expect(body.error.code).toBe('FORBIDDEN');
        expect(body.error.message).toBe('Access denied');
      });

      it('should use custom message when provided', async () => {
        const response = ApiErrors.forbidden('Admin only');

        const body: ApiError = await response.json();
        expect(body.error.message).toBe('Admin only');
      });
    });

    describe('notFound', () => {
      it('should create a 404 response with default resource', async () => {
        const response = ApiErrors.notFound();

        expect(response.status).toBe(404);
        const body: ApiError = await response.json();
        expect(body.error.code).toBe('NOT_FOUND');
        expect(body.error.message).toBe('Resource not found');
      });

      it('should use custom resource name', async () => {
        const response = ApiErrors.notFound('User');

        const body: ApiError = await response.json();
        expect(body.error.message).toBe('User not found');
      });
    });

    describe('conflict', () => {
      it('should create a 409 response', async () => {
        const response = ApiErrors.conflict('Email already exists');

        expect(response.status).toBe(409);
        const body: ApiError = await response.json();
        expect(body.error.code).toBe('CONFLICT');
        expect(body.error.message).toBe('Email already exists');
      });
    });

    describe('validationError', () => {
      it('should create a 400 response with Zod error details', async () => {
        const schema = z.object({
          email: z.string().email(),
          name: z.string().min(1),
        });

        let zodError: ZodError;
        try {
          schema.parse({ email: 'invalid', name: '' });
        } catch (e) {
          zodError = e as ZodError;
        }

        const response = ApiErrors.validationError(zodError!);

        expect(response.status).toBe(400);
        const body: ApiError = await response.json();
        expect(body.error.code).toBe('VALIDATION_ERROR');
        expect(body.error.message).toBe('Request validation failed');
        expect(Array.isArray(body.error.details)).toBe(true);
        expect((body.error.details as Array<{ path: string; message: string }>).length).toBe(2);
      });
    });

    describe('internalError', () => {
      it('should create a 500 response with default message', async () => {
        const response = ApiErrors.internalError();

        expect(response.status).toBe(500);
        const body: ApiError = await response.json();
        expect(body.error.code).toBe('INTERNAL_ERROR');
        expect(body.error.message).toBe('Internal server error');
      });

      it('should use custom message when provided', async () => {
        const response = ApiErrors.internalError('Database connection failed');

        const body: ApiError = await response.json();
        expect(body.error.message).toBe('Database connection failed');
      });
    });

    describe('serviceUnavailable', () => {
      it('should create a 503 response with default message', async () => {
        const response = ApiErrors.serviceUnavailable();

        expect(response.status).toBe(503);
        const body: ApiError = await response.json();
        expect(body.error.code).toBe('SERVICE_UNAVAILABLE');
        expect(body.error.message).toBe('Service temporarily unavailable');
      });
    });
  });

  describe('handleApiError', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });

    it('should handle ZodError', async () => {
      const schema = z.object({ name: z.string() });
      let error: ZodError;
      try {
        schema.parse({ name: 123 });
      } catch (e) {
        error = e as ZodError;
      }

      const response = handleApiError(error!);

      expect(response.status).toBe(400);
      const body: ApiError = await response.json();
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle standard Error in development', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });
      const error = new Error('Something went wrong');

      const response = handleApiError(error);

      expect(response.status).toBe(500);
      const body: ApiError = await response.json();
      expect(body.error.message).toBe('Something went wrong');
    });

    it('should hide error details in production', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });
      const error = new Error('Sensitive internal error');

      const response = handleApiError(error);

      expect(response.status).toBe(500);
      const body: ApiError = await response.json();
      expect(body.error.message).toBe('An unexpected error occurred');
    });

    it('should handle unknown error types', async () => {
      const response = handleApiError('string error');

      expect(response.status).toBe(500);
      const body: ApiError = await response.json();
      expect(body.error.message).toBe('An unexpected error occurred');
    });

    it('should include requestId when provided', async () => {
      const error = new Error('Test error');
      const response = handleApiError(error, 'req_abc123');

      const body: ApiError = await response.json();
      expect(body.requestId).toBe('req_abc123');
    });
  });

  describe('generateRequestId', () => {
    it('should generate a string starting with req_', () => {
      const id = generateRequestId();
      expect(id.startsWith('req_')).toBe(true);
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateRequestId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('withApiHandler', () => {
    it('should call handler and return response', async () => {
      const mockHandler = jest.fn().mockResolvedValue(MockNextResponse.json({ success: true }));

      const wrappedHandler = withApiHandler(mockHandler);
      const response = await wrappedHandler();

      expect(mockHandler).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should pass requestId to handler', async () => {
      let receivedRequestId: string | undefined;
      const mockHandler = jest.fn().mockImplementation((requestId: string) => {
        receivedRequestId = requestId;
        return MockNextResponse.json({ success: true });
      });

      const wrappedHandler = withApiHandler(mockHandler);
      await wrappedHandler();

      expect(receivedRequestId).toBeDefined();
      expect(receivedRequestId!.startsWith('req_')).toBe(true);
    });

    it('should catch errors and return error response', async () => {
      const mockHandler = jest.fn().mockRejectedValue(new Error('Handler failed'));

      const wrappedHandler = withApiHandler(mockHandler);
      const response = await wrappedHandler();

      expect(response.status).toBe(500);
    });
  });
});
