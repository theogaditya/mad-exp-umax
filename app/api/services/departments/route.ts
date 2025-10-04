import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { NextResponse } from 'next/server';
import { Department, Counter } from '@/lib/types';

export async function GET() {
  try {
    // Use improved connection handling
    let redisConnected = false;
    try {
      if (!redis.isOpen) {
        await redis.connect();
      }
      redisConnected = true;
    } catch (redisError) {
      console.warn('Redis connection failed, using database only:', redisError);
    }
    
    const departments = await prisma.department.findMany({
      include: {
        counters: {
          include: {
            tokens: {
              where: {
                status: 'WAITING'
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Get queue lengths from Redis if available, otherwise from database
    const departmentsWithQueueLengths = await Promise.all(
      departments.map(async (dept: Department & { counters: (Counter & { tokens: unknown[] })[] }) => {
        const counters = await Promise.all(
          dept.counters.map(async (counter: Counter & { tokens: unknown[] }) => {
            let queueLength = 0;
            
            if (redisConnected) {
              try {
                const QueueManager = (await import('@/lib/queueManager')).default;
                queueLength = await QueueManager.getQueueLength(counter.id);
              } catch (redisError) {
                console.warn('Redis queue length failed, using database:', redisError);
                queueLength = counter.tokens.length;
              }
            } else {
              // Fallback to database count
              queueLength = counter.tokens.length;
            }
            
            return {
              id: counter.id,
              name: counter.name,
              isSpecial: counter.isSpecial,
              queueLength: queueLength || 0
            };
          })
        );

        return {
          id: dept.id,
          name: dept.name,
          counters
        };
      })
    );

    return NextResponse.json({
      success: true,
      departments: departmentsWithQueueLengths
    });

  } catch (error) {
    console.error('Failed to fetch departments:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch departments' 
      },
      { status: 500 }
    );
  }
}