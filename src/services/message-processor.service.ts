import { sendWhatsappText } from '../clients/whatsapp.js';
import { env } from '../config/env.js';
import { AiLogsRepository } from '../repositories/ai-logs.repository.js';
import { ConversationsRepository } from '../repositories/conversations.repository.js';
import { MessagesRepository } from '../repositories/messages.repository.js';
import { OrdersRepository } from '../repositories/orders.repository.js';
import { logger } from '../utils/logger.js';
import { AiDecisionService } from './ai-decision.service.js';
import { BusinessRulesService } from './business-rules.service.js';
import { ContextManagerService } from './context-manager.service.js';
import { EscalationService } from './escalation.service.js';
import { IntentClassifierService } from './intent-classifier.service.js';

export class MessageProcessorService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository,
    private readonly messagesRepository: MessagesRepository,
    private readonly ordersRepository: OrdersRepository,
    private readonly intentClassifierService: IntentClassifierService,
    private readonly contextManager: ContextManagerService,
    private readonly aiDecisionService: AiDecisionService,
    private readonly businessRulesService: BusinessRulesService,
    private readonly escalationService: EscalationService,
    private readonly aiLogsRepository: AiLogsRepository
  ) {}

  async processMessage(messageId: string, phoneNumber: string, userText: string): Promise<void> {
    const conversation = await this.conversationsRepository.upsertActiveConversation(phoneNumber, phoneNumber);
    const storedMessageId = await this.messagesRepository.createInbound(conversation.id, messageId, userText);
    const intent = this.intentClassifierService.classify(userText);

    const context = await this.contextManager.getContext(phoneNumber);
    const order = intent === 'order_status' ? await this.ordersRepository.findLatestByPhone(phoneNumber) : null;
    const { facts, orderId } = this.businessRulesService.buildFacts(intent, order);

    const forceEscalation = intent === 'escalation';

    try {
      if (forceEscalation) {
        await this.handleEscalation(conversation.id, phoneNumber, userText, storedMessageId, orderId, 'rule_based_trigger');
        return;
      }

      const ai = await this.aiDecisionService.generateReply({ intent, userMessage: userText, context, facts });
      const finalReply = ai.payload.follow_up_question
        ? `${ai.payload.customer_message}\n\n${ai.payload.follow_up_question}`
        : ai.payload.customer_message;

      if (ai.payload.requires_escalation) {
        await this.handleEscalation(
          conversation.id,
          phoneNumber,
          userText,
          storedMessageId,
          orderId,
          ai.payload.escalation_reason ?? 'ai_escalation'
        );
      } else {
        await sendWhatsappText(phoneNumber, finalReply);
        await this.messagesRepository.createOutbound(conversation.id, finalReply);
        await this.messagesRepository.markAiProcessed(storedMessageId, intent);
      }

      await this.aiLogsRepository.create({
        conversationId: conversation.id,
        messageId: storedMessageId,
        provider: 'openai',
        model: env.OPENAI_MODEL,
        intent,
        promptExcerpt: ai.renderedPrompt.slice(0, 500),
        responseExcerpt: ai.rawResponse.slice(0, 500),
        latencyMs: ai.latencyMs
      });

      await this.contextManager.appendMessage(phoneNumber, `Customer: ${userText}`);
      await this.contextManager.appendMessage(phoneNumber, `Bot: ${finalReply}`);
      logger.info({ phoneNumber, intent }, 'Message processed successfully');
    } catch (error) {
      logger.error({ error, phoneNumber }, 'Message processing failed');
      const fallback = 'Sorry, I am having trouble right now. I have escalated this to our support team.';
      await this.handleEscalation(conversation.id, phoneNumber, userText, storedMessageId, orderId, 'system_error', fallback);
    }
  }

  private async handleEscalation(
    conversationId: string,
    phoneNumber: string,
    userText: string,
    storedMessageId: string,
    orderId: string | null,
    reason: string,
    message = 'I understand your concern. I have escalated this conversation to our human support team. You will hear from us shortly.'
  ): Promise<void> {
    await this.escalationService.escalate(conversationId, phoneNumber, reason, userText, orderId);
    await sendWhatsappText(phoneNumber, message);
    await this.messagesRepository.createOutbound(conversationId, message);
    await this.messagesRepository.markAiProcessed(storedMessageId, 'escalation');
    await this.contextManager.appendMessage(phoneNumber, `Customer: ${userText}`);
    await this.contextManager.appendMessage(phoneNumber, `Bot: ${message}`);
  }
}
