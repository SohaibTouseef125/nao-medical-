# Project Submission: Collaborative Docs

## Overview
This is a full-stack collaborative document management application built with Next.js 16. It allows users to create, edit, share, and auto-save documents in real-time.

## Tech Stack
- **Frontend & Backend**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Neon PostgreSQL (Serverless)
- **Styling**: Tailwind CSS & Framer Motion
- **Icons**: Lucide React

## Key Features
1. **User Authentication**: Simple email-based login and registration.
2. **Document Editor**: Rich-text editing with a custom toolbar (Bold, Italic, Lists).
3. **Auto-save**: Content is automatically saved to the database with a 2-second debounce.
4. **Document Sharing**: Users can share documents with others via email with specific permissions.
5. **File Upload**: Supports `.txt` and `.md` file uploads, which are converted into editable documents.
6. **Responsive Design**: Works on both desktop and mobile devices.

## Setup Instructions
1. **Clone the project** and install dependencies:
   ```bash
   npm install
   ```
2. **Environment Variables**:
   Create a `.env` file in the root directory and add your Neon PostgreSQL connection string:
   ```text
   DATABASE_URL="your_neon_postgresql_connection_string"
   ```
3. **Run the application**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`. Database tables will be automatically created on the first request.

## Architectural Decisions
- **Migration to PostgreSQL**: Shifted from SQLite to Neon PostgreSQL to ensure compatibility with Vercel's serverless environment (avoiding read-only filesystem errors).
- **Async Database Logic**: All database operations are asynchronous to handle cloud database latency efficiently.
- **State Management**: Used React hooks (`useState`, `useEffect`, `useCallback`) for clean and predictable UI state.
- **Modular Design**: Separated database logic (`lib/db.ts`), UI components (`components/`), and API logic (`app/api/`) for better maintainability.

## Challenges & Solutions
- **Vercel 500 Error**: Solved by migrating from a file-based SQLite database to a cloud-based PostgreSQL (Neon).
- **Native Binary Issues**: Resolved LightningCSS build errors by re-installing environment-specific dependencies.
