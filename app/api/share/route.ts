import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { 
  shareDocument, 
  removeShare, 
  getDocumentShares,
  canAccessDocument,
  getDocumentById,
  getUserByEmail
} from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    const shares = getDocumentShares(documentId);
    return NextResponse.json({ shares });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, userEmail, userId, permission } = body;

    if (!documentId || !userEmail) {
      return NextResponse.json({ error: 'Document ID and user email required' }, { status: 400 });
    }

    // Verify access
    if (!canAccessDocument(documentId, userId)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Find user by email
    const targetUser = getUserByEmail(userEmail);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const shareId = uuidv4();
    shareDocument(shareId, documentId, targetUser.id, permission || 'read');

    const shares = getDocumentShares(documentId);
    return NextResponse.json({ shares }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to share document' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, userEmail, userId } = body;

    if (!documentId || !userEmail) {
      return NextResponse.json({ error: 'Document ID and user email required' }, { status: 400 });
    }

    const doc = getDocumentById(documentId);
    if (!doc || doc.owner_id !== userId) {
      return NextResponse.json({ error: 'Only owner can remove shares' }, { status: 403 });
    }

    const targetUser = getUserByEmail(userEmail);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    removeShare(documentId, targetUser.id);
    const shares = getDocumentShares(documentId);
    
    return NextResponse.json({ shares });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove share' }, { status: 500 });
  }
}
