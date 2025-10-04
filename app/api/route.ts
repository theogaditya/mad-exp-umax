import prisma from "@/lib/prisma";
import redisClient from "@/lib/redis";
import { NextResponse } from 'next/server';

export async function GET() {
  let dbStatus = "ok";
  let redisStatus = "ok";

  // Check Prisma
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    console.error("DB health check failed:", error);
    dbStatus = "unreachable";
  }

  // Check Redis
  try {
    const pong = await redisClient.ping();
    if (pong !== 'PONG') {
      throw new Error('Redis did not respond with PONG');
    }
  } catch (error) {
    console.error("Redis health check failed:", error);
    redisStatus = "unreachable";
  }

  const status = dbStatus === "ok" && redisStatus === "ok" ? 200 : 503;

  return NextResponse.json(
    { status: status === 200 ? "ok" : "error", db: dbStatus, redis: redisStatus, api: "ok" },
    { status }
  );
}
