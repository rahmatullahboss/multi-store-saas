-- Migration: Student Documents
-- Date: 2026-02-15
-- Description: Persist student portal document uploads for merchant/admin management

CREATE TABLE IF NOT EXISTS student_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  file_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  document_type TEXT DEFAULT 'other',
  status TEXT DEFAULT 'uploaded' CHECK(status IN ('uploaded', 'reviewed', 'approved', 'rejected')),
  notes TEXT,
  reviewed_by INTEGER,
  reviewed_at INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),

  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_student_documents_store ON student_documents(store_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_customer ON student_documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_type ON student_documents(store_id, document_type);
CREATE INDEX IF NOT EXISTS idx_student_documents_status ON student_documents(store_id, status);
CREATE INDEX IF NOT EXISTS idx_student_documents_created ON student_documents(store_id, created_at DESC);
