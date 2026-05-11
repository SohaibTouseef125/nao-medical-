import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, getUserByEmail, getAllUsers, getUserById } from '@/lib/db';

// Initialize database on first request
const initDbPromise = initDatabase();

export async function GET() {
  try {
    await initDbPromise;
    const users = await getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await initDbPromise;
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found. Please register first.' }, { status: 404 });
    }

    // Simple demo auth - in production, use proper authentication
    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}
