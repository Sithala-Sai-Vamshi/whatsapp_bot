import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export function verifyWhatsappSignature(req: Request, res: Response, next: NextFunction): void {
  if (!env.ENABLE_SIGNATURE_VALIDATION) {
    next();
    return;
  }

  const signature = req.header('x-hub-signature-256');
  if (!signature) {
    res.status(401).json({ error: 'Missing signature' });
    return;
  }

  const expected = `sha256=${crypto.createHmac('sha256', env.WHATSAPP_APP_SECRET).update(req.rawBody).digest('hex')}`;

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  next();
}
