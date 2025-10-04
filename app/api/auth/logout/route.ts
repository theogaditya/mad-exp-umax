import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

    // Clear auth cookie
    response.headers.set('Set-Cookie', clearAuthCookie());

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
