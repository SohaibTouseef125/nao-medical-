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
      
      const hasAccess = await canAccessDocument(documentId, userId);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      
      const doc = await getDocumentById(documentId);
      return NextResponse.json({ document: doc });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const owned = await getDocumentsByOwner(userId);
    const shared = await getSharedDocuments(userId);

    return NextResponse.json({ 
      documents: {
        owned,
        shared
      }
    });
  } catch (error) {
    console.error('Fetch documents error:', error);
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
    const doc = await createDocument(id, title || 'Untitled Document', ownerId, content || '');

    return NextResponse.json({ 
      document: doc
    }, { status: 201 });
  } catch (error) {
    console.error('Create document error:', error);
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

    const hasAccess = await canAccessDocument(id, userId || '');
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await updateDocument(id, { title, content });
    const updated = await getDocumentById(id);

    return NextResponse.json({ document: updated });
  } catch (error) {
    console.error('Update document error:', error);
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

    const doc = await getDocumentById(id);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (doc.owner_id !== userId) {
      return NextResponse.json({ error: 'Only owner can delete document' }, { status: 403 });
    }

    await deleteDocument(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
