CREATE TABLE IF NOT EXISTS policy_versions (
  id TEXT PRIMARY KEY,
  store_id INTEGER NOT NULL,
  version INTEGER NOT NULL,
  label TEXT,
  policies_json TEXT NOT NULL,
  changed_by TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS policy_versions_store_id_idx ON policy_versions(store_id);
CREATE INDEX IF NOT EXISTS policy_versions_store_version_idx ON policy_versions(store_id, version);
