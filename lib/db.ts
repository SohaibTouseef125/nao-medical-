import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Initialize schema
export async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL DEFAULT 'Untitled Document',
        content TEXT DEFAULT '',
        owner_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES users(id)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS document_shares (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        permission TEXT DEFAULT 'read',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
        CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(document_id, user_id)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS uploads (
        id TEXT PRIMARY KEY,
        document_id TEXT,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        content_type TEXT,
        size INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_upload_doc FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL
      );
    `;
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

export async function getUserById(id: string) {
  const result = await sql`SELECT * FROM users WHERE id = ${id}`;
  return result[0] || null;
}

export async function getUserByEmail(email: string) {
  const result = await sql`SELECT * FROM users WHERE email = ${email}`;
  return result[0] || null;
}

export async function createUser(id: string, email: string, name: string) {
  const result = await sql`
    INSERT INTO users (id, email, name) 
    VALUES (${id}, ${email}, ${name}) 
    RETURNING *
  `;
  return result[0];
}

export async function getAllUsers() {
  return await sql`SELECT id, email, name FROM users`;
}

export async function createDocument(id: string, title: string, ownerId: string, content = '') {
  const result = await sql`
    INSERT INTO documents (id, title, content, owner_id) 
    VALUES (${id}, ${title}, ${content}, ${ownerId}) 
    RETURNING *
  `;
  return result[0];
}

export async function getDocumentById(id: string) {
  const result = await sql`SELECT * FROM documents WHERE id = ${id}`;
  return result[0] || null;
}

export async function updateDocument(id: string, updates: { title?: string; content?: string }) {
  if (updates.title !== undefined && updates.content !== undefined) {
    return await sql`
      UPDATE documents 
      SET title = ${updates.title}, content = ${updates.content}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id} 
      RETURNING *
    `;
  } else if (updates.title !== undefined) {
    return await sql`
      UPDATE documents 
      SET title = ${updates.title}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id} 
      RETURNING *
    `;
  } else if (updates.content !== undefined) {
    return await sql`
      UPDATE documents 
      SET content = ${updates.content}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id} 
      RETURNING *
    `;
  }
}

export async function deleteDocument(id: string) {
  return await sql`DELETE FROM documents WHERE id = ${id}`;
}

export async function getDocumentsByOwner(ownerId: string) {
  return await sql`
    SELECT * FROM documents 
    WHERE owner_id = ${ownerId} 
    ORDER BY updated_at DESC
  `;
}

export async function getSharedDocuments(userId: string) {
  return await sql`
    SELECT d.*, u.name as owner_name, ds.permission
    FROM documents d
    JOIN document_shares ds ON d.id = ds.document_id
    JOIN users u ON d.owner_id = u.id
    WHERE ds.user_id = ${userId}
    ORDER BY d.updated_at DESC
  `;
}

export async function shareDocument(shareId: string, documentId: string, userId: string, permission = 'read') {
  return await sql`
    INSERT INTO document_shares (id, document_id, user_id, permission) 
    VALUES (${shareId}, ${documentId}, ${userId}, ${permission})
    ON CONFLICT (document_id, user_id) 
    DO UPDATE SET permission = EXCLUDED.permission
    RETURNING *
  `;
}

export async function removeShare(documentId: string, userId: string) {
  return await sql`
    DELETE FROM document_shares 
    WHERE document_id = ${documentId} AND user_id = ${userId}
  `;
}

export async function getDocumentShares(documentId: string) {
  return await sql`
    SELECT ds.*, u.email, u.name
    FROM document_shares ds
    JOIN users u ON ds.user_id = u.id
    WHERE ds.document_id = ${documentId}
  `;
}

export async function canAccessDocument(documentId: string, userId: string): Promise<boolean> {
  const doc = await getDocumentById(documentId);
  if (!doc) return false;
  if (doc.owner_id === userId) return true;
  
  const shares = await sql`
    SELECT * FROM document_shares 
    WHERE document_id = ${documentId} AND user_id = ${userId}
  `;
  return shares.length > 0;
}

export async function createUpload(id: string, documentId: string | null, filename: string, originalName: string, contentType: string, size: number) {
  const result = await sql`
    INSERT INTO uploads (id, document_id, filename, original_name, content_type, size) 
    VALUES (${id}, ${documentId}, ${filename}, ${originalName}, ${contentType}, ${size}) 
    RETURNING *
  `;
  return result[0];
}

export async function getUploadById(id: string) {
  const result = await sql`SELECT * FROM uploads WHERE id = ${id}`;
  return result[0] || null;
}

export async function getUploadsByDocument(documentId: string) {
  return await sql`SELECT * FROM uploads WHERE document_id = ${documentId}`;
}
