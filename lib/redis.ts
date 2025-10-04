import { createClient, RedisClientType } from 'redis';

class RedisClientSingleton {
  private static instance: RedisClientSingleton;
  private client: RedisClientType;
  private isConnected: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  private constructor() {
    this.client = createClient({
      username: 'default',
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: 'redis-16473.crce179.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 16473,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.log('Too many attempts to reconnect. Redis connection terminated.');
            return new Error('Too many retries.');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    this.client.on('error', (err: Error) => console.error('Redis Client Error:', err));
    this.client.on('connect', () => {
      this.isConnected = true;
      console.log('Redis connected successfully');
    });
    this.client.on('ready', () => {
      console.log('Redis client ready');
    });
    this.client.on('end', () => {
      this.isConnected = false;
      console.log('Redis client disconnected');
    });
  }

  public static getInstance(): RedisClientSingleton {
    if (!RedisClientSingleton.instance) {
      RedisClientSingleton.instance = new RedisClientSingleton();
    }
    return RedisClientSingleton.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = (async () => {
      try {
        if (!this.client.isOpen) {
          await this.client.connect();
        }
        this.isConnected = true;
      } catch (error) {
        this.isConnected = false;
        this.connectionPromise = null;
        throw error;
      }
      this.connectionPromise = null;
    })();

    return this.connectionPromise;
  }

  public getClient() {
    return this.client;
  }

  public async ensureConnection(): Promise<void> {
    if (!this.isConnected || !this.client.isOpen) {
      await this.connect();
    }
  }

  public isReady(): boolean {
    return this.isConnected && this.client.isOpen;
  }
}

const redisClientSingleton = RedisClientSingleton.getInstance();

// Initialize connection but don't block application startup
redisClientSingleton.connect().catch((error) => {
  console.warn('Initial Redis connection failed, will retry on demand:', error.message);
});

export default redisClientSingleton.getClient();