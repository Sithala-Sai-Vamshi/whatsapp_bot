# Rayeva AI WhatsApp Support Bot

Production-oriented TypeScript service for WhatsApp Business Cloud API support automation.

## Features
- WhatsApp webhook verification + signature validation.
- Structured JSON AI outputs validated with Zod.
- Strict separation of business rules from AI generation.
- Real PostgreSQL integration for orders, conversations, messages, escalations, and AI logs.
- Redis-backed context memory + BullMQ async processing.
- Prompt/response logging and escalation audit trail.
- Lightweight frontend in `frontend/` for quick architecture + API health checks.

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
3. Install dependencies and run backend:
   ```bash
   npm install
   npm run dev
   ```
4. Open frontend locally:
   ```bash
   python3 -m http.server 8080
   # then open http://localhost:8080/frontend/index.html
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

### Frontend files
Commit and host `frontend/` files in your GitHub repository (or any static host).

## Database
Run `sql/schema.sql` on PostgreSQL (auto-mounted in docker-compose).
