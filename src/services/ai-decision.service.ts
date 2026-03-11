import { openaiClient } from '../clients/openai.js';
import { env } from '../config/env.js';
import { SUPPORT_SYSTEM_PROMPT } from '../prompts/system.js';
import { aiResponseSchema, StructuredAiResponse } from '../types/ai.js';

export interface AiReply {
  payload: StructuredAiResponse;
  latencyMs: number;
  rawResponse: string;
  renderedPrompt: string;
}

export class AiDecisionService {
  async generateReply(params: {
    intent: string;
    userMessage: string;
    context: string[];
    facts: string[];
  }): Promise<AiReply> {
    const { intent, userMessage, context, facts } = params;
    const startedAt = Date.now();
    const renderedPrompt = `Intent: ${intent}\nKnown facts:\n${facts.join('\n') || 'None'}\nConversation context:\n${context.join('\n') || 'No history'}`;

    const completion = await openaiClient.chat.completions.create({
      model: env.OPENAI_MODEL,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SUPPORT_SYSTEM_PROMPT },
        { role: 'system', content: renderedPrompt },
        { role: 'user', content: userMessage }
      ]
    });

    const rawResponse = completion.choices[0]?.message?.content?.trim() || '{}';
    const parsedJson = JSON.parse(rawResponse);
    const payload = aiResponseSchema.parse(parsedJson);

    return {
      payload,
      latencyMs: Date.now() - startedAt,
      rawResponse,
      renderedPrompt
    };
  }
}
