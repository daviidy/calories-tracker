import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Remove the session cookie
    const cookieStore = cookies();
    await cookieStore.delete('__session');
    
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error removing session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 