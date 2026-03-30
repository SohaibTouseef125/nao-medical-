# Collaborative Docs - Nao Medical Assessment

A lightweight collaborative document editor built for the Nao Medical Full Stack Developer assessment.

## Features

### ✅ Implemented
- **Document Creation & Editing**
  - Create new documents
  - Rename documents
  - Rich text editing with toolbar
  - Auto-save functionality
  - Formatting: Bold, Italic, Underline, Headings (H1-H3), Bullet/Numbered lists

- **File Upload**
  - Upload `.txt` and `.md` files
  - Import file content into new documents
  - Max file size: 5MB

- **Sharing**
  - Share documents with other users by email
  - View shared documents in sidebar
  - Remove sharing access
  - Clear distinction between owned and shared documents

- **Persistence**
  - SQLite database for all data
  - Documents persist after refresh
  - Sharing relationships preserved

- **Authentication**
  - Demo user accounts (no password required)
  - Session persistence via localStorage

## Demo Accounts

| User | Email |
|------|-------|
| Alice Johnson | alice@example.com |
| Bob Smith | bob@example.com |
| Carol Williams | carol@example.com |

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

```bash
npm test
```

## Project Structure

```
collaborative-docs/
├── app/
│   ├── api/
│   │   ├── auth/login/     # Login endpoint
│   │   ├── documents/      # Document CRUD
│   │   ├── share/          # Sharing logic
│   │   └── upload/         # File upload
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main app component
├── lib/
│   └── db.ts               # Database & helpers
├── data/
│   ├── app.db              # SQLite database
│   └── uploads/            # Uploaded files
├── __tests__/
│   └── db.test.ts          # Database tests
└── README.md
```

## Usage Guide

### Creating a Document
1. Login as any demo user
2. Click "+ New Document" button
3. Start typing in the editor
4. Document auto-saves after 1 second of inactivity

### Formatting Text
Use the toolbar above the editor:
- **B** - Bold
- *I* - Italic
- <u>U</u> - Underline
- H1, H2, H3 - Headings
- • List - Bullet points
- 1. List - Numbered list

### Uploading Files
1. Click "Upload" button
2. Select a `.txt` or `.md` file
3. A new document is created with the file content

### Sharing Documents
1. Open a document you own
2. Click "Share" button in toolbar
3. Enter a demo user email (e.g., bob@example.com)
4. Click "Add"
5. The document appears in "Shared with Me" for that user

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login with email |
| GET | /api/documents?userId=X | Get user's documents |
| POST | /api/documents | Create document |
| PUT | /api/documents | Update document |
| DELETE | /api/documents?id=X&userId=Y | Delete document |
| GET | /api/share?documentId=X | Get document shares |
| POST | /api/share | Share document |
| DELETE | /api/share | Remove share |
| POST | /api/upload | Upload file |
| GET | /api/upload?id=X | Get upload |

## Known Limitations

- No real-time collaboration (would require WebSockets)
- No document version history
- No commenting/suggestion mode
- Simple auth (demo only, not production-ready)
- No export to PDF/Markdown

## What's Next (if given more time)

1. **Real-time collaboration** using WebSockets or CRDT
2. **Document comments** and suggestion mode
3. **Version history** with diff viewing
4. **Export functionality** (PDF, Markdown, DOCX)
5. **Role-based permissions** (read/write/admin)
6. **Production authentication** with passwords/OAuth

## Technologies Used

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (better-sqlite3)
- **Testing**: Jest, ts-jest
- **Utilities**: UUID for IDs

## License

This is a candidate assessment project for Nao Medical.
