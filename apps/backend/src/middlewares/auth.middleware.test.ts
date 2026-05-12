import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { requireAuth } from './auth.middleware';
import { AuthService } from '../services/auth.service';
import { mockReq, mockRes, mockNext } from '../test-utils/express-mocks';

describe('requireAuth middleware', () => {
  let validToken: string;

  beforeEach(() => {
    validToken = AuthService.issueToken({ userId: 'u-1', githubId: 'gh-1' });
  });

  describe('happy path', () => {
    it('accepts a valid token from the auth_token cookie', () => {
      const req = mockReq({ cookies: { auth_token: validToken } });
      const res = mockRes();
      const next = mockNext();

      requireAuth(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
      expect(req.auth?.userId).toBe('u-1');
      expect(req.auth?.githubId).toBe('gh-1');
    });

    it('accepts a valid token from the Authorization: Bearer header', () => {
      const req = mockReq({ headers: { authorization: `Bearer ${validToken}` } });
      const res = mockRes();
      const next = mockNext();

      requireAuth(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(req.auth?.userId).toBe('u-1');
    });

    it('prefers the cookie over the header when both are present', () => {
      const cookieToken = AuthService.issueToken({ userId: 'cookie-user', githubId: 'gh' });
      const headerToken = AuthService.issueToken({ userId: 'header-user', githubId: 'gh' });
      const req = mockReq({
        cookies: { auth_token: cookieToken },
        headers: { authorization: `Bearer ${headerToken}` },
      });
      const res = mockRes();
      const next = mockNext();

      requireAuth(req, res, next);

      expect(req.auth?.userId).toBe('cookie-user');
    });
  });

  describe('breaking path — 401s', () => {
    it('returns 401 when no token is supplied at all', () => {
      const req = mockReq();
      const res = mockRes();
      const next = mockNext();

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: missing credentials' });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when the Authorization header is malformed (no Bearer prefix)', () => {
      const req = mockReq({ headers: { authorization: validToken } }); // missing "Bearer "
      const res = mockRes();
      const next = mockNext();

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 with "invalid token" message when the token is garbage', () => {
      const req = mockReq({ cookies: { auth_token: 'totally-not-a-jwt' } });
      const res = mockRes();
      const next = mockNext();

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: invalid token' });
    });

    it('returns 401 when the token was signed with a foreign secret', () => {
      const foreign = jwt.sign({ userId: 'attacker', githubId: 'gh' }, 'attacker-secret');
      const req = mockReq({ cookies: { auth_token: foreign } });
      const res = mockRes();
      const next = mockNext();

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when the token is expired', () => {
      const expired = jwt.sign({ userId: 'u', githubId: 'g' }, process.env.JWT_SECRET!, {
        expiresIn: -1,
      });
      const req = mockReq({ cookies: { auth_token: expired } });
      const res = mockRes();
      const next = mockNext();

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('does NOT call next on auth failure (regression guard)', () => {
      // It would be a critical security bug for next() to fire on failure.
      const req = mockReq({ cookies: { auth_token: 'nope' } });
      const res = mockRes();
      const next = mockNext();
      requireAuth(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
