import { vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

/**
 * Minimal Express-shaped request mock. Override any field via the partial input.
 * Includes the `auth` field populated by requireAuth so controllers can read req.auth!.userId.
 */
export function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    body: undefined,
    query: {},
    params: {},
    headers: {},
    cookies: {},
    ...overrides,
  } as unknown as Request;
}

/**
 * Spy-able Response mock that supports the fluent chain res.status(x).json(y).
 * Every method is a vi.fn so tests can assert call args.
 */
export function mockRes(): Response & {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
  redirect: ReturnType<typeof vi.fn>;
  cookie: ReturnType<typeof vi.fn>;
  clearCookie: ReturnType<typeof vi.fn>;
} {
  const res = {} as any;
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  res.send = vi.fn(() => res);
  res.redirect = vi.fn(() => res);
  res.cookie = vi.fn(() => res);
  res.clearCookie = vi.fn(() => res);
  return res;
}

export function mockNext(): NextFunction & ReturnType<typeof vi.fn> {
  return vi.fn() as any;
}
