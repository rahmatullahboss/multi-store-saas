-- Admin Audit Logs table - Track all Super Admin actions
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id INTEGER,
  target_name TEXT,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS audit_logs_admin_idx ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_target_idx ON admin_audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS audit_logs_date_idx ON admin_audit_logs(created_at);

-- Admin Roles table - Role-Based Access Control
CREATE TABLE IF NOT EXISTS admin_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  permissions TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS admin_roles_user_idx ON admin_roles(user_id);

-- Store Tags table - Tagging system for stores
CREATE TABLE IF NOT EXISTS store_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  note TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS store_tags_store_idx ON store_tags(store_id);
CREATE INDEX IF NOT EXISTS store_tags_tag_idx ON store_tags(tag);
