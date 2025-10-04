import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import QueueManager from '@/lib/queueManager';
import { NextResponse } from 'next/server';
import { Department, Counter } from '@/lib/types';

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const counterId = searchParams.get('counterId');

    if (counterId) {
      // Get specific counter queue
      const queueLength = await QueueManager.getQueueLength(counterId);
      const tokens = await QueueManager.getQueueTokens(counterId);
      
      return NextResponse.json({
        success: true,
        counterId,
        queueLength,
        tokens
      });
    }

    if (departmentId) {
      // Get all counters for department
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

      const stats = await QueueManager.getDepartmentQueueStats(departmentId, department.counters);
      
      return NextResponse.json({
        success: true,
        departmentId,
        departmentName: department.name,
        counters: stats
      });
    }

    // Get all departments with queue stats
    const departments = await prisma.department.findMany({
      include: {
        counters: true
      }
    });

    const departmentsWithStats = await Promise.all(
      departments.map(async (dept: Department & { counters: Counter[] }) => {
        const stats = await QueueManager.getDepartmentQueueStats(dept.id, dept.counters);
        return {
          id: dept.id,
          name: dept.name,
          counters: stats
        };
      })
    );

    return NextResponse.json({
      success: true,
      departments: departmentsWithStats
    });

  } catch (error) {
    console.error('Queue stats failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

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
    const { action, counterId, tokenNumber } = body;

    switch (action) {
      case 'process_next':
        if (!counterId) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'Counter ID required' 
            },
            { status: 400 }
          );
        }

        const nextToken = await QueueManager.processNextToken(counterId);
        
        if (!nextToken) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'No tokens in queue' 
            },
            { status: 404 }
          );
        }

        // Update token status in database
        await prisma.token.update({
          where: { tokenNumber: nextToken.tokenNumber },
          data: { status: 'ASSIGNED' }
        });

        return NextResponse.json({
          success: true,
          token: nextToken,
          message: 'Next token processed'
        });

      case 'remove_token':
        if (!counterId || !tokenNumber) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'Counter ID and token number required' 
            },
            { status: 400 }
          );
        }

        const removed = await QueueManager.removeTokenFromQueue(counterId, tokenNumber);
        
        if (!removed) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'Token not found in queue' 
            },
            { status: 404 }
          );
        }

        // Update token status in database
        await prisma.token.update({
          where: { tokenNumber },
          data: { status: 'CANCELLED' }
        });

        return NextResponse.json({
          success: true,
          message: 'Token removed from queue'
        });

      case 'clear_queues':
        await QueueManager.clearAllQueues();
        return NextResponse.json({
          success: true,
          message: 'All queues cleared'
        });

      default:
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid action' 
          },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Queue management failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
