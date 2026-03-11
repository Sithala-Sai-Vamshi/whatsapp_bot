import { AiLogsRepository } from '../repositories/ai-logs.repository.js';
import { ConversationsRepository } from '../repositories/conversations.repository.js';
import { EscalationsRepository } from '../repositories/escalations.repository.js';
import { MessagesRepository } from '../repositories/messages.repository.js';
import { OrdersRepository } from '../repositories/orders.repository.js';
import { AiDecisionService } from '../services/ai-decision.service.js';
import { BusinessRulesService } from '../services/business-rules.service.js';
import { ContextManagerService } from '../services/context-manager.service.js';
import { EscalationService } from '../services/escalation.service.js';
import { IntentClassifierService } from '../services/intent-classifier.service.js';
import { MessageProcessorService } from '../services/message-processor.service.js';
import { PolicyService } from '../services/policy.service.js';

export function buildMessageProcessor(): MessageProcessorService {
  const conversationsRepository = new ConversationsRepository();
  const escalationsRepository = new EscalationsRepository();
  const messagesRepository = new MessagesRepository();
  const ordersRepository = new OrdersRepository();
  const intentClassifierService = new IntentClassifierService();
  const contextManager = new ContextManagerService();
  const aiDecisionService = new AiDecisionService();
  const policyService = new PolicyService();
  const businessRulesService = new BusinessRulesService(policyService);
  const escalationService = new EscalationService(escalationsRepository, conversationsRepository);
  const aiLogsRepository = new AiLogsRepository();

  return new MessageProcessorService(
    conversationsRepository,
    messagesRepository,
    ordersRepository,
    intentClassifierService,
    contextManager,
    aiDecisionService,
    businessRulesService,
    escalationService,
    aiLogsRepository
  );
}
