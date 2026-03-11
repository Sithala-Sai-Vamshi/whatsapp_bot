import { Router } from 'express';
import { receiveWebhook, verifyWebhook } from '../controllers/webhook.controller.js';
import { verifyWhatsappSignature } from '../middleware/verify-signature.js';
import { asyncHandler } from '../utils/async-handler.js';

export const webhookRouter = Router();

webhookRouter.get('/whatsapp', verifyWebhook);
webhookRouter.post('/whatsapp', verifyWhatsappSignature, asyncHandler(receiveWebhook));
