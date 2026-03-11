import { pgPool } from '../clients/postgres.js';

export class EscalationsRepository {
  async create(conversationId: string, orderId: string | null, phone: string, reason: string, description: string): Promise<void> {
    await pgPool.query(
      `INSERT INTO escalations (conversation_id, order_id, reason, priority, category, description, customer_phone)
       VALUES ($1, $2, $3, 'high', 'general', $4, $5)`,
      [conversationId, orderId, reason, description, phone]
    );
  }
}
