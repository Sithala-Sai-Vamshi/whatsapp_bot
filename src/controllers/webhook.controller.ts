import { Request, Response } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { messageQueue } from '../workers/message.queue.js';
import { AppError } from '../utils/errors.js';

const webhookSchema = z.object({
  object: z.string(),
  entry: z.array(
    z.object({
      changes: z.array(
        z.object({
          value: z.object({
            messages: z
              .array(
                z.object({
                  id: z.string(),
                  from: z.string().min(5),
                  type: z.string(),
                  text: z.object({ body: z.string().min(1) }).optional()
                })
              )
              .optional()
          }),
          field: z.string()
        })
      )
    })
  )
});

export function verifyWebhook(req: Request, res: Response): void {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
    return;
  }

  res.status(403).json({ error: 'Verification failed' });
}

export async function receiveWebhook(req: Request, res: Response): Promise<void> {
  const parsed = webhookSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(`Invalid webhook payload: ${parsed.error.issues[0]?.message ?? 'unknown error'}`, 400, 'INVALID_WEBHOOK');
  }

  for (const entry of parsed.data.entry) {
    for (const change of entry.changes) {
      for (const msg of change.value.messages ?? []) {
        if (msg.type === 'text' && msg.text?.body) {
          await messageQueue.add(
            'process-message',
            {
              messageId: msg.id,
              from: msg.from,
              text: msg.text.body
            },
            { attempts: 3, backoff: { type: 'exponential', delay: 500 } }
          );
        }
      }
    }
  }

  res.status(200).json({ status: 'received' });
}
