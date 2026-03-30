import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { createUpload, getUploadsByDocument, getUploadById } from '@/lib/db';

const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Supported file types
const SUPPORTED_TYPES = ['.txt', '.md'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentId = formData.get('documentId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const ext = path.extname(file.name).toLowerCase();
    if (!SUPPORTED_TYPES.includes(ext)) {
      return NextResponse.json({ 
        error: `Unsupported file type. Supported: ${SUPPORTED_TYPES.join(', ')}` 
      }, { status: 400 });
    }

    // Validate size
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 5MB' }, { status: 400 });
    }

    // Save file
    const uploadId = uuidv4();
    const filename = `${uploadId}${ext}`;
    const filepath = path.join(UPLOADS_DIR, filename);
    
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    // Create upload record
    createUpload(
      uploadId,
      documentId || null,
      filename,
      file.name,
      file.type,
      file.size
    );

    // Read content for text files
    let content = '';
    if (ext === '.txt' || ext === '.md') {
      content = fs.readFileSync(filepath, 'utf-8');
    }

    return NextResponse.json({ 
      upload: {
        id: uploadId,
        filename,
        originalName: file.name,
        contentType: file.type,
        size: file.size,
        content
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uploadId = searchParams.get('id');
    const documentId = searchParams.get('documentId');

    if (uploadId) {
      const upload = getUploadById(uploadId);
      if (!upload) {
        return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
      }
      
      const filepath = path.join(UPLOADS_DIR, upload.filename);
      if (!fs.existsSync(filepath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }

      const content = fs.readFileSync(filepath, 'utf-8');
      return NextResponse.json({ 
        upload: {
          ...upload,
          content
        }
      });
    }

    if (documentId) {
      const uploads = getUploadsByDocument(documentId);
      return NextResponse.json({ uploads });
    }

    return NextResponse.json({ error: 'ID or documentId required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch upload' }, { status: 500 });
  }
}
