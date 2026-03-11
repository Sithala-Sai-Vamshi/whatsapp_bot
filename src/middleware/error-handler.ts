import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }

  logger.error({ err }, 'Unhandled request error');
  res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
}
