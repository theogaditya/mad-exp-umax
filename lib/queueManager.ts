import redis from '@/lib/redis';
import { RedisToken, Counter, QueueStats } from '@/lib/types';
import { RedisClientType } from 'redis';

class QueueManager {
  private static instance: QueueManager;
  private redisClient: RedisClientType;

  private constructor() {
    this.redisClient = redis;
  }

  public static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager();
    }
    return QueueManager.instance;
  }

  // Safe connection method that handles already-connected state
  private async ensureConnection(): Promise<void> {
    try {
      // Use the redis client directly - it's already a singleton
      if (!this.redisClient.isOpen) {
        await this.redisClient.connect();
      }
    } catch (error) {
      console.error('Failed to ensure Redis connection:', error);
      throw error;
    }
  }

  // Get queue length for a specific counter
  async getQueueLength(counterId: string): Promise<number> {
    try {
      await this.ensureConnection();
      const queueKey = `queue:${counterId}`;
      return await this.redisClient.lLen(queueKey);
    } catch (error) {
      console.error(`Error getting queue length for counter ${counterId}:`, error);
      return 0;
    }
  }

  // Get all tokens in a queue
  async getQueueTokens(counterId: string): Promise<RedisToken[]> {
    try {
      await this.ensureConnection();
      const queueKey = `queue:${counterId}`;
      const tokens = await this.redisClient.lRange(queueKey, 0, -1);
      return tokens.map((token: string) => {
        try {
          return JSON.parse(token);
        } catch {
          return null;
        }
      }).filter(Boolean);
    } catch (error) {
      console.error(`Error getting queue tokens for counter ${counterId}:`, error);
      return [];
    }
  }

  // Process next token in queue (remove from front)
  async processNextToken(counterId: string): Promise<RedisToken | null> {
    try {
      await this.ensureConnection();
      const queueKey = `queue:${counterId}`;
      const tokenStr = await this.redisClient.lPop(queueKey);
      return tokenStr ? JSON.parse(tokenStr) : null;
    } catch (error) {
      console.error(`Error processing next token for counter ${counterId}:`, error);
      return null;
    }
  }

  // Add token to queue atomically
  async addTokenAtomically(counterId: string, tokenData: RedisToken): Promise<boolean> {
    try {
      await this.ensureConnection();
      
      const queueKey = `queue:${counterId}`;
      const tokenNumberKey = 'global:token:counter';
      
      // Use Redis transaction for atomic operations
      const multi = this.redisClient.multi();
      
      // Increment global token counter
      multi.incr(tokenNumberKey);
      
      // Add token to queue
      multi.lPush(queueKey, JSON.stringify(tokenData));
      
      const results = await multi.exec();
      
      if (!results || results.length !== 2) {
        throw new Error('Redis transaction failed');
      }
      
      return true;
    } catch (error) {
      console.error(`Error adding token atomically to counter ${counterId}:`, error);
      return false;
    }
  }

  // Remove specific token from queue
  async removeTokenFromQueue(counterId: string, tokenNumber: number): Promise<boolean> {
    try {
      await this.ensureConnection();
      const queueKey = `queue:${counterId}`;
      const tokens = await this.redisClient.lRange(queueKey, 0, -1);
      
      for (let i = 0; i < tokens.length; i++) {
        try {
          const token = JSON.parse(tokens[i]);
          if (token.tokenNumber === tokenNumber) {
            await this.redisClient.lRem(queueKey, 1, tokens[i]);
            return true;
          }
        } catch {
          continue;
        }
      }
      return false;
    } catch (error) {
      console.error(`Error removing token ${tokenNumber} from counter ${counterId}:`, error);
      return false;
    }
  }

  // Get queue statistics for all counters in a department
  async getDepartmentQueueStats(departmentId: string, counters: Counter[]): Promise<QueueStats[]> {
    try {
      await this.ensureConnection();
      
      const stats = await Promise.all(
        counters.map(async (counter) => {
          const queueLength = await this.getQueueLength(counter.id);
          const tokens = await this.getQueueTokens(counter.id);
          
          return {
            counterId: counter.id,
            counterName: counter.name,
            isSpecial: counter.isSpecial,
            queueLength,
            tokens: tokens.map((token: RedisToken) => ({
              tokenNumber: token.tokenNumber,
              isPriority: token.isPriority,
              createdAt: token.createdAt
            }))
          };
        })
      );

      return stats;
    } catch (error) {
      console.error(`Error getting department queue stats for ${departmentId}:`, error);
      return counters.map(counter => ({
        counterId: counter.id,
        counterName: counter.name,
        isSpecial: counter.isSpecial,
        queueLength: 0,
        tokens: []
      }));
    }
  }

  // Clear all queues (for testing/reset purposes)
  async clearAllQueues(): Promise<void> {
    try {
      await this.ensureConnection();
      const keys = await this.redisClient.keys('queue:*');
      if (keys.length > 0) {
        await this.redisClient.del(keys);
      }
    } catch (error) {
      console.error('Error clearing all queues:', error);
    }
  }

  // Get global token counter
  async getGlobalTokenCounter(): Promise<number> {
    try {
      await this.ensureConnection();
      const tokenNumberKey = 'global:token:counter';
      const counter = await this.redisClient.get(tokenNumberKey);
      return counter ? parseInt(counter) : 0;
    } catch (error) {
      console.error('Error getting global token counter:', error);
      return 0;
    }
  }

  // Set global token counter
  async setGlobalTokenCounter(value: number): Promise<void> {
    try {
      await this.ensureConnection();
      const tokenNumberKey = 'global:token:counter';
      await this.redisClient.set(tokenNumberKey, value.toString());
    } catch (error) {
      console.error('Error setting global token counter:', error);
    }
  }
}

export default QueueManager.getInstance();