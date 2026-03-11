import { pgPool } from '../clients/postgres.js';

export interface OrderRecord {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  tracking_number: string | null;
  courier_service: string | null;
  estimated_delivery: string | null;
  total_amount: string;
  currency: string;
}

export class OrdersRepository {
  async findLatestByPhone(phoneNumber: string): Promise<OrderRecord | null> {
    const { rows } = await pgPool.query<OrderRecord>(
      `SELECT id, order_number, status, payment_status, tracking_number, courier_service, estimated_delivery, total_amount, currency
       FROM orders
       WHERE customer_phone = $1
       ORDER BY order_date DESC
       LIMIT 1`,
      [phoneNumber]
    );

    return rows[0] ?? null;
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderRecord | null> {
    const { rows } = await pgPool.query<OrderRecord>(
      `SELECT id, order_number, status, payment_status, tracking_number, courier_service, estimated_delivery, total_amount, currency
       FROM orders
       WHERE order_number = $1
       LIMIT 1`,
      [orderNumber]
    );

    return rows[0] ?? null;
  }
}
