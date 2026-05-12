import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createHmac } from 'crypto';
import { verifyGitHubWebhook } from './github-verify.middleware';
import { mockReq, mockRes, mockNext } from '../test-utils/express-mocks';

const SECRET = 'unit-test-webhook-secret';

function sign(body: unknown, secret = SECRET): string {
  return (
    'sha256=' +
    createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex')
  );
}

describe('verifyGitHubWebhook middleware', () => {
  const originalSecret = process.env.GITHUB_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.GITHUB_WEBHOOK_SECRET = SECRET;
    // Silence the "skipping validation" warn in the no-secret test
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.GITHUB_WEBHOOK_SECRET = originalSecret;
    vi.restoreAllMocks();
  });

  describe('happy path', () => {
    it('calls next() when signature matches the body', () => {
      const body = { action: 'opened', number: 1 };
      const req = mockReq({
        body,
        headers: { 'x-hub-signature-256': sign(body) },
      });
      const res = mockRes();
      const next = mockNext();

      verifyGitHubWebhook(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('skips validation and calls next() when no secret is configured', () => {
      delete process.env.GITHUB_WEBHOOK_SECRET;

      const req = mockReq({ body: { foo: 'bar' } });
      const res = mockRes();
      const next = mockNext();

      verifyGitHubWebhook(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('breaking path', () => {
    it('returns 401 when signature header is missing', () => {
      const req = mockReq({ body: { hello: 'world' } });
      const res = mockRes();
      const next = mockNext();

      verifyGitHubWebhook(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: Missing signature' });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when signature was made with a DIFFERENT secret', () => {
      const body = { x: 1 };
      const req = mockReq({
        body,
        headers: { 'x-hub-signature-256': sign(body, 'wrong-secret') },
      });
      const res = mockRes();
      const next = mockNext();

      verifyGitHubWebhook(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: Invalid signature' });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when the body has been tampered with', () => {
      const originalBody = { number: 1 };
      const tamperedBody = { number: 2 };
      const req = mockReq({
        body: tamperedBody,
        headers: { 'x-hub-signature-256': sign(originalBody) },
      });
      const res = mockRes();
      const next = mockNext();

      verifyGitHubWebhook(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when signature length differs from expected (cheap pre-check)', () => {
      const req = mockReq({
        body: { x: 1 },
        headers: { 'x-hub-signature-256': 'sha256=short' },
      });
      const res = mockRes();
      const next = mockNext();

      verifyGitHubWebhook(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
