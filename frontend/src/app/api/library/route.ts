import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/library
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // In a real app, you would fetch from your database here
    // For now, we'll return an empty array to prevent errors
    return NextResponse.json([]);
    
  } catch (error) {
    console.error('Error fetching library:', error);
    return NextResponse.json(
      { error: 'Failed to fetch library data' },
      { status: 500 }
    );
  }
}

// POST /api/library
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // In a real app, you would save to your database here
    const data = await request.json();
    return NextResponse.json(data, { status: 201 });
    
  } catch (error) {
    console.error('Error saving to library:', error);
    return NextResponse.json(
      { error: 'Failed to save library item' },
      { status: 500 }
    );
  }
}
