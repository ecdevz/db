import MongoDB from "./mongo";
import Firebase from "./firebase";
import { DBOptions, Logger, ConnectionStatus, OperationResult } from "./types";

/**
 * Unified database class that provides access to both MongoDB and Firebase
 */
class DB {
  public mongo?: MongoDB;
  public firebase?: Firebase;
  private logger: Logger;

  constructor(options: DBOptions) {
    // Validate options
    if (!options.mongodb && !options.firebase) {
      throw new Error('At least one database configuration (mongodb or firebase) must be provided');
    }

    // Set up logger
    this.logger = options.logger || this.createDefaultLogger();

    // Initialize MongoDB if configuration provided
    if (options.mongodb) {
      try {
        this.mongo = new MongoDB(options.mongodb, this.logger);
        this.logger.info('MongoDB instance created successfully');
      } catch (error) {
        this.logger.error('Failed to create MongoDB instance:', error);
        throw error;
      }
    }

    // Initialize Firebase if configuration provided
    if (options.firebase) {
      try {
        this.firebase = new Firebase(options.firebase, this.logger);
        this.logger.info('Firebase instance created successfully');
      } catch (error) {
        this.logger.error('Failed to create Firebase instance:', error);
        throw error;
      }
    }
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
   * Connects to all configured databases
   */
  public async connect(): Promise<OperationResult<{ mongodb?: boolean; firebase?: boolean }>> {
    const results: { mongodb?: boolean; firebase?: boolean } = {};
    const errors: string[] = [];

    // Connect to MongoDB if available
    if (this.mongo) {
      try {
        const mongoResult = await this.mongo.connect();
        results.mongodb = mongoResult.success;
        if (!mongoResult.success) {
          errors.push(`MongoDB: ${mongoResult.error?.message || 'Connection failed'}`);
        }
      } catch (error) {
        results.mongodb = false;
        errors.push(`MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Firebase connection is handled during initialization
    if (this.firebase) {
      results.firebase = this.firebase.isConnected();
      if (!results.firebase) {
        errors.push('Firebase: Connection failed during initialization');
      }
    }

    const allConnected = Object.values(results).every(status => status === true);
    
    if (allConnected) {
      this.logger.info('All databases connected successfully');
      return { success: true, data: results };
    } else {
      const errorMessage = `Some databases failed to connect: ${errors.join(', ')}`;
      this.logger.error(errorMessage);
      return { success: false, error: new Error(errorMessage), data: results };
    }
  }

  /**
   * Disconnects from all databases
   */
  public async disconnect(): Promise<OperationResult<{ mongodb?: boolean; firebase?: boolean }>> {
    const results: { mongodb?: boolean; firebase?: boolean } = {};
    const errors: string[] = [];

    // Disconnect from MongoDB if available
    if (this.mongo) {
      try {
        const mongoResult = await this.mongo.disconnect();
        results.mongodb = mongoResult.success;
        if (!mongoResult.success) {
          errors.push(`MongoDB: ${mongoResult.error?.message || 'Disconnection failed'}`);
        }
      } catch (error) {
        results.mongodb = false;
        errors.push(`MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Firebase doesn't require explicit disconnection
    if (this.firebase) {
      results.firebase = true; // Firebase admin SDK handles cleanup automatically
    }

    const allDisconnected = Object.values(results).every(status => status === true);
    
    if (allDisconnected) {
      this.logger.info('All databases disconnected successfully');
      return { success: true, data: results };
    } else {
      const errorMessage = `Some databases failed to disconnect: ${errors.join(', ')}`;
      this.logger.error(errorMessage);
      return { success: false, error: new Error(errorMessage), data: results };
    }
  }

  /**
   * Gets the connection status of all databases
   */
  public getConnectionStatus(): { mongodb?: ConnectionStatus; firebase?: ConnectionStatus } {
    return {
      mongodb: this.mongo?.getConnectionStatus(),
      firebase: this.firebase?.getConnectionStatus()
    };
  }

  /**
   * Checks if all configured databases are connected
   */
  public isConnected(): boolean {
    const mongoConnected = this.mongo ? this.mongo.isConnected() : true;
    const firebaseConnected = this.firebase ? this.firebase.isConnected() : true;
    return mongoConnected && firebaseConnected;
  }

  /**
   * Gets health status of all databases
   */
  public async getHealthStatus(): Promise<OperationResult<{
    mongodb?: { connected: boolean; status: ConnectionStatus };
    firebase?: { connected: boolean; status: ConnectionStatus };
    overall: boolean;
  }>> {
    try {
      const health = {
        mongodb: this.mongo ? {
          connected: this.mongo.isConnected(),
          status: this.mongo.getConnectionStatus()
        } : undefined,
        firebase: this.firebase ? {
          connected: this.firebase.isConnected(),
          status: this.firebase.getConnectionStatus()
        } : undefined,
        overall: this.isConnected()
      };

      this.logger.debug('Health status checked', health);
      return { success: true, data: health };
    } catch (error) {
      const errorMessage = 'Error checking health status';
      this.logger.error(errorMessage, error);
      return { success: false, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }
}

export default DB;
export * from './types';
export { MongoDB, Firebase };
