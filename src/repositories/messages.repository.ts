import { pgPool } from '../clients/postgres.js';

export class MessagesRepository {
  async createInbound(conversationId: string, whatsappMessageId: string, messageText: string): Promise<string> {
    const { rows } = await pgPool.query<{ id: string }>(
      `INSERT INTO whatsapp_messages (conversation_id, whatsapp_message_id, direction, message_type, message_text, ai_processed)
       VALUES ($1, $2, 'inbound', 'text', $3, false)
       RETURNING id`,
      [conversationId, whatsappMessageId, messageText]
    );

    return rows[0].id;
  }

  async createOutbound(conversationId: string, messageText: string): Promise<void> {
    await pgPool.query(
      `INSERT INTO whatsapp_messages (conversation_id, direction, message_type, message_text, ai_response_generated)
       VALUES ($1, 'outbound', 'text', $2, true)`,
      [conversationId, messageText]
    );
  }

  async markAiProcessed(messageId: string, intent: string): Promise<void> {
    await pgPool.query(
      `UPDATE whatsapp_messages
       SET ai_processed = true, intent_detected = $2
       WHERE id = $1`,
      [messageId, intent]
    );
  }
}
