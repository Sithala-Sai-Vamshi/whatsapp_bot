import { Intent } from './intent-classifier.service.js';
import { OrderRecord } from '../repositories/orders.repository.js';
import { PolicyService } from './policy.service.js';

export class BusinessRulesService {
  constructor(private readonly policyService: PolicyService) {}

  buildFacts(intent: Intent, order: OrderRecord | null): { facts: string[]; orderId: string | null } {
    const facts: string[] = [];
    let orderId: string | null = null;

    if (intent === 'order_status') {
      if (order) {
        orderId = order.id;
        facts.push(
          `Order number: ${order.order_number}`,
          `Status: ${order.status}`,
          `Payment status: ${order.payment_status}`,
          `Tracking number: ${order.tracking_number ?? 'Not available yet'}`,
          `Courier: ${order.courier_service ?? 'TBD'}`,
          `Estimated delivery: ${order.estimated_delivery ?? 'TBD'}`
        );
      } else {
        facts.push('No order found for this phone number.');
      }
    }

    if (intent === 'return_policy') facts.push(this.policyService.getReturnPolicy());
    if (intent === 'shipping_policy') facts.push(this.policyService.getShippingPolicy());
    if (intent === 'cancel_order') facts.push(this.policyService.getCancellationPolicy());

    return { facts, orderId };
  }
}
