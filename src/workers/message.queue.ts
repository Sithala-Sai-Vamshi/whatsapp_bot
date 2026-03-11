import { Queue, Worker } from 'bullmq';
import { redis } from '../clients/redis.js';
import { logger } from '../utils/logger.js';
import { buildMessageProcessor } from '../workers/service-factory.js';

export interface MessageJobData {
  messageId: string;
  from: string;
  text: string;
}

export const messageQueue = new Queue<MessageJobData>('whatsapp-messages', {
  connection: redis
});

export const messageWorker = new Worker<MessageJobData>(
  'whatsapp-messages',
  async (job) => {
    const processor = buildMessageProcessor();
    await processor.processMessage(job.data.messageId, job.data.from, job.data.text);
  },
  { connection: redis, concurrency: 10 }
);

messageWorker.on('failed', (job, error) => {
  logger.error({ jobId: job?.id, error }, 'Message worker failed');
});
