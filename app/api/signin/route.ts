import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Token } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { 
          signedIn: false, 
          message: 'User not authenticated' 
        },
        { status: 401 }
      );
    }

    const userWithTokens = await prisma.user.findUnique({
      where: { id: user.id },
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

    if (userWithTokens) {
      return NextResponse.json({
        signedIn: true,
        user: {
          id: userWithTokens.id,
          email: userWithTokens.email,
          firstName: userWithTokens.firstName,
          lastName: userWithTokens.lastName,
          name: userWithTokens.name,
          age: userWithTokens.age,
          isSpecial: userWithTokens.isSpecial,
          createdAt: userWithTokens.createdAt,
          tokens: userWithTokens.tokens.map((token: Token & { department?: { name: string }; counter?: { name: string } }) => ({
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

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not authenticated' 
        },
        { status: 401 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        user: existingUser,
        message: 'User already exists'
      });
    }

    return NextResponse.json({
      success: false,
      message: 'User not found'
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