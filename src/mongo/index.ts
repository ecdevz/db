import { MongoClient, Db, Collection, MongoClientOptions, WithId } from 'mongodb';
import { 
  MongoDBOptions, 
  Logger, 
  Document, 
  MongoQuery,
  MongoUpdate,
  InsertResult, 
  UpdateResult, 
  DeleteResult, 
  ConnectionStatus,
  OperationResult 
} from '../types';

/**
 * MongoDB wrapper class with enhanced functionality
 */
class MongoDB {
  private client: MongoClient;
  private db: Db | null = null;
  private dbName: string;
  private logger: Logger;
  private connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(options: MongoDBOptions, logger?: Logger) {
    this.dbName = options.dbName;
    this.logger = logger || this.createDefaultLogger();
    
    const clientOptions: MongoClientOptions = {
      maxPoolSize: options.options?.maxPoolSize || 10,
      minPoolSize: options.options?.minPoolSize || 2,
      maxIdleTimeMS: options.options?.maxIdleTimeMS || 30000,
      serverSelectionTimeoutMS: options.options?.serverSelectionTimeoutMS || 5000,
      socketTimeoutMS: options.options?.socketTimeoutMS || 45000,
      retryWrites: options.options?.retryWrites ?? true,
      retryReads: options.options?.retryReads ?? true,
    };

    this.client = new MongoClient(options.uri, clientOptions);
    this.setupEventListeners();
  }

  /**
   * Creates a default logger if none provided
   */
  private createDefaultLogger(): Logger {
    return {
      info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
      error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
      warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
      debug: (message: string, ...args: any[]) => console.debug(`[DEBUG] ${message}`, ...args),
    };
  }

  /**
   * Sets up MongoDB client event listeners
   */
  private setupEventListeners(): void {
    this.client.on('connectionPoolCreated', () => {
      this.logger.debug('MongoDB connection pool created');
    });

    this.client.on('connectionPoolClosed', () => {
      this.logger.debug('MongoDB connection pool closed');
    });

    this.client.on('serverOpening', () => {
      this.connectionStatus = ConnectionStatus.CONNECTING;
      this.logger.debug('MongoDB server opening');
    });

    this.client.on('serverClosed', () => {
      this.connectionStatus = ConnectionStatus.DISCONNECTED;
      this.logger.debug('MongoDB server closed');
    });

    this.client.on('error', (error) => {
      this.connectionStatus = ConnectionStatus.ERROR;
      this.logger.error('MongoDB client error:', error);
    });
  }

