// Database model types based on Prisma schema
export interface User {
  id: string;
  name: string;
  age: number | null;
  isSpecial: boolean;
  createdAt: Date;
  email: string;
  password?: string;
  firstName: string | null;
  lastName: string | null;
  updatedAt: Date;
  tokens?: Token[];
}

export interface Department {
  id: string;
  name: string;
  createdAt: Date;
  counters?: Counter[];
  tokens?: Token[];
  doctors?: Doctor[];
}

export interface Counter {
  id: string;
  name: string;
  department?: Department;
  departmentId: string;
  isSpecial: boolean;
  createdAt: Date;
  tokens?: Token[];
}

export interface Doctor {
  id: string;
  name: string;
  department?: Department | null;
  departmentId: string | null;
  tokens?: Token[];
}

export interface Token {
  id: string;
  tokenNumber: number;
  userId: string;
  counterId: string;
  departmentId: string;
  doctorId: string | null;
  isPriority: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  department?: Department;
  counter?: Counter;
  doctor?: Doctor | null;
  user?: User;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface UserResponse extends ApiResponse {
  user?: User;
  signedIn?: boolean;
}

export interface TokenAssignment {
  tokenNumber: number;
  counterId: string;
  counterName: string;
  departmentName: string;
  isPriority: boolean;
  estimatedWait?: number;
  userId: string;
  departmentId: string;
  timestamp: number;
}

export interface QueueStats {
  counterId: string;
  counterName: string;
  isSpecial: boolean;
  queueLength: number;
  tokens: Array<{
    tokenNumber: number;
    isPriority: boolean;
    createdAt: string;
  }>;
}

export interface DepartmentStats {
  id: string;
  name: string;
  counters: QueueStats[];
}

// Redis types
export interface RedisToken {
  tokenNumber: number;
  userId: string;
  departmentId: string;
  counterId: string;
  isPriority: boolean;
  createdAt: string;
  status: string;
}

// Auth user data
export interface AuthUserData {
  id: string;
  email: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  age?: number | null;
  isSpecial: boolean;
}

// Redis singleton interface
export interface RedisSingleton {
  getInstance(): RedisSingleton;
  ensureConnection(): Promise<void>;
}
