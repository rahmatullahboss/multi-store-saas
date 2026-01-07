-- AI Agent Activation Request System
ALTER TABLE stores ADD COLUMN ai_agent_request_status TEXT DEFAULT 'none';
ALTER TABLE stores ADD COLUMN ai_agent_requested_at INTEGER;
