import admin from 'firebase-admin';
import { 
  FirebaseOptions, 
  Logger, 
  Document, 
  OperationResult, 
  ConnectionStatus,
  ListenerCallback,
  UnsubscribeFunction 
} from '../types';

/**
 * Firebase Firestore wrapper class with enhanced functionality
 */
class Firebase {
  public firestore: admin.firestore.Firestore;
  private logger: Logger;
  private connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private isInitialized = false;

  constructor(options: FirebaseOptions, logger?: Logger) {
    this.logger = logger || this.createDefaultLogger();
    
    try {
      // Check if Firebase Admin SDK is already initialized
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(options.serviceAccount),
          databaseURL: options.databaseURL,
          storageBucket: options.storageBucket,
        });
      }
      
      this.firestore = admin.firestore();
      this.connectionStatus = ConnectionStatus.CONNECTED;
      this.isInitialized = true;
      this.logger.info('Firebase initialized successfully');
    } catch (error) {
      this.connectionStatus = ConnectionStatus.ERROR;
      this.logger.error('Failed to initialize Firebase:', error);
      throw error;
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
   * Gets the connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Checks if Firebase is connected and initialized
   */
  public isConnected(): boolean {
    return this.connectionStatus === ConnectionStatus.CONNECTED && this.isInitialized;
  }

  /**
   * Gets a document from Firestore
   */
  public async getDocument<T extends Document = Document>(
    documentPath: string
  ): Promise<OperationResult<T | null>> {
    try {
      if (!this.isConnected()) {
        throw new Error('Firebase not initialized');
      }

      const documentRef = this.firestore.doc(documentPath);
      const snapshot = await documentRef.get();
      
      if (snapshot.exists) {
        const data = { id: snapshot.id, ...snapshot.data() } as unknown as T;
        this.logger.debug(`Document retrieved from ${documentPath}`);
        return { success: true, data };
      } else {
        this.logger.debug(`Document not found at ${documentPath}`);
        return { success: true, data: null };
      }
    } catch (error) {
      const errorMessage = `Error getting document ${documentPath}`;
      this.logger.error(errorMessage, error);
      return { success: false, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }

  /**
   * Sets (creates or updates) a document in Firestore
   */
  public async setDocument<T extends Document = Document>(
    documentPath: string, 
    data: Omit<T, 'id'>,
    options: { merge?: boolean } = { merge: true }
  ): Promise<OperationResult<void>> {
    try {
      if (!this.isConnected()) {
        throw new Error('Firebase not initialized');
      }

      const documentRef = this.firestore.doc(documentPath);
      await documentRef.set(data, options);
      
      this.logger.debug(`Document set at ${documentPath}`, { merge: options.merge });
      return { success: true, message: 'Document set successfully' };
    } catch (error) {
      const errorMessage = `Error setting document ${documentPath}`;
      this.logger.error(errorMessage, error);
      return { success: false, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }

  /**
   * Updates a document in Firestore
   */
  public async updateDocument<T extends Document = Document>(
    documentPath: string, 
    data: Partial<Omit<T, 'id'>>
  ): Promise<OperationResult<void>> {
    try {
      if (!this.isConnected()) {
        throw new Error('Firebase not initialized');
      }

      const documentRef = this.firestore.doc(documentPath);
      await documentRef.update(data);
      
      this.logger.debug(`Document updated at ${documentPath}`);
      return { success: true, message: 'Document updated successfully' };
    } catch (error) {
      const errorMessage = `Error updating document ${documentPath}`;
      this.logger.error(errorMessage, error);
      return { success: false, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }

  /**
   * Deletes a document from Firestore
   */
  public async deleteDocument(documentPath: string): Promise<OperationResult<void>> {
    try {
      if (!this.isConnected()) {
        throw new Error('Firebase not initialized');
      }

      const documentRef = this.firestore.doc(documentPath);
      await documentRef.delete();
      
      this.logger.debug(`Document deleted from ${documentPath}`);
      return { success: true, message: 'Document deleted successfully' };
    } catch (error) {
      const errorMessage = `Error deleting document ${documentPath}`;
      this.logger.error(errorMessage, error);
      return { success: false, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }

  /**
   * Adds a document to a collection with auto-generated ID
   */
  public async addDocument<T extends Document = Document>(
    collectionPath: string, 
    data: Omit<T, 'id'>
  ): Promise<OperationResult<{ id: string }>> {
    try {
      if (!this.isConnected()) {
        throw new Error('Firebase not initialized');
      }

      const collectionRef = this.firestore.collection(collectionPath);
      const docRef = await collectionRef.add(data);
      
      this.logger.debug(`Document added to ${collectionPath} with ID: ${docRef.id}`);
      return { success: true, data: { id: docRef.id } };
    } catch (error) {
      const errorMessage = `Error adding document to ${collectionPath}`;
      this.logger.error(errorMessage, error);
      return { success: false, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }

  /**
   * Gets documents from a collection with optional query
   */
  public async getCollection<T extends Document = Document>(
    collectionPath: string,
    options: {
      where?: { field: string; operator: admin.firestore.WhereFilterOp; value: any }[];
      orderBy?: { field: string; direction?: 'asc' | 'desc' };
      limit?: number;
      startAfter?: admin.firestore.DocumentSnapshot;
    } = {}
  ): Promise<OperationResult<T[]>> {
    try {
      if (!this.isConnected()) {
        throw new Error('Firebase not initialized');
      }

      let query: admin.firestore.Query = this.firestore.collection(collectionPath);

      // Apply where conditions
      if (options.where) {
        for (const condition of options.where) {
          query = query.where(condition.field, condition.operator, condition.value);
        }
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.orderBy(options.orderBy.field, options.orderBy.direction || 'asc');
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      // Apply pagination
      if (options.startAfter) {
        query = query.startAfter(options.startAfter);
      }

      const snapshot = await query.get();
      const documents: T[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as unknown as T));

      this.logger.debug(`Retrieved ${documents.length} documents from ${collectionPath}`);
      return { success: true, data: documents };
    } catch (error) {
      const errorMessage = `Error getting collection ${collectionPath}`;
      this.logger.error(errorMessage, error);
      return { success: false, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }

  /**
   * Listens to changes in a collection
   */
  public listenCollection<T extends Document = Document>(
    collectionPath: string, 
    callback: ListenerCallback<{ added: T[]; modified: T[]; removed: T[] }>,
    options: {
      where?: { field: string; operator: admin.firestore.WhereFilterOp; value: any }[];
      orderBy?: { field: string; direction?: 'asc' | 'desc' };
      limit?: number;
    } = {}
  ): UnsubscribeFunction {
    try {
      if (!this.isConnected()) {
        throw new Error('Firebase not initialized');
      }

      let query: admin.firestore.Query = this.firestore.collection(collectionPath);

      // Apply where conditions
      if (options.where) {
        for (const condition of options.where) {
          query = query.where(condition.field, condition.operator, condition.value);
        }
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.orderBy(options.orderBy.field, options.orderBy.direction || 'asc');
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const unsubscribe = query.onSnapshot(
        (snapshot) => {
          const added: T[] = [];
          const modified: T[] = [];
          const removed: T[] = [];

          snapshot.docChanges().forEach((change) => {
            const doc = { id: change.doc.id, ...change.doc.data() } as unknown as T;
            
            switch (change.type) {
              case 'added':
                added.push(doc);
                break;
              case 'modified':
                modified.push(doc);
                break;
              case 'removed':
                removed.push(doc);
                break;
            }
          });

          callback({ added, modified, removed });
        },
        (error) => {
          this.logger.error(`Error listening to collection ${collectionPath}:`, error);
        }
      );

      this.logger.debug(`Started listening to collection ${collectionPath}`);
      return unsubscribe;
    } catch (error) {
      this.logger.error(`Error setting up listener for collection ${collectionPath}:`, error);
      return () => {}; // Return empty unsubscribe function
    }
  }

  /**
   * Listens to changes in a document
   */
  public listenDocument<T extends Document = Document>(
    documentPath: string, 
    callback: ListenerCallback<T | null>
  ): UnsubscribeFunction {
    try {
      if (!this.isConnected()) {
        throw new Error('Firebase not initialized');
      }

      const documentRef = this.firestore.doc(documentPath);
      const unsubscribe = documentRef.onSnapshot(
        (snapshot) => {
          if (snapshot.exists) {
            const data = { id: snapshot.id, ...snapshot.data() } as unknown as T;
            callback(data);
          } else {
            callback(null);
          }
        },
        (error) => {
          this.logger.error(`Error listening to document ${documentPath}:`, error);
        }
      );

      this.logger.debug(`Started listening to document ${documentPath}`);
      return unsubscribe;
    } catch (error) {
      this.logger.error(`Error setting up listener for document ${documentPath}:`, error);
      return () => {}; // Return empty unsubscribe function
    }
  }

  /**
   * Performs a batch write operation
   */
  public async batchWrite(
    operations: Array<{
      type: 'set' | 'update' | 'delete';
      path: string;
      data?: any;
      options?: { merge?: boolean };
    }>
  ): Promise<OperationResult<void>> {
    try {
      if (!this.isConnected()) {
        throw new Error('Firebase not initialized');
      }

      const batch = this.firestore.batch();

      for (const operation of operations) {
        const docRef = this.firestore.doc(operation.path);
        
        switch (operation.type) {
          case 'set':
            batch.set(docRef, operation.data, operation.options || {});
            break;
          case 'update':
            batch.update(docRef, operation.data);
            break;
          case 'delete':
            batch.delete(docRef);
            break;
        }
      }

      await batch.commit();
      
      this.logger.debug(`Batch write completed with ${operations.length} operations`);
      return { success: true, message: 'Batch write completed successfully' };
    } catch (error) {
      const errorMessage = 'Error performing batch write';
      this.logger.error(errorMessage, error);
      return { success: false, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }

  /**
   * Runs a transaction
   */
  public async runTransaction<T>(
    updateFunction: (transaction: admin.firestore.Transaction) => Promise<T>
  ): Promise<OperationResult<T>> {
    try {
      if (!this.isConnected()) {
        throw new Error('Firebase not initialized');
      }

      const result = await this.firestore.runTransaction(updateFunction);
      
      this.logger.debug('Transaction completed successfully');
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = 'Error running transaction';
      this.logger.error(errorMessage, error);
      return { success: false, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }
}

export default Firebase;