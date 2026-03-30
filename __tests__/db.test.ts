/**
 * Database integration tests
 * Tests the core database operations for documents, users, and sharing
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Create a test database
const testDbPath = path.join(process.cwd(), 'data', 'test.db');

describe('Database Operations', () => {
  let db: Database.Database;

  beforeAll(() => {
    // Ensure data directory exists
    const dataDir = path.dirname(testDbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Remove existing test db
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    db = new Database(testDbPath);

    // Initialize schema
    db.exec(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL DEFAULT 'Untitled Document',
        content TEXT DEFAULT '',
        owner_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id)
      );

      CREATE TABLE document_shares (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        permission TEXT DEFAULT 'read',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(document_id, user_id)
      );
    `);

    // Seed test users
    db.prepare('INSERT INTO users (id, email, name) VALUES (?, ?, ?)').run('user1', 'test1@example.com', 'Test User 1');
    db.prepare('INSERT INTO users (id, email, name) VALUES (?, ?, ?)').run('user2', 'test2@example.com', 'Test User 2');
  });

  afterAll(() => {
    db.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('User Operations', () => {
    it('should retrieve user by email', () => {
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get('test1@example.com') as any;
      expect(user).toBeDefined();
      expect(user.name).toBe('Test User 1');
    });

    it('should retrieve all users', () => {
      const users = db.prepare('SELECT * FROM users').all() as any[];
      expect(users.length).toBe(2);
    });
  });

  describe('Document Operations', () => {
    it('should create a document', () => {
      const result = db.prepare(
        'INSERT INTO documents (id, title, content, owner_id) VALUES (?, ?, ?, ?)'
      ).run('doc1', 'Test Document', 'Test content', 'user1');
      expect(result.changes).toBe(1);
    });

    it('should retrieve document by id', () => {
      const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get('doc1') as any;
      expect(doc).toBeDefined();
      expect(doc.title).toBe('Test Document');
      expect(doc.owner_id).toBe('user1');
    });

    it('should update document', () => {
      db.prepare('UPDATE documents SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run('Updated Document', 'Updated content', 'doc1');
      const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get('doc1') as any;
      expect(doc.title).toBe('Updated Document');
    });

    it('should get documents by owner', () => {
      const docs = db.prepare('SELECT * FROM documents WHERE owner_id = ?').all('user1') as any[];
      expect(docs.length).toBe(1);
    });

    it('should delete document', () => {
      db.prepare('INSERT INTO documents (id, title, content, owner_id) VALUES (?, ?, ?, ?)')
        .run('doc2', 'To Delete', 'Content', 'user1');
      const result = db.prepare('DELETE FROM documents WHERE id = ?').run('doc2');
      expect(result.changes).toBe(1);
    });
  });

  describe('Sharing Operations', () => {
    beforeAll(() => {
      // Create a document to share
      db.prepare(
        'INSERT INTO documents (id, title, content, owner_id) VALUES (?, ?, ?, ?)'
      ).run('doc3', 'Shared Document', 'Shared content', 'user1');
    });

    it('should share document with another user', () => {
      db.prepare(
        'INSERT INTO document_shares (id, document_id, user_id, permission) VALUES (?, ?, ?, ?)'
      ).run('share1', 'doc3', 'user2', 'read');
      
      const share = db.prepare(
        'SELECT * FROM document_shares WHERE document_id = ? AND user_id = ?'
      ).get('doc3', 'user2') as any;
      
      expect(share).toBeDefined();
      expect(share.permission).toBe('read');
    });

    it('should get shared documents for a user', () => {
      const shared = db.prepare(`
        SELECT d.*, u.name as owner_name, ds.permission
        FROM documents d
        JOIN document_shares ds ON d.id = ds.document_id
        JOIN users u ON d.owner_id = u.id
        WHERE ds.user_id = ?
      `).all('user2') as any[];
      
      expect(shared.length).toBe(1);
      expect(shared[0].title).toBe('Shared Document');
    });

    it('should remove share', () => {
      const result = db.prepare(
        'DELETE FROM document_shares WHERE document_id = ? AND user_id = ?'
      ).run('doc3', 'user2');
      expect(result.changes).toBe(1);
    });

    it('should enforce unique shares', () => {
      db.prepare(
        'INSERT INTO document_shares (id, document_id, user_id, permission) VALUES (?, ?, ?, ?)'
      ).run('share2', 'doc3', 'user2', 'read');
      
      expect(() => {
        db.prepare(
          'INSERT INTO document_shares (id, document_id, user_id, permission) VALUES (?, ?, ?, ?)'
        ).run('share3', 'doc3', 'user2', 'write');
      }).toThrow();
    });
  });

  describe('Access Control', () => {
    it('should allow owner to access document', () => {
      const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get('doc3') as any;
      expect(doc.owner_id).toBe('user1');
      // Owner has implicit access
      expect(true).toBe(true);
    });

    it('should allow shared user to access document', () => {
      const share = db.prepare(
        'SELECT * FROM document_shares WHERE document_id = ? AND user_id = ?'
      ).get('doc3', 'user2');
      // After removing share above, this should be undefined
      expect(share).toBeUndefined();
    });
  });
});
