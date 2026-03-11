import { pgPool } from '../clients/postgres.js';

export class AiLogsRepository {
  async create(params: {
    conversationId: string;
    messageId: string;
    provider: string;
    model: string;
    intent: string;
    promptExcerpt: string;
    responseExcerpt: string;
    latencyMs: number;
  }): Promise<void> {
    await pgPool.query(
      `INSERT INTO whatsapp_ai_logs
      (conversation_id, message_id, provider, model, intent, prompt_excerpt, response_excerpt, latency_ms)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        params.conversationId,
        params.messageId,
        params.provider,
        params.model,
        params.intent,
        params.promptExcerpt,
        params.responseExcerpt,
        params.latencyMs
      ]
    );
  }
}
