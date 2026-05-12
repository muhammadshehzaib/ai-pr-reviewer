import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';

// JWT_SECRET is injected via vitest.config.ts env block.

describe('AuthService', () => {
  const validPayload = { userId: 'user-123', githubId: 'gh-456' };

  describe('issueToken() — happy path', () => {
    it('returns a non-empty string token', () => {
      const token = AuthService.issueToken(validPayload);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('produces a token with three dot-separated segments (JWT shape)', () => {
      const token = AuthService.issueToken(validPayload);
      expect(token.split('.')).toHaveLength(3);
    });

    it('encodes the payload such that verifyToken returns it back', () => {
      const token = AuthService.issueToken(validPayload);
      const decoded = AuthService.verifyToken(token);
      expect(decoded.userId).toBe(validPayload.userId);
      expect(decoded.githubId).toBe(validPayload.githubId);
    });

    it('includes an exp claim (token is not eternal)', () => {
      const token = AuthService.issueToken(validPayload);
      const decoded = jwt.decode(token) as Record<string, unknown>;
      expect(decoded).toHaveProperty('exp');
      expect(typeof decoded.exp).toBe('number');
    });
  });

  describe('verifyToken() — failure paths', () => {
    it('throws on a completely garbage token', () => {
      expect(() => AuthService.verifyToken('not-a-real-token')).toThrow();
    });

    it('throws on an empty string', () => {
      expect(() => AuthService.verifyToken('')).toThrow();
    });

    it('throws on a token signed with a different secret', () => {
      const foreignToken = jwt.sign(validPayload, 'some-other-attacker-secret');
      expect(() => AuthService.verifyToken(foreignToken)).toThrow();
    });

    it('throws on a tampered payload (signature mismatch)', () => {
      const token = AuthService.issueToken(validPayload);
      const [header, _payload, signature] = token.split('.');
      const fakePayload = Buffer.from(
        JSON.stringify({ userId: 'attacker', githubId: 'attacker' }),
      ).toString('base64url');
      const tampered = `${header}.${fakePayload}.${signature}`;

      expect(() => AuthService.verifyToken(tampered)).toThrow();
    });

    it('throws on an expired token', () => {
      // Issue a token that expired 1 second ago.
      const expired = jwt.sign(validPayload, process.env.JWT_SECRET!, {
        expiresIn: -1,
      });
      expect(() => AuthService.verifyToken(expired)).toThrow(/jwt expired/i);
    });

    it('throws when the algorithm has been swapped to "none"', () => {
      // Classic JWT "none" attack — make sure we reject it.
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(JSON.stringify(validPayload)).toString('base64url');
      const noneToken = `${header}.${payload}.`;

      expect(() => AuthService.verifyToken(noneToken)).toThrow();
    });
  });
});
