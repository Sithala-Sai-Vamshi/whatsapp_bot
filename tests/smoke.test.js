import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('project scaffolding exists', () => {
  assert.equal(fs.existsSync('src/server.ts'), true);
  assert.equal(fs.existsSync('sql/schema.sql'), true);
  assert.equal(fs.existsSync('.env.example'), true);
});

test('schema contains required tables', () => {
  const schema = fs.readFileSync('sql/schema.sql', 'utf8');
  for (const table of ['orders', 'whatsapp_conversations', 'whatsapp_messages', 'escalations', 'whatsapp_ai_logs']) {
    assert.match(schema, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  }
});

test('frontend artifacts exist', () => {
  assert.equal(fs.existsSync('frontend/index.html'), true);
  assert.equal(fs.existsSync('frontend/styles.css'), true);
  assert.equal(fs.existsSync('frontend/app.js'), true);
});

test('structured ai output contract is defined', () => {
  const aiTypes = fs.readFileSync('src/types/ai.ts', 'utf8');
  assert.match(aiTypes, /customer_message/);
  assert.match(aiTypes, /requires_escalation/);
});
