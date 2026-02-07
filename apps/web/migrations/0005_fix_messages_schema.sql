-- Migration: Fix messages table to match schema.ts
-- Drop old table and recreate with correct schema

DROP TABLE IF EXISTS messages;

CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Function calls (if AI called a tool)
  function_name TEXT,
  function_args TEXT,
  function_result TEXT,
  
  -- Metadata
  tokens_used INTEGER,
  credits_used INTEGER DEFAULT 1,
  
  created_at INTEGER
);

CREATE INDEX messages_conversation_idx ON messages(conversation_id);
