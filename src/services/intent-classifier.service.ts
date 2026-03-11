import { escalationKeywords } from '../config/env.js';

export type Intent = 'order_status' | 'return_policy' | 'shipping_policy' | 'cancel_order' | 'general_query' | 'escalation';

export class IntentClassifierService {
  classify(message: string): Intent {
    const text = message.toLowerCase();

    if (escalationKeywords.some((keyword) => text.includes(keyword))) return 'escalation';
    if (text.includes('order') || text.includes('status') || text.includes('track')) return 'order_status';
    if (text.includes('return') || text.includes('refund')) return 'return_policy';
    if (text.includes('shipping') || text.includes('delivery')) return 'shipping_policy';
    if (text.includes('cancel')) return 'cancel_order';

    return 'general_query';
  }
}
