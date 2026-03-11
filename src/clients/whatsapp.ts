import axios from 'axios';
import { env } from '../config/env.js';

const whatsappApi = axios.create({
  baseURL: `https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_NUMBER_ID}`,
  headers: {
    Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

export async function sendWhatsappText(to: string, body: string): Promise<void> {
  await whatsappApi.post('/messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body }
  });
}