  /**
   * Connects to MongoDB
   */
  public async connect(): Promise<OperationResult<void>> {
    try {
      this.connectionStatus = ConnectionStatus.CONNECTING;
      this.logger.info('Connecting to MongoDB...');
      
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.connectionStatus = ConnectionStatus.CONNECTED;
      this.reconnectAttempts = 0;
      
      this.logger.info(`Successfully connected to MongoDB database: ${this.dbName}`);
      return { success: true, message: 'Connected to MongoDB' };
    } catch (error) {
      this.connectionStatus = ConnectionStatus.ERROR;
      const errorMessage = `Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.logger.error(errorMessage);
      return { success: false, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }

  /**
   * Disconnects from MongoDB
   */
  public async disconnect(): Promise<OperationResult<void>> {
    try {
      this.logger.info('Disconnecting from MongoDB...');
      await this.client.close();
      this.connectionStatus = ConnectionStatus.DISCONNECTED;
      this.db = null;
      this.logger.info('Successfully disconnected from MongoDB');
      return { success: true, message: 'Disconnected from MongoDB' };
    } catch (error) {
      const errorMessage = `Error disconnecting from MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.logger.error(errorMessage);
      return { success: false, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }

  /**
   * Gets the connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Checks if connected to MongoDB
   */
  public isConnected(): boolean {
    return this.connectionStatus === ConnectionStatus.CONNECTED && this.db !== null;
  }

  /**
   * Gets a collection with proper error handling
   */
  public getCollection<T extends Document = Document>(collectionName: string): Collection<T> {
    if (!this.db) {
      throw new Error('Not connected to MongoDB. Call connect() first.');
    }
    return this.db.collection<T>(collectionName);
  }

  /**
   * Inserts a single document
   */
  public async insertOne<T extends Document = Document>(
    collectionName: string, 
    document: Omit<T, '_id'>
  ): Promise<OperationResult<InsertResult>> {
    try {
      if (!this.isConnected()) {
        throw new Error('Not connected to MongoDB');
      }

      const collection = this.getCollection<T>(collectionName);
      const result = await collection.insertOne(document as any);
      
      const insertResult: InsertResult = {
        insertedId: result.insertedId.toString(),
        acknowledged: result.acknowledged
      };

      this.logger.debug(`Document inserted into ${collectionName}:`, insertResult);
      return { success: true, data: insertResult };
    } catch (error) {
      const errorMessage = `Error inserting document into ${collectionName}`;
      this.logger.error(errorMessage, error);
      return { success: false, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }

  /**
   * Inserts multiple documents
   */
  public async insertMany<T extends Document = Document>(
    collectionName: string, 
    documents: Omit<T, '_id'>[]
  ): Promise<OperationResult<{ insertedIds: string[]; insertedCount: number }>> {
    try {
      if (!this.isConnected()) {
        throw new Error('Not connected to MongoDB');
      }

      const collection = this.getCollection<T>(collectionName);
      const result = await collection.insertMany(documents as any);
      
      const insertedIds = Object.values(result.insertedIds).map(id => id.toString());
      const insertResult = {
        insertedIds,
        insertedCount: result.insertedCount
      };

      this.logger.debug(`${documents.length} documents inserted into ${collectionName}`);
      return { success: true, data: insertResult };
    } catch (error) {
      const errorMessage = `Error inserting documents into ${collectionName}`;
      this.logger.error(errorMessage, error);
      return { success: false, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }

  /**
   * Finds documents with optional query
   */
  public async find<T extends Document = Document>(
    collectionName: string, 
    query: MongoQuery<T> = {},
    options: { limit?: number; skip?: number; sort?: Record<string, 1 | -1> } = {}
  ): Promise<OperationResult<WithId<T>[]>> {
    try {
      if (!this.isConnected()) {
        throw new Error('Not connected to MongoDB');
      }

      const collection = this.getCollection<T>(collectionName);
      let cursor = collection.find(query);

      if (options.sort) cursor = cursor.sort(options.sort);
      if (options.skip) cursor = cursor.skip(options.skip);
      if (options.limit) cursor = cursor.limit(options.limit);

      const documents = await cursor.toArray();
      
      this.logger.debug(`Found ${documents.length} documents in ${collectionName}`);
      return { success: true, data: documents };
    } catch (error) {
      const errorMessage = `Error finding documents in ${collectionName}`;
      this.logger.error(errorMessage, error);
      return { success: false, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }

  /**
   * Finds a single document
   */
  public async findOne<T extends Document = Document>(
    collectionName: string, 
    query: MongoQuery<T>
  ): Promise<OperationResult<WithId<T> | null>> {
    try {
      if (!this.isConnected()) {
        throw new Error('Not connected to MongoDB');
      }

      const collection = this.getCollection<T>(collectionName);
      const document = await collection.findOne(query);
      
      this.logger.debug(`Found document in ${collectionName}:`, !!document);
      return { success: true, data: document };
    } catch (error) {
      const errorMessage = `Error finding document in ${collectionName}`;
      this.logger.error(errorMessage, error);
      return { success: false, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }

  /**
   * Updates a single document
   */
  public async updateOne<T extends Document = Document>(
    collectionName: string, 
    query: MongoQuery<T>, 
    update: MongoUpdate<T>
  ): Promise<OperationResult<UpdateResult>> {
    try {
      if (!this.isConnected()) {
        throw new Error('Not connected to MongoDB');
      }

      const collection = this.getCollection<T>(collectionName);
      const result = await collection.updateOne(query, update);
      
      const updateResult: UpdateResult = {
        acknowledged: result.acknowledged,
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
        upsertedCount: result.upsertedCount || 0,
        upsertedId: result.upsertedId?.toString()
      };

      this.logger.debug(`Document updated in ${collectionName}:`, updateResult);
      return { success: true, data: updateResult };
    } catch (error) {
      const errorMessage = `Error updating document in ${collectionName}`;
      this.logger.error(errorMessage, error);
      return { success: false, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }

  /**
   * Updates multiple documents
   */
  public async updateMany<T extends Document = Document>(
    collectionName: string, 
    query: MongoQuery<T>, 
    update: MongoUpdate<T>
  ): Promise<OperationResult<UpdateResult>> {
    try {
      if (!this.isConnected()) {
        throw new Error('Not connected to MongoDB');
      }

      const collection = this.getCollection<T>(collectionName);
      const result = await collection.updateMany(query, update);
      
      const updateResult: UpdateResult = {
        acknowledged: result.acknowledged,
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
        upsertedCount: result.upsertedCount || 0,
        upsertedId: result.upsertedId?.toString()
      };

      this.logger.debug(`Documents updated in ${collectionName}:`, updateResult);
      return { success: true, data: updateResult };
    } catch (error) {
      const errorMessage = `Error updating documents in ${collectionName}`;
      this.logger.error(errorMessage, error);
      return { success: false, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }

  /**
   * Deletes a single document
   */
  public async deleteOne<T extends Document = Document>(
    collectionName: string, 
    query: MongoQuery<T>
  ): Promise<OperationResult<DeleteResult>> {
    try {
      if (!this.isConnected()) {
        throw new Error('Not connected to MongoDB');
      }

      const collection = this.getCollection<T>(collectionName);
      const result = await collection.deleteOne(query);
      
      const deleteResult: DeleteResult = {
        acknowledged: result.acknowledged,
        deletedCount: result.deletedCount
      };

      this.logger.debug(`Document deleted from ${collectionName}:`, deleteResult);
      return { success: true, data: deleteResult };
    } catch (error) {
      const errorMessage = `Error deleting document from ${collectionName}`;
      this.logger.error(errorMessage, error);
      return { success: false, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }

  /**
   * Deletes multiple documents
   */
  public async deleteMany<T extends Document = Document>(
    collectionName: string, 
    query: MongoQuery<T>
  ): Promise<OperationResult<DeleteResult>> {
    try {
      if (!this.isConnected()) {
        throw new Error('Not connected to MongoDB');
      }

      const collection = this.getCollection<T>(collectionName);
      const result = await collection.deleteMany(query);
      
      const deleteResult: DeleteResult = {
        acknowledged: result.acknowledged,
        deletedCount: result.deletedCount
      };

      this.logger.debug(`Documents deleted from ${collectionName}:`, deleteResult);
      return { success: true, data: deleteResult };
    } catch (error) {
      const errorMessage = `Error deleting documents from ${collectionName}`;
      this.logger.error(errorMessage, error);
      return { success: false, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }

  /**
   * Counts documents in a collection
   */
  public async countDocuments<T extends Document = Document>(
    collectionName: string, 
    query: MongoQuery<T> = {}
  ): Promise<OperationResult<number>> {
    try {
      if (!this.isConnected()) {
        throw new Error('Not connected to MongoDB');
      }

      const collection = this.getCollection<T>(collectionName);
      const count = await collection.countDocuments(query);
      
      this.logger.debug(`Counted ${count} documents in ${collectionName}`);
      return { success: true, data: count };
    } catch (error) {
      const errorMessage = `Error counting documents in ${collectionName}`;
      this.logger.error(errorMessage, error);
      return { success: false, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }

  /**
   * Creates an index on a collection
   */
  public async createIndex(
    collectionName: string,
    indexSpec: Record<string, 1 | -1>,
    options: { unique?: boolean; background?: boolean; name?: string } = {}
  ): Promise<OperationResult<string>> {
    try {
      if (!this.isConnected()) {
        throw new Error('Not connected to MongoDB');
      }

      const collection = this.getCollection(collectionName);
      const indexName = await collection.createIndex(indexSpec, options);
      
      this.logger.debug(`Index created on ${collectionName}:`, indexName);
      return { success: true, data: indexName };
    } catch (error) {
      const errorMessage = `Error creating index on ${collectionName}`;
      this.logger.error(errorMessage, error);
      return { success: false, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }

  // Legacy methods for backward compatibility
  public async addDocument(collectionName: string, data: Record<string, any>): Promise<void> {
    const result = await this.insertOne(collectionName, data);
    if (!result.success) {
      throw result.error || new Error('Failed to insert document');
    }
  }

  public async getDocuments(collectionName: string, query: Record<string, any> = {}): Promise<Record<string, any>[]> {
    const result = await this.find(collectionName, query);
    if (!result.success) {
      throw result.error || new Error('Failed to find documents');
    }
    return result.data || [];
  }

  public async deleteDocument(collectionName: string, query: Record<string, any>): Promise<void> {
    const result = await this.deleteOne(collectionName, query);
    if (!result.success) {
      throw result.error || new Error('Failed to delete document');
    }
  }

  public async updateDocument(collectionName: string, query: Record<string, any>, update: Record<string, any>): Promise<void> {
    const result = await this.updateOne(collectionName, query, { $set: update });
    if (!result.success) {
      throw result.error || new Error('Failed to update document');
    }
  }
}

export default MongoDB;

