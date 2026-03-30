import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { 
  createDocument, 
  getDocumentById, 
  updateDocument, 
  deleteDocument,
  getDocumentsByOwner,
  getSharedDocuments,
  canAccessDocument,
  getUserByEmail
} from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const documentId = searchParams.get('documentId');

    if (documentId) {
      if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
      }
      
      if (!canAccessDocument(documentId, userId)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      
      const doc = getDocumentById(documentId);
      return NextResponse.json({ document: doc });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const owned = getDocumentsByOwner(userId);
    const shared = getSharedDocuments(userId);

    return NextResponse.json({ 
      documents: {
        owned,
        shared
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, ownerId, content } = body;

    if (!ownerId) {
      return NextResponse.json({ error: 'Owner ID required' }, { status: 400 });
    }

    const id = uuidv4();
    createDocument(id, title || 'Untitled Document', ownerId, content || '');

    return NextResponse.json({ 
      document: {
        id,
        title: title || 'Untitled Document',
        content: content || '',
        owner_id: ownerId
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, content, userId } = body;

    if (!id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    if (!canAccessDocument(id, userId || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    updateDocument(id, { title, content });
    const updated = getDocumentById(id);

    return NextResponse.json({ document: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    const doc = getDocumentById(id);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (doc.owner_id !== userId) {
      return NextResponse.json({ error: 'Only owner can delete document' }, { status: 403 });
    }

    deleteDocument(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
