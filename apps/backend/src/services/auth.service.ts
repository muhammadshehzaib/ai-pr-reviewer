import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-jwt-secret-change-me-in-prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthTokenPayload {
  userId: string;
  githubId: string;
}

export class AuthService {
  static issueToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  }

  static verifyToken(token: string): AuthTokenPayload {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  }
}
