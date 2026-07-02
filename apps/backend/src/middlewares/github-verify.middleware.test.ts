import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createHmac } from 'crypto';
import { verifyGitHubWebhook } from './github-verify.middleware';
import { mockReq, mockRes, mockNext } from '../test-utils/express-mocks';

const SECRET = 'unit-test-webhook-secret';

function sign(raw: string | Buffer, secret = SECRET): string {
  return 'sha256=' + createHmac('sha256', secret).update(raw).digest('hex');
}

/** Builds a req the way express.json({ verify }) leaves it: parsed body + raw bytes. */
function signedReq(body: unknown, overrides: Record<string, unknown> = {}) {
  const raw = JSON.stringify(body);
  return mockReq({
    body,
    rawBody: Buffer.from(raw),
    headers: { 'x-hub-signature-256': sign(raw) },
    ...overrides,
  } as never);
}

describe('verifyGitHubWebhook middleware', () => {
  const originalSecret = process.env.GITHUB_WEBHOOK_SECRET;

  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.GITHUB_WEBHOOK_SECRET = SECRET;
    // Silence the "skipping validation" warn/error in the no-secret tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.GITHUB_WEBHOOK_SECRET = originalSecret;
    process.env.NODE_ENV = originalNodeEnv;
    vi.restoreAllMocks();
  });

  describe('happy path', () => {
    it('calls next() when signature matches the raw body bytes', () => {
      const req = signedReq({ action: 'opened', number: 1 });
      const res = mockRes();
      const next = mockNext();

      verifyGitHubWebhook(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('accepts raw bytes that a parse→stringify round-trip would NOT reproduce (unicode escapes)', () => {
      // GitHub may send `é` escaped; JSON.parse → JSON.stringify yields the
      // literal `é`, so re-serializing the parsed body changes the bytes. The
      // signature must be checked against the wire bytes and still pass.
      const raw = '{"title":"caf\\u00e9 \\ud83d\\ude00"}';
      expect(JSON.stringify(JSON.parse(raw))).not.toBe(raw); // precondition of the regression
      const req = mockReq({
        body: JSON.parse(raw),
        rawBody: Buffer.from(raw),
        headers: { 'x-hub-signature-256': sign(raw) },
      } as never);
      const res = mockRes();
      const next = mockNext();

      verifyGitHubWebhook(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('skips validation and calls next() when no secret is configured (non-production only)', () => {
      delete process.env.GITHUB_WEBHOOK_SECRET;
      process.env.NODE_ENV = 'development';

      const req = mockReq({ body: { foo: 'bar' } });
      const res = mockRes();
      const next = mockNext();

      verifyGitHubWebhook(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('fails CLOSED (500) when no secret is configured in production', () => {
      delete process.env.GITHUB_WEBHOOK_SECRET;
      process.env.NODE_ENV = 'production';

      const req = mockReq({ body: { foo: 'bar' } });
      const res = mockRes();
      const next = mockNext();

      verifyGitHubWebhook(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('breaking path', () => {
    it('returns 401 when signature header is missing', () => {
      const req = mockReq({ body: { hello: 'world' }, rawBody: Buffer.from('{"hello":"world"}') } as never);
      const res = mockRes();
      const next = mockNext();

      verifyGitHubWebhook(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: Missing signature' });
      expect(next).not.toHaveBeenCalled();
    });

    it('fails CLOSED (500) when rawBody was never captured', () => {
      const body = { x: 1 };
      const req = mockReq({
        body,
        headers: { 'x-hub-signature-256': sign(JSON.stringify(body)) },
      });
      const res = mockRes();
      const next = mockNext();

      verifyGitHubWebhook(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when signature was made with a DIFFERENT secret', () => {
      const body = { x: 1 };
      const raw = JSON.stringify(body);
      const req = mockReq({
        body,
        rawBody: Buffer.from(raw),
        headers: { 'x-hub-signature-256': sign(raw, 'wrong-secret') },
      } as never);
      const res = mockRes();
      const next = mockNext();

      verifyGitHubWebhook(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: Invalid signature' });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when the body has been tampered with in transit', () => {
      const originalRaw = JSON.stringify({ number: 1 });
      const tamperedRaw = JSON.stringify({ number: 2 });
      const req = mockReq({
        body: JSON.parse(tamperedRaw),
        rawBody: Buffer.from(tamperedRaw),
        headers: { 'x-hub-signature-256': sign(originalRaw) },
      } as never);
      const res = mockRes();
      const next = mockNext();

      verifyGitHubWebhook(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when signature length differs from expected (cheap pre-check)', () => {
      const req = mockReq({
        body: { x: 1 },
        rawBody: Buffer.from('{"x":1}'),
        headers: { 'x-hub-signature-256': 'sha256=short' },
      } as never);
      const res = mockRes();
      const next = mockNext();

      verifyGitHubWebhook(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('additional edge cases', () => {
    it('accepts an array body with matching signature', () => {
      const req = signedReq([{ a: 1 }, { b: 2 }]);
      const res = mockRes();
      const next = mockNext();

      verifyGitHubWebhook(req, res, next);

      expect(next).toHaveBeenCalledOnce();
    });

    it('accepts an empty object body with matching signature', () => {
      const req = signedReq({});
      const res = mockRes();
      const next = mockNext();

      verifyGitHubWebhook(req, res, next);

      expect(next).toHaveBeenCalledOnce();
    });

    it('returns 401 when signature uses sha1 prefix instead of sha256', () => {
      const raw = '{"x":1}';
      const sha1Like = 'sha1=' + createHmac('sha256', SECRET).update(raw).digest('hex');
      const req = mockReq({
        body: { x: 1 },
        rawBody: Buffer.from(raw),
        headers: { 'x-hub-signature-256': sha1Like },
      } as never);
      const res = mockRes();
      const next = mockNext();

      verifyGitHubWebhook(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when signature is missing the "sha256=" prefix', () => {
      const raw = '{"x":1}';
      const rawHex = createHmac('sha256', SECRET).update(raw).digest('hex');
      const req = mockReq({
        body: { x: 1 },
        rawBody: Buffer.from(raw),
        headers: { 'x-hub-signature-256': rawHex },
      } as never);
      const res = mockRes();
      const next = mockNext();

      verifyGitHubWebhook(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when the signature value is exactly empty string', () => {
      const req = mockReq({
        body: { x: 1 },
        rawBody: Buffer.from('{"x":1}'),
        headers: { 'x-hub-signature-256': '' },
      } as never);
      const res = mockRes();
      const next = mockNext();

      verifyGitHubWebhook(req, res, next);

      // Empty string is falsy → "Missing signature".
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: Missing signature' });
    });

    it('rejects when the raw wire bytes differ from what was signed (key reorder)', () => {
      // Same logical object, different byte order on the wire — the signature
      // is over bytes, so this must fail.
      const signedRaw = '{"a":1,"b":2}';
      const wireRaw = '{"b":2,"a":1}';
      const req = mockReq({
        body: JSON.parse(wireRaw),
        rawBody: Buffer.from(wireRaw),
        headers: { 'x-hub-signature-256': sign(signedRaw) },
      } as never);
      const res = mockRes();
      const next = mockNext();

      verifyGitHubWebhook(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
