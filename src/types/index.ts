import { ServiceAccount } from 'firebase-admin';
import { Filter, UpdateFilter } from 'mongodb';

/**
 * Logger interface for database operations
 */
export interface Logger {
  info: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

/**
 * MongoDB connection options
 */
export interface MongoDBOptions {
  uri: string;
  dbName: string;
  options?: {
    maxPoolSize?: number;
    minPoolSize?: number;
    maxIdleTimeMS?: number;
    serverSelectionTimeoutMS?: number;
    socketTimeoutMS?: number;
    retryWrites?: boolean;
    retryReads?: boolean;
  };
}

/**
 * Firebase configuration options
 */
export interface FirebaseOptions {
  serviceAccount: ServiceAccount;
  databaseURL?: string;
  storageBucket?: string;
}

/**
 * Main database configuration options
 */
export interface DBOptions {
  mongodb?: MongoDBOptions;
  firebase?: FirebaseOptions;
  logger?: Logger;
  enableLogging?: boolean;
}

/**
 * Generic document interface
 */
export interface Document {
  _id?: string | object;
  [key: string]: any;
}

/**
 * MongoDB Filter type alias
 */
export type MongoQuery<T = Document> = Filter<T>;

/**
 * MongoDB Update type alias
 */
export type MongoUpdate<T = Document> = UpdateFilter<T>;

/**
 * Query interface for database operations
 */
export interface Query {
  [key: string]: any;
}

/**
 * Update operations interface
 */
export interface UpdateQuery {
  $set?: Record<string, any>;
  $unset?: Record<string, any>;
  $inc?: Record<string, any>;
  $push?: Record<string, any>;
  $pull?: Record<string, any>;
  $addToSet?: Record<string, any>;
  [key: string]: any;
}

/**
 * Insert result interface
 */
export interface InsertResult {
  insertedId: string;
  acknowledged: boolean;
}

/**
 * Update result interface
 */
export interface UpdateResult {
  acknowledged: boolean;
  modifiedCount: number;
  matchedCount: number;
  upsertedCount?: number;
  upsertedId?: string;
}

/**
 * Delete result interface
 */
export interface DeleteResult {
  acknowledged: boolean;
  deletedCount: number;
}

/**
 * Database connection status
 */
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

/**
 * Database operation result
 */
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: Error;
  message?: string;
}

/**
 * Listener callback function type
 */
export type ListenerCallback<T = any> = (data: T) => void;

/**
 * Unsubscribe function type
 */
export type UnsubscribeFunction = () => void;