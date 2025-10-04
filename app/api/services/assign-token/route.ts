import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import { Counter, TokenAssignment } from '@/lib/types';

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

    const body = await request.json();
    const { departmentId, userAge, isSpecial } = body;

    // Validate input
    if (!departmentId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required fields' 
        },
        { status: 400 }
      );
    }

    // Verify user exists and get user data
    const dbUser = await prisma.user.findFirst({
      where: { id: user.id },
      include: {
        tokens: {
          where: {
            status: 'WAITING'
          }
        }
      }
    });

    if (!dbUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found' 
        },
        { status: 404 }
      );
    }

    // Check if user already has a waiting token in this department
    const existingToken = user.tokens?.find(token => 
      token.departmentId === departmentId && token.status === 'WAITING'
    );

    if (existingToken) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'You already have a waiting token in this department. Please wait for it to be processed before requesting another.' 
        },
        { status: 400 }
      );
    }

    // Get department and its counters
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        counters: true
      }
    });

    if (!department) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Department not found' 
        },
        { status: 404 }
      );
    }

    // Determine if user is eligible for priority
    const isEligibleForPriority = isSpecial || (userAge && userAge >= 70);

    // Find the best counter based on priority eligibility and queue lengths
    const findBestCounter = async (counters: Counter[], isEligibleForPriority: boolean) => {
      let eligibleCounters = counters;
      
      // If eligible for priority, prioritize special counters
      if (isEligibleForPriority) {
        const specialCounters = counters.filter(counter => counter.isSpecial);
        if (specialCounters.length > 0) {
          eligibleCounters = specialCounters;
        }
      } else {
        // If not eligible, exclude special counters
        eligibleCounters = counters.filter(counter => !counter.isSpecial);
      }

      if (eligibleCounters.length === 0) {
        return null;
      }

      // Get queue lengths atomically using Redis
      const queueLengths = await Promise.all(
        eligibleCounters.map(async (counter) => {
          let queueLength = 0;
          try {
            // Use the queue manager to get queue length
            const QueueManager = (await import('@/lib/queueManager')).default;
            queueLength = await QueueManager.getQueueLength(counter.id);
          } catch (error) {
            console.warn('Redis queue length failed, using database:', error);
            // Fallback to database count
            const dbCount = await prisma.token.count({
              where: {
                counterId: counter.id,
                status: 'WAITING'
              }
            });
            queueLength = dbCount;
          }
          return { counter, queueLength };
        })
      );

      // Find counter with minimum queue length
      const minQueueLength = Math.min(...queueLengths.map(item => item.queueLength));
      const bestCounters = queueLengths.filter(item => item.queueLength === minQueueLength);
      
      // If multiple counters have same length, pick random
      const selected = bestCounters[Math.floor(Math.random() * bestCounters.length)];
      
      return selected.counter;
    };

    const assignedCounter = await findBestCounter(department.counters, isEligibleForPriority);

    if (!assignedCounter) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No suitable counter found' 
        },
        { status: 400 }
      );
    }

    // Generate unique token number atomically
    let nextTokenNumber = 1;
    try {
      const tokenNumberKey = 'global:token:counter';
      // Ensure Redis connection
      if (!redis.isOpen) {
        await redis.connect();
      }
      nextTokenNumber = await redis.incr(tokenNumberKey);
    } catch (error) {
      console.warn('Redis token counter failed, using database:', error);
      // Fallback to database
      const lastToken = await prisma.token.findFirst({
        orderBy: { tokenNumber: 'desc' }
      });
      nextTokenNumber = (lastToken?.tokenNumber || 0) + 1;
    }

    // Calculate estimated wait time
    let estimatedWait = 0;
    try {
      const QueueManager = (await import('@/lib/queueManager')).default;
      const queueLength = await QueueManager.getQueueLength(assignedCounter.id);
      estimatedWait = queueLength * 5; // 5 minutes per token
    } catch (error) {
      console.warn('Queue length failed for wait time:', error);
      // Fallback to database count
      const dbCount = await prisma.token.count({
        where: {
          counterId: assignedCounter.id,
          status: 'WAITING'
        }
      });
      estimatedWait = dbCount * 5;
    }

    // Store token assignment temporarily in Redis (5 minutes expiry)
    try {
      const assignmentKey = `assignment:${user.id}:${nextTokenNumber}`;
      const assignmentData: TokenAssignment = {
        tokenNumber: nextTokenNumber,
        counterId: assignedCounter.id,
        counterName: assignedCounter.name,
        departmentName: department.name,
        isPriority: isEligibleForPriority,
        estimatedWait,
        userId: user.id,
        departmentId,
        timestamp: Date.now()
      };

      if (!redis.isOpen) {
        await redis.connect();
      }
      await redis.setEx(assignmentKey, 300, JSON.stringify(assignmentData));
    } catch (error) {
      console.warn('Failed to store assignment in Redis:', error);
      // Continue without Redis storage - user will need to retry if confirmation fails
    }

    return NextResponse.json({
      success: true,
      tokenNumber: nextTokenNumber,
      counterId: assignedCounter.id,
      counterName: assignedCounter.name,
      departmentName: department.name,
      isPriority: isEligibleForPriority,
      estimatedWait,
      message: 'Token assignment prepared successfully'
    });

  } catch (error) {
    console.error('Token assignment failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}