import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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
    const { tokenNumber, departmentId, counterId, isPriority } = body;

    // Validate input
    if (!tokenNumber || !departmentId || !counterId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required fields: tokenNumber, departmentId, counterId' 
        },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findFirst({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found' 
        },
        { status: 404 }
      );
    }

    // Ensure Redis connection
    try {
      if (!redis.isOpen) {
        await redis.connect();
      }
    } catch (redisError) {
      console.warn('Redis connection failed, proceeding without Redis:', redisError);
    }

    // Try to add to Redis queue if available
    try {
      const multi = redis.multi();
      const queueKey = `queue:${counterId}`;
      const tokenData = {
        tokenNumber: parseInt(tokenNumber),
        userId: user.id,
        departmentId,
        counterId,
        isPriority: Boolean(isPriority),
        createdAt: new Date().toISOString(),
        status: 'WAITING'
      };
      
      multi.lPush(queueKey, JSON.stringify(tokenData));

      // Execute transaction
      const results = await multi.exec();
      
      if (!results) {
        console.warn('Redis transaction failed, continuing with database only');
      }
    } catch (redisError) {
      console.warn('Failed to add token to Redis queue:', redisError);
      // Continue with database operation
    }

    // Create token in database with unique token number
    let finalTokenNumber = parseInt(tokenNumber);
    
    // Ensure token number is unique
    let existingToken = await prisma.token.findUnique({
      where: { tokenNumber: finalTokenNumber }
    });
    
    while (existingToken) {
      finalTokenNumber++;
      existingToken = await prisma.token.findUnique({
        where: { tokenNumber: finalTokenNumber }
      });
    }

    const newToken = await prisma.token.create({
      data: {
        tokenNumber: finalTokenNumber,
        userId: user.id,
        counterId,
        departmentId,
        isPriority: Boolean(isPriority),
        status: 'WAITING',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        department: true,
        counter: true,
        user: true
      }
    });

    return NextResponse.json({
      success: true,
      token: {
        id: newToken.id,
        tokenNumber: newToken.tokenNumber,
        status: newToken.status,
        isPriority: newToken.isPriority,
        createdAt: newToken.createdAt,
        department: newToken.department.name,
        counter: newToken.counter.name
      },
      message: 'Token created successfully'
    });

  } catch (error) {
    console.error('Token confirmation failed:', error);
    
    if (error instanceof Error && error.message.includes('expired')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token assignment expired. Please try again.' 
        },
        { status: 410 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}