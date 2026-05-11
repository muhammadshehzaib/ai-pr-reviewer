import { Request, Response, NextFunction } from 'express';
import { AuthService, AuthTokenPayload } from '../services/auth.service';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthTokenPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const cookieToken = req.cookies?.auth_token;
  const headerToken = (() => {
    const h = req.headers.authorization;
    if (h && h.startsWith('Bearer ')) return h.slice(7);
    return undefined;
  })();
  const token = cookieToken || headerToken;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: missing credentials' });
  }

  try {
    req.auth = AuthService.verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized: invalid token' });
  }
};
