-- Migration: Fix messages table foreign key
-- Check if table exists (it does, but good practice)
DROP TABLE IF EXISTS messages;

CREATE TABLE messages (
  id integer PRIMARY KEY AUTOINCREMENT,
  conversation_id integer NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  metadata text,
  created_at integer
);

CREATE INDEX messages_conversation_id_idx ON messages(conversation_id);
