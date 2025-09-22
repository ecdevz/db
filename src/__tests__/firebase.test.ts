import Firebase from '../firebase';
import { FirebaseOptions, ConnectionStatus } from '../types';

// Mock Firebase Admin
jest.mock('firebase-admin');

describe('Firebase Class', () => {
  let firebase: Firebase;
  let mockFirestore: any;
  let mockDoc: any;
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    mockDoc = {
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      onSnapshot: jest.fn(),
      id: 'test-doc-id',
      data: jest.fn()
    };

    mockCollection = {
      add: jest.fn(),
      doc: jest.fn(() => mockDoc),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      startAfter: jest.fn().mockReturnThis(),
      get: jest.fn(),
      onSnapshot: jest.fn()
    };

    mockFirestore = {
      doc: jest.fn(() => mockDoc),
      collection: jest.fn(() => mockCollection),
      batch: jest.fn(() => ({
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        commit: jest.fn()
      })),
      runTransaction: jest.fn()
    };

    const mockAdmin = require('firebase-admin');
    mockAdmin.apps = [];
    mockAdmin.initializeApp = jest.fn();
    mockAdmin.credential = {
      cert: jest.fn()
    };
    mockAdmin.firestore = jest.fn(() => mockFirestore);

    const options: FirebaseOptions = {
      serviceAccount: {
        projectId: 'test-project',
        privateKey: 'test-key',
        clientEmail: 'test@test.com'
      }
    };

    firebase = new Firebase(options);
  });

  describe('Constructor', () => {
    it('should create Firebase instance successfully', () => {
      expect(firebase).toBeDefined();
      expect(firebase.firestore).toBeDefined();
      expect(firebase.getConnectionStatus()).toBe(ConnectionStatus.CONNECTED);
    });

    it('should create Firebase instance with custom logger', () => {
      const mockLogger = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
      };

      const options: FirebaseOptions = {
        serviceAccount: {
          projectId: 'test-project',
          privateKey: 'test-key',
          clientEmail: 'test@test.com'
        }
      };

      const mockAdmin = require('firebase-admin');
      mockAdmin.apps = [];

      const firebaseWithLogger = new Firebase(options, mockLogger);
      expect(firebaseWithLogger).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('Document Operations', () => {
    it('should get document successfully', async () => {
      const mockSnapshot = {
        exists: true,
        id: 'test-id',
        data: jest.fn(() => ({ name: 'John', age: 30 }))
      };
      mockDoc.get.mockResolvedValue(mockSnapshot);

      const result = await firebase.getDocument('users/john');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 'test-id', name: 'John', age: 30 });
    });

    it('should return null for non-existent document', async () => {
      const mockSnapshot = {
        exists: false
      };
      mockDoc.get.mockResolvedValue(mockSnapshot);

      const result = await firebase.getDocument('users/nonexistent');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should set document successfully', async () => {
      mockDoc.set.mockResolvedValue(undefined);

      const result = await firebase.setDocument('users/john', { name: 'John', age: 30 });

      expect(result.success).toBe(true);
      expect(mockDoc.set).toHaveBeenCalledWith({ name: 'John', age: 30 }, { merge: true });
    });

    it('should update document successfully', async () => {
      mockDoc.update.mockResolvedValue(undefined);

      const result = await firebase.updateDocument('users/john', { age: 31 });

      expect(result.success).toBe(true);
      expect(mockDoc.update).toHaveBeenCalledWith({ age: 31 });
    });

    it('should delete document successfully', async () => {
      mockDoc.delete.mockResolvedValue(undefined);

      const result = await firebase.deleteDocument('users/john');

      expect(result.success).toBe(true);
      expect(mockDoc.delete).toHaveBeenCalled();
    });

    it('should add document successfully', async () => {
      const mockDocRef = { id: 'auto-generated-id' };
      mockCollection.add.mockResolvedValue(mockDocRef);

      const result = await firebase.addDocument('users', { name: 'Jane', age: 25 });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('auto-generated-id');
      expect(mockCollection.add).toHaveBeenCalledWith({ name: 'Jane', age: 25 });
    });
  });

  describe('Collection Operations', () => {
    it('should get collection successfully', async () => {
      const mockSnapshot = {
        docs: [
          { id: 'doc1', data: () => ({ name: 'John' }) },
          { id: 'doc2', data: () => ({ name: 'Jane' }) }
        ]
      };
      mockCollection.get.mockResolvedValue(mockSnapshot);

      const result = await firebase.getCollection('users');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0]).toEqual({ id: 'doc1', name: 'John' });
    });

    it('should get collection with query options', async () => {
      const mockSnapshot = {
        docs: [
          { id: 'doc1', data: () => ({ name: 'John', age: 30 }) }
        ]
      };
      mockCollection.get.mockResolvedValue(mockSnapshot);

      const result = await firebase.getCollection('users', {
        where: [{ field: 'age', operator: '>=', value: 18 }],
        orderBy: { field: 'name', direction: 'asc' },
        limit: 10
      });

      expect(result.success).toBe(true);
      expect(mockCollection.where).toHaveBeenCalledWith('age', '>=', 18);
      expect(mockCollection.orderBy).toHaveBeenCalledWith('name', 'asc');
      expect(mockCollection.limit).toHaveBeenCalledWith(10);
    });
  });

  describe('Real-time Listeners', () => {
    it('should set up document listener', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      mockDoc.onSnapshot.mockReturnValue(mockUnsubscribe);

      const unsubscribe = firebase.listenDocument('users/john', mockCallback);

      expect(mockDoc.onSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should set up collection listener', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      mockCollection.onSnapshot.mockReturnValue(mockUnsubscribe);

      const unsubscribe = firebase.listenCollection('users', mockCallback);

      expect(mockCollection.onSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('Batch Operations', () => {
    it('should perform batch write successfully', async () => {
      const mockBatch = {
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      };
      mockFirestore.batch.mockReturnValue(mockBatch);

      const operations = [
        { type: 'set' as const, path: 'users/user1', data: { name: 'User 1' } },
        { type: 'update' as const, path: 'users/user2', data: { age: 30 } },
        { type: 'delete' as const, path: 'users/user3' }
      ];

      const result = await firebase.batchWrite(operations);

      expect(result.success).toBe(true);
      expect(mockBatch.set).toHaveBeenCalled();
      expect(mockBatch.update).toHaveBeenCalled();
      expect(mockBatch.delete).toHaveBeenCalled();
      expect(mockBatch.commit).toHaveBeenCalled();
    });
  });

  describe('Transactions', () => {
    it('should run transaction successfully', async () => {
      const mockTransaction = {};
      const mockUpdateFunction = jest.fn().mockResolvedValue('transaction result');
      mockFirestore.runTransaction.mockImplementation((fn: any) => fn(mockTransaction));

      const result = await firebase.runTransaction(mockUpdateFunction);

      expect(result.success).toBe(true);
      expect(mockUpdateFunction).toHaveBeenCalledWith(mockTransaction);
    });
  });

  describe('Error Handling', () => {
    it('should handle document operation errors', async () => {
      const error = new Error('Firestore error');
      mockDoc.get.mockRejectedValue(error);

      const result = await firebase.getDocument('users/john');

      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
    });

    it('should handle collection operation errors', async () => {
      const error = new Error('Collection error');
      mockCollection.get.mockRejectedValue(error);

      const result = await firebase.getCollection('users');

      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
    });
  });

  describe('Connection State', () => {
    it('should check connection status', () => {
      const status = firebase.getConnectionStatus();
      expect(status).toBe(ConnectionStatus.CONNECTED);
    });

    it('should check if connected', () => {
      const isConnected = firebase.isConnected();
      expect(isConnected).toBe(true);
    });
  });
});