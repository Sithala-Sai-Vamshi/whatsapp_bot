-- Core schema for Rayeva AI WhatsApp Support Bot
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'support_agent',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_phone VARCHAR(20) NOT NULL,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    order_date TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50),
    tracking_number VARCHAR(100),
    courier_service VARCHAR(100),
    estimated_delivery DATE,
    actual_delivery_date TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    items JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS whatsapp_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp_user_id VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    conversation_id VARCHAR(100),
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active',
    context JSONB,
    detected_intent VARCHAR(50),
    sentiment VARCHAR(20),
    escalated BOOLEAN DEFAULT FALSE,
    escalation_reason TEXT,
    escalated_at TIMESTAMP,
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_whatsapp_conversation_id ON whatsapp_conversations(conversation_id) WHERE conversation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_phone ON whatsapp_conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON whatsapp_conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_escalated ON whatsapp_conversations(escalated) WHERE escalated = true;

CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
    whatsapp_message_id VARCHAR(100) UNIQUE,
    direction VARCHAR(10) NOT NULL,
    message_type VARCHAR(20),
    message_text TEXT,
    media_url VARCHAR(500),
    metadata JSONB,
    ai_processed BOOLEAN DEFAULT FALSE,
    ai_response_generated BOOLEAN DEFAULT FALSE,
    intent_detected VARCHAR(50),
    sent_at TIMESTAMP DEFAULT NOW(),
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON whatsapp_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_direction ON whatsapp_messages(direction);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON whatsapp_messages(sent_at DESC);

CREATE TABLE IF NOT EXISTS escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES whatsapp_conversations(id),
    order_id UUID REFERENCES orders(id),
    reason VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    category VARCHAR(50),
    description TEXT NOT NULL,
    customer_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'open',
    assigned_to UUID REFERENCES users(id),
    assigned_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escalations_status ON escalations(status);
CREATE INDEX IF NOT EXISTS idx_escalations_priority ON escalations(priority);
CREATE INDEX IF NOT EXISTS idx_escalations_assigned_to ON escalations(assigned_to);

CREATE TABLE IF NOT EXISTS whatsapp_ai_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES whatsapp_conversations(id),
    message_id UUID REFERENCES whatsapp_messages(id),
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    prompt_tokens INT,
    completion_tokens INT,
    total_tokens INT,
    latency_ms INT,
    intent VARCHAR(50),
    confidence_score NUMERIC(5,4),
    prompt_excerpt TEXT,
    response_excerpt TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_logs_conversation_id ON whatsapp_ai_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON whatsapp_ai_logs(created_at DESC);

INSERT INTO orders (customer_phone, customer_name, order_number, status, payment_status, total_amount, items, tracking_number, courier_service, estimated_delivery)
VALUES
('+919876543210', 'Rajesh Kumar', 'ORD-2026-001234', 'shipped', 'completed', 1598.00, '[{"name": "Bamboo Lunch Box", "quantity": 2, "price": 799}]', 'DHL1234567890', 'Delhivery', '2026-03-15'),
('+919876543211', 'Priya Sharma', 'ORD-2026-001235', 'delivered', 'completed', 2499.00, '[{"name": "Jute Tote Bag", "quantity": 1, "price": 899}, {"name": "Bamboo Toothbrush Set", "quantity": 2, "price": 299}]', 'DHL0987654321', 'Blue Dart', '2026-03-10'),
('+919876543212', 'Amit Patel', 'ORD-2026-001236', 'processing', 'completed', 799.00, '[{"name": "Steel Water Bottle", "quantity": 1, "price": 799}]', NULL, NULL, '2026-03-18')
ON CONFLICT (order_number) DO NOTHING;
