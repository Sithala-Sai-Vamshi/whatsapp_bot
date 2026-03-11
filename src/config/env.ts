import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  WHATSAPP_ACCESS_TOKEN: z.string().min(1),
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1),
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: z.string().min(1),
  WHATSAPP_APP_SECRET: z.string().min(1),
  ENABLE_SIGNATURE_VALIDATION: z.coerce.boolean().default(true),
  ESCALATION_KEYWORDS: z.string().default('refund,angry,cancel,legal,complaint,manager')
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment: ${parsed.error.message}`);
}

export const env = parsed.data;
export const escalationKeywords = env.ESCALATION_KEYWORDS.split(',').map((k) => k.trim().toLowerCase());
