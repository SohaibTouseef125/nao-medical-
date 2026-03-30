# Architecture Note

## Overview

This document explains the architectural decisions made for the Collaborative Docs application, including what was prioritized and why.

## Technology Choices

### Next.js 16 (App Router)
**Why:** Provides a full-stack solution with React on the frontend and API routes on the backend. This eliminates the need for a separate backend service, reducing complexity and deployment overhead.

**Tradeoff:** Less flexibility than a separate backend, but sufficient for this scope.

### SQLite (better-sqlite3)
**Why:** 
- Zero configuration required
- Single file database, easy to include in submission
- Synchronous API simplifies code
- Perfect for demo/prototype scale

**Tradeoff:** Not suitable for production multi-user scenarios, but ideal for this assessment scope.

### Tailwind CSS
**Why:** Rapid UI development with utility classes. No need to write custom CSS for common patterns.

**Tradeoff:** Larger CSS bundle, but acceptable for this use case.

### ContentEditable vs Rich Text Library
**Why ContentEditable:** 
- No external dependencies
- Demonstrates understanding of browser APIs
- Sufficient for basic formatting requirements

**Tradeoff:** Less polished than libraries like TipTap or Slate, but shows fundamental skills.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (React)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Login     │  │  Doc List   │  │   Rich Text Editor  │  │
│  │   Screen    │  │   Sidebar   │  │   + Toolbar         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP Requests
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js API Routes                         │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌───────────┐  │
│  │ /api/auth│  │ /api/docs  │  │ /api/    │  │ /api/     │  │
│  │ /login   │  │            │  │ share    │  │ upload    │  │
│  └──────────┘  └────────────┘  └──────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQL Queries
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SQLite Database                          │
│  ┌──────────┐  ┌────────────┐  ┌──────────────┐            │
│  │  users   │  │ documents  │  │ document_    │            │
│  │          │  │            │  │ shares       │            │
│  └──────────┘  └────────────┘  └──────────────┘            │
│                                                             │
│  ┌──────────┐                                               │
│  │ uploads  │                                               │
│  └──────────┘                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Model

### Users
```sql
users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME
)
```

### Documents
```sql
documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,  -- HTML string
  owner_id TEXT NOT NULL,
  created_at DATETIME,
  updated_at DATETIME
)
```

### Document Shares
```sql
document_shares (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  permission TEXT DEFAULT 'read',
  created_at DATETIME,
  UNIQUE(document_id, user_id)
)
```

### Uploads
```sql
uploads (
  id TEXT PRIMARY KEY,
  document_id TEXT,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  content_type TEXT,
  size INTEGER,
  created_at DATETIME
)
```

## Key Design Decisions

### 1. HTML Storage for Rich Text
Content is stored as HTML strings in the database. This is simple and works well with `contentEditable`.

**Tradeoff:** Not as clean as storing structured data (like ProseMirror documents), but much simpler.

### 2. Auto-save with Debounce
Documents save automatically 1 second after the last change, plus manual save button.

**Why:** Balances data safety with server load. Users don't need to remember to save.

### 3. Demo Authentication
No passwords required. Users login by selecting a demo account.

**Why:** Focus on document features, not auth infrastructure. Clear for reviewers to test.

### 4. File Upload → Document Creation
Uploaded files immediately create new documents with their content.

**Why:** Simplest meaningful integration of file upload into the workflow.

### 5. Sharing by Email
Users share by entering recipient email, not user ID.

**Why:** More realistic UX. Email is how sharing works in real products.

## What Was Prioritized

1. **Working end-to-end flow** - All core features function
2. **Clean code structure** - Separation of concerns (API, DB, UI)
3. **Usable editing experience** - Toolbar, auto-save, visual feedback
4. **Clear sharing model** - Owned vs shared distinction visible
5. **Error handling** - User-facing error messages

## What Was Deprioritized

1. **Real-time collaboration** - Requires WebSockets, complex state sync
2. **Advanced formatting** - Images, tables, code blocks
3. **Document organization** - Folders, tags, search
4. **Production security** - Input sanitization, CSRF, rate limiting
5. **Responsive design** - Desktop-first approach

## Testing Strategy

- Unit tests for database operations
- Integration would test API endpoints (time constraints)
- Manual testing for UI flows

## Deployment Considerations

For production deployment:
1. Replace SQLite with PostgreSQL
2. Add proper authentication (NextAuth, Auth0)
3. Add input sanitization (DOMPurify)
4. Add rate limiting
5. Use object storage for uploads (S3)
6. Add WebSocket server for real-time features

## Conclusion

This architecture prioritizes delivering a working, demonstrable product within the timebox while maintaining code quality and clear separation of concerns. The choices reflect practical tradeoffs suitable for a prototype that could be extended to production.
