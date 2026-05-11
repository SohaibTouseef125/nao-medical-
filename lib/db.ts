import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'app.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'Untitled Document',
    content TEXT DEFAULT '',
    owner_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS document_shares (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    permission TEXT DEFAULT 'read',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(document_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS uploads (
    id TEXT PRIMARY KEY,
    document_id TEXT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    content_type TEXT,
    size INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL
  );
`);

export default db;

// Helper functions
export function initDatabase() {
  // Database initialization logic if needed
  console.log('Database initialized');
}

export function getUserById(id: string) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
}

export function getUserByEmail(email: string) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
}

export function createUser(id: string, email: string, name: string) {
  const stmt = db.prepare('INSERT INTO users (id, email, name) VALUES (?, ?, ?)');
  stmt.run(id, email, name);
  return { id, email, name };
}

export function getAllUsers() {
  return db.prepare('SELECT id, email, name FROM users').all() as any[];
}

export function createDocument(id: string, title: string, ownerId: string, content = '') {
  const stmt = db.prepare('INSERT INTO documents (id, title, content, owner_id) VALUES (?, ?, ?, ?)');
  return stmt.run(id, title, content, ownerId);
}

export function getDocumentById(id: string) {
  return db.prepare('SELECT * FROM documents WHERE id = ?').get(id) as any;
}

export function updateDocument(id: string, updates: { title?: string; content?: string }) {
  const fields: string[] = [];
  const values: any[] = [];
  
  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.content !== undefined) {
    fields.push('content = ?');
    values.push(updates.content);
  }
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  const stmt = db.prepare(`UPDATE documents SET ${fields.join(', ')} WHERE id = ?`);
  return stmt.run(...values);
}

export function deleteDocument(id: string) {
  return db.prepare('DELETE FROM documents WHERE id = ?').run(id);
}

export function getDocumentsByOwner(ownerId: string) {
  return db.prepare('SELECT * FROM documents WHERE owner_id = ? ORDER BY updated_at DESC').all(ownerId) as any[];
}

export function getSharedDocuments(userId: string) {
  return db.prepare(`
    SELECT d.*, u.name as owner_name, ds.permission
    FROM documents d
    JOIN document_shares ds ON d.id = ds.document_id
    JOIN users u ON d.owner_id = u.id
    WHERE ds.user_id = ?
    ORDER BY d.updated_at DESC
  `).all(userId) as any[];
}

export function shareDocument(shareId: string, documentId: string, userId: string, permission = 'read') {
  const stmt = db.prepare('INSERT OR REPLACE INTO document_shares (id, document_id, user_id, permission) VALUES (?, ?, ?, ?)');
  return stmt.run(shareId, documentId, userId, permission);
}

export function removeShare(documentId: string, userId: string) {
  return db.prepare('DELETE FROM document_shares WHERE document_id = ? AND user_id = ?').run(documentId, userId);
}

export function getDocumentShares(documentId: string) {
  return db.prepare(`
    SELECT ds.*, u.email, u.name
    FROM document_shares ds
    JOIN users u ON ds.user_id = u.id
    WHERE ds.document_id = ?
  `).all(documentId) as any[];
}

export function canAccessDocument(documentId: string, userId: string): boolean {
  const doc = getDocumentById(documentId);
  if (!doc) return false;
  if (doc.owner_id === userId) return true;
  
  const share = db.prepare('SELECT * FROM document_shares WHERE document_id = ? AND user_id = ?').get(documentId, userId);
  return !!share;
}

export function createUpload(id: string, documentId: string | null, filename: string, originalName: string, contentType: string, size: number) {
  const stmt = db.prepare('INSERT INTO uploads (id, document_id, filename, original_name, content_type, size) VALUES (?, ?, ?, ?, ?, ?)');
  return stmt.run(id, documentId, filename, originalName, contentType, size);
}

export function getUploadById(id: string) {
  return db.prepare('SELECT * FROM uploads WHERE id = ?').get(id) as any;
}

export function getUploadsByDocument(documentId: string) {
  return db.prepare('SELECT * FROM uploads WHERE document_id = ?').all(documentId) as any[];
}
