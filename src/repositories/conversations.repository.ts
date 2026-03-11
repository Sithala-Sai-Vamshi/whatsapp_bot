import { v4 as uuidv4 } from 'uuid';
import { pgPool } from '../clients/postgres.js';

export interface ConversationRecord {
  id: string;
  phone_number: string;
  status: string;
  context: Record<string, unknown> | null;
  escalated: boolean;
}

export class ConversationsRepository {
  async upsertActiveConversation(phoneNumber: string, userId: string): Promise<ConversationRecord> {
    const existing = await pgPool.query<ConversationRecord>(
      `SELECT id, phone_number, status, context, escalated
       FROM whatsapp_conversations
       WHERE phone_number = $1 AND status IN ('active', 'escalated')
       ORDER BY started_at DESC
       LIMIT 1`,
      [phoneNumber]
    );

    if (existing.rows[0]) return existing.rows[0];

    const { rows } = await pgPool.query<ConversationRecord>(
      `INSERT INTO whatsapp_conversations (conversation_id, whatsapp_user_id, phone_number, status, context)
       VALUES ($1, $2, $3, 'active', '{}'::jsonb)
       RETURNING id, phone_number, status, context, escalated`,
      [uuidv4(), userId, phoneNumber]
    );

    return rows[0];
  }

  async markEscalated(conversationId: string, reason: string): Promise<void> {
    await pgPool.query(
      `UPDATE whatsapp_conversations
       SET escalated = true, status = 'escalated', escalation_reason = $2, escalated_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [conversationId, reason]
    );
  }
}
