import { redis } from '../clients/redis.js';

const TTL_SECONDS = 60 * 60 * 24;

export class ContextManagerService {
  async getContext(phoneNumber: string): Promise<string[]> {
    const key = `wa:ctx:${phoneNumber}`;
    const raw = await redis.get(key);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  }

  async appendMessage(phoneNumber: string, message: string): Promise<void> {
    const key = `wa:ctx:${phoneNumber}`;
    const current = await this.getContext(phoneNumber);
    const trimmed = [...current, message].slice(-20);
    await redis.set(key, JSON.stringify(trimmed), 'EX', TTL_SECONDS);
  }
}
