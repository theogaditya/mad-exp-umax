import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Token, ClerkUserData } from '@/lib/types';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { 
          signedIn: false, 
          message: 'User not authenticated' 
        },
        { status: 401 }
      );
    }
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: userId },
      include: {
        tokens: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            department: true,
            counter: true
          }
        }
      }
    });

    if (existingUser) {
      return NextResponse.json({
        signedIn: true,
        user: {
          id: existingUser.id,
          clerkId: existingUser.clerkId,
          email: existingUser.email,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          name: existingUser.name,
          age: existingUser.age,
          isSpecial: existingUser.isSpecial,
          createdAt: existingUser.createdAt,
          tokens: existingUser.tokens.map((token: Token & { department?: { name: string }; counter?: { name: string } }) => ({
            id: token.id,
            tokenNumber: token.tokenNumber,
            status: token.status,
            createdAt: token.createdAt,
            isPriority: token.isPriority,
            department: token.department?.name,
            counter: token.counter?.name
          }))
        },
        message: 'User verified successfully'
      });
    } else {
      return NextResponse.json(
        { 
          signedIn: false, 
          message: 'User not found in database' 
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Sign-in check failed:', error);
    return NextResponse.json(
      { 
        signedIn: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not authenticated' 
        },
        { status: 401 }
      );
    }

    // Get user info from Clerk
    const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!clerkUser.ok) {
      throw new Error('Failed to fetch user from Clerk');
    }

    const clerkUserData: ClerkUserData = await clerkUser.json();
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: userId }
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        user: existingUser,
        message: 'User already exists'
      });
    }

    // Create new user in database
    const newUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email: clerkUserData.email_addresses[0]?.email_address || '',
        firstName: clerkUserData.first_name || '',
        lastName: clerkUserData.last_name || '',
        name: `${clerkUserData.first_name || ''} ${clerkUserData.last_name || ''}`.trim() || 'User',
        isSpecial: false
      },
      include: {
        tokens: true
      }
    });

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('User creation failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create user' 
      },
      { status: 500 }
    );
  }
}