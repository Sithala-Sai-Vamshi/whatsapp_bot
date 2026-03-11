import express, { Request, Response } from 'express';
import pinoHttp from 'pino-http';
import { webhookRouter } from './routes/webhook.routes.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/error-handler.js';

export const app = express();

app.use(
  express.json({
    verify: (req: Request, _res: Response, buf: Buffer) => {
      req.rawBody = buf.toString();
    }
  })
);
app.use(pinoHttp({ logger }));

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/webhooks', webhookRouter);
app.use(errorHandler);
