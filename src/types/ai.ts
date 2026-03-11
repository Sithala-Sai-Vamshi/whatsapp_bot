import { z } from 'zod';

export const aiResponseSchema = z.object({
  customer_message: z.string().min(1),
  confidence: z.number().min(0).max(1),
  requires_escalation: z.boolean(),
  escalation_reason: z.string().nullable(),
  follow_up_question: z.string().nullable(),
  cited_facts: z.array(z.string()).default([])
});

export type StructuredAiResponse = z.infer<typeof aiResponseSchema>;
