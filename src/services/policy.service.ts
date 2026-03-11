export class PolicyService {
  getReturnPolicy(): string {
    return 'Return policy: Items can be returned within 7 days if unused and in original packaging. Refunds are issued to original payment method in 5-7 business days after quality check.';
  }

  getShippingPolicy(): string {
    return 'Shipping policy: Orders are processed in 24-48 hours. Standard delivery takes 3-7 business days based on location. Tracking updates are shared once shipped.';
  }

  getCancellationPolicy(): string {
    return 'Cancellation policy: You can cancel orders before shipment. Once shipped, use return flow after delivery.';
  }
}
