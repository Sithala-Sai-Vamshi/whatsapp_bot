import { EscalationsRepository } from '../repositories/escalations.repository.js';
import { ConversationsRepository } from '../repositories/conversations.repository.js';

export class EscalationService {
  constructor(
    private readonly escalationsRepository: EscalationsRepository,
    private readonly conversationsRepository: ConversationsRepository
  ) {}

  async escalate(conversationId: string, phone: string, reason: string, description: string, orderId: string | null = null): Promise<void> {
    await this.escalationsRepository.create(conversationId, orderId, phone, reason, description);
    await this.conversationsRepository.markEscalated(conversationId, reason);
  }
}
