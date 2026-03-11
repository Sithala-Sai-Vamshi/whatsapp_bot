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


test('github pages artifacts and workflow hardening exist', () => {
  assert.equal(fs.existsSync('docs/index.html'), true);
  const workflow = fs.readFileSync('.github/workflows/pages.yml', 'utf8');
  assert.match(workflow, /FORCE_JAVASCRIPT_ACTIONS_TO_NODE24/);
  assert.match(workflow, /enablement:\s*true/);
  assert.match(workflow, /actions\/checkout@v5/);
=======
test('github pages artifacts exist', () => {
  assert.equal(fs.existsSync('docs/index.html'), true);
  assert.equal(fs.existsSync('.github/workflows/pages.yml'), true);

});

test('structured ai output contract is defined', () => {
  const aiTypes = fs.readFileSync('src/types/ai.ts', 'utf8');
  assert.match(aiTypes, /customer_message/);
  assert.match(aiTypes, /requires_escalation/);
});
