import { Request, Response, NextFunction } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';

export const verifyGitHubWebhook = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['x-hub-signature-256'] as string;
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!webhookSecret) {
    // In early development, you can skip validation by not setting this ENV
    console.warn('⚠️ WARN: GITHUB_WEBHOOK_SECRET not set. Skipping validation.');
    return next();
  }

  if (!signature) {
    return res.status(401).json({ message: 'Forbidden: Missing signature' });
  }

  const hmac = createHmac('sha256', webhookSecret);
  const digest = Buffer.from('sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex'), 'utf8');
  const checksum = Buffer.from(signature, 'utf8');

  if (checksum.length !== digest.length || !timingSafeEqual(digest, checksum)) {
    return res.status(401).json({ message: 'Forbidden: Invalid signature' });
  }

  next();
};
