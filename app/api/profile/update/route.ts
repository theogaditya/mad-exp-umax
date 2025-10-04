import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
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

    const body = await request.json();
    const { age, isSpecial } = body;

    // Validate input
    if (age === undefined || age === null) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Age is required' 
        },
        { status: 400 }
      );
    }

    if (typeof age !== 'number' || age < 1 || age > 120) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Age must be a number between 1 and 120' 
        },
        { status: 400 }
      );
    }

    if (typeof isSpecial !== 'boolean') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'isSpecial must be a boolean value' 
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found' 
        },
        { status: 404 }
      );
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        age: age,
        isSpecial: isSpecial,
        updatedAt: new Date()
      },
      include: {
        tokens: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        clerkId: updatedUser.clerkId,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        name: updatedUser.name,
        age: updatedUser.age,
        isSpecial: updatedUser.isSpecial,
        createdAt: updatedUser.createdAt,
        tokens: updatedUser.tokens
      },
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile update failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
