# Rayeva AI WhatsApp Support Bot

Production-oriented TypeScript service for WhatsApp Business Cloud API support automation.

## Features
- WhatsApp webhook verification + signature validation.
- Structured JSON AI outputs validated with Zod.
- Strict separation of business rules from AI generation.
- Real PostgreSQL integration for orders, conversations, messages, escalations, and AI logs.
- Redis-backed context memory + BullMQ async processing.
- Prompt/response logging and escalation audit trail.

## Architecture
```text
WhatsApp Cloud API
  -> Express Webhook Receiver (validation + signature)
  -> BullMQ Queue
  -> Message Processor
      -> Intent Classifier
      -> Business Rules Service (order/policy grounding)
      -> AI Decision Service (JSON contract)
      -> Escalation Service
  -> WhatsApp Response Sender

Data Stores:
- PostgreSQL: orders + conversation/message/escalation/AI logs
- Redis: short-term conversation context
```

## Quick Start
1. Copy env file:
   ```bash
   cp .env.example .env
   ```
2. Start local infra:
   ```bash
   docker compose up -d postgres redis
   ```
3. Install dependencies and run:
   ```bash
   npm install
   npm run dev
   ```

## Webhooks
- Verify endpoint: `GET /webhooks/whatsapp`
- Receive endpoint: `POST /webhooks/whatsapp`

Use ngrok for local Meta webhook registration:
```bash
ngrok http 3000
```

## Deployment
### Backend service
Deploy the Node.js service to any container host (Render, Railway, Fly.io, VM, ECS, etc.).

### GitHub Pages (Architecture Site)
A static architecture page is included in `docs/index.html` and auto-deployed by `.github/workflows/pages.yml`.

## Database
Run `sql/schema.sql` on PostgreSQL (auto-mounted in docker-compose).

## Metrics Alignment
- Fast response path with queue worker + Redis context.
- Full interaction logging (`whatsapp_conversations`, `whatsapp_messages`, `whatsapp_ai_logs`).
- Structured escalation records in `escalations`.
