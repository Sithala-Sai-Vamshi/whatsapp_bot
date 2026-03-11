export interface IncomingWhatsappMessage {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body: string };
}

export interface WebhookEntry {
  changes: Array<{
    value: {
      messaging_product: string;
      metadata: { display_phone_number: string; phone_number_id: string };
      contacts?: Array<{ wa_id: string; profile: { name: string } }>;
      messages?: IncomingWhatsappMessage[];
    };
    field: string;
  }>;
}

export interface WebhookPayload {
  object: string;
  entry: WebhookEntry[];
}
