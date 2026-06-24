import type { NextFetchEvent, NextRequest } from 'next/server';

export type MiddlewareHandlerResult =
  | Response
  | void
  | {
      response?: Response | void;
      priority?: number;
    };

export type MiddlewareHandler = (
  request: NextRequest,
  event: NextFetchEvent,
) => MiddlewareHandlerResult | Promise<MiddlewareHandlerResult>;

export const middlewareHandlers: MiddlewareHandler[] = [];

export const normalizeMiddlewareResult = (result: MiddlewareHandlerResult) => {
  if (result && typeof result === 'object' && 'response' in result) {
    return {
      response: result.response ?? undefined,
      priority: result.priority ?? 0,
    };
  }

  if (result instanceof Response) {
    return {
      response: result,
      priority: 0,
    };
  }

  return {
    response: undefined,
    priority: 0,
  };
};
