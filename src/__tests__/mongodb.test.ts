import MongoDB from '../mongo';
import { MongoDBOptions, ConnectionStatus } from '../types';

// Mock the MongoDB driver
jest.mock('mongodb');

describe('MongoDB Class', () => {
  let mongodb: MongoDB;
  let mockClient: any;
  let mockDb: any;
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    mockCollection = {
      insertOne: jest.fn(),
      insertMany: jest.fn(),
      find: jest.fn(() => ({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn()
      })),
      findOne: jest.fn(),
      updateOne: jest.fn(),
      updateMany: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
      countDocuments: jest.fn(),
      createIndex: jest.fn()
    };

    mockDb = {
      collection: jest.fn(() => mockCollection)
    };

    mockClient = {
      connect: jest.fn(),
      close: jest.fn(),
      db: jest.fn(() => mockDb),
      on: jest.fn()
    };

    const { MongoClient } = require('mongodb');
    MongoClient.mockImplementation(() => mockClient);

    const options: MongoDBOptions = {
      uri: 'mongodb://localhost:27017',
      dbName: 'test'
    };

    mongodb = new MongoDB(options);
  });

  describe('Constructor', () => {
    it('should create MongoDB instance with default logger', () => {
      expect(mongodb).toBeDefined();
      expect(mongodb.getConnectionStatus()).toBe(ConnectionStatus.DISCONNECTED);
    });

    it('should create MongoDB instance with custom logger', () => {
      const mockLogger = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
      };

      const options: MongoDBOptions = {
        uri: 'mongodb://localhost:27017',
        dbName: 'test'
      };

      const mongoWithLogger = new MongoDB(options, mockLogger);
      expect(mongoWithLogger).toBeDefined();
    });
  });

  describe('Connection Management', () => {
    it('should connect successfully', async () => {
      mockClient.connect.mockResolvedValue(undefined);
      
      const result = await mongodb.connect();
      
      expect(result.success).toBe(true);
      expect(mockClient.connect).toHaveBeenCalled();
    });

    it('should handle connection error', async () => {
      const error = new Error('Connection failed');
      mockClient.connect.mockRejectedValue(error);
      
      const result = await mongodb.connect();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
    });

    it('should disconnect successfully', async () => {
      mockClient.close.mockResolvedValue(undefined);
      
      const result = await mongodb.disconnect();
      
      expect(result.success).toBe(true);
      expect(mockClient.close).toHaveBeenCalled();
    });

    it('should handle disconnect error', async () => {
      const error = new Error('Disconnect failed');
      mockClient.close.mockRejectedValue(error);
      
      const result = await mongodb.disconnect();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
    });
  });

  describe('CRUD Operations', () => {
    beforeEach(async () => {
      mockClient.connect.mockResolvedValue(undefined);
      await mongodb.connect();
    });

    describe('Insert Operations', () => {
      it('should insert one document successfully', async () => {
        const mockResult = {
          insertedId: 'test-id',
          acknowledged: true
        };
        mockCollection.insertOne.mockResolvedValue(mockResult);

        const result = await mongodb.insertOne('users', { name: 'John' });

        expect(result.success).toBe(true);
        expect(result.data?.insertedId).toBe('test-id');
        expect(mockCollection.insertOne).toHaveBeenCalledWith({ name: 'John' });
      });

      it('should insert many documents successfully', async () => {
        const mockResult = {
          insertedIds: { 0: 'id1', 1: 'id2' },
          insertedCount: 2
        };
        mockCollection.insertMany.mockResolvedValue(mockResult);

        const result = await mongodb.insertMany('users', [{ name: 'John' }, { name: 'Jane' }]);

        expect(result.success).toBe(true);
        expect(result.data?.insertedCount).toBe(2);
        expect(mockCollection.insertMany).toHaveBeenCalled();
      });
    });

    describe('Find Operations', () => {
      it('should find documents successfully', async () => {
        const mockDocs = [{ name: 'John' }, { name: 'Jane' }];
        const mockCursor = {
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          toArray: jest.fn().mockResolvedValue(mockDocs)
        };
        mockCollection.find.mockReturnValue(mockCursor);

        const result = await mongodb.find('users', { age: { $gte: 18 } });

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockDocs);
        expect(mockCollection.find).toHaveBeenCalledWith({ age: { $gte: 18 } });
      });

      it('should find one document successfully', async () => {
        const mockDoc = { name: 'John' };
        mockCollection.findOne.mockResolvedValue(mockDoc);

        const result = await mongodb.findOne('users', { name: 'John' });

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockDoc);
        expect(mockCollection.findOne).toHaveBeenCalledWith({ name: 'John' });
      });
    });

    describe('Update Operations', () => {
      it('should update one document successfully', async () => {
        const mockResult = {
          acknowledged: true,
          modifiedCount: 1,
          matchedCount: 1
        };
        mockCollection.updateOne.mockResolvedValue(mockResult);

        const result = await mongodb.updateOne('users', { name: 'John' }, { $set: { age: 30 } });

        expect(result.success).toBe(true);
        expect(result.data?.modifiedCount).toBe(1);
        expect(mockCollection.updateOne).toHaveBeenCalled();
      });
    });

    describe('Delete Operations', () => {
      it('should delete one document successfully', async () => {
        const mockResult = {
          acknowledged: true,
          deletedCount: 1
        };
        mockCollection.deleteOne.mockResolvedValue(mockResult);

        const result = await mongodb.deleteOne('users', { name: 'John' });

        expect(result.success).toBe(true);
        expect(result.data?.deletedCount).toBe(1);
        expect(mockCollection.deleteOne).toHaveBeenCalled();
      });
    });

    describe('Count Operations', () => {
      it('should count documents successfully', async () => {
        mockCollection.countDocuments.mockResolvedValue(5);

        const result = await mongodb.countDocuments('users', { age: { $gte: 18 } });

        expect(result.success).toBe(true);
        expect(result.data).toBe(5);
        expect(mockCollection.countDocuments).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      mockClient.connect.mockResolvedValue(undefined);
      await mongodb.connect();
    });

    it('should handle insert errors', async () => {
      const error = new Error('Insert failed');
      mockCollection.insertOne.mockRejectedValue(error);

      const result = await mongodb.insertOne('users', { name: 'John' });

      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
    });

    it('should handle find errors', async () => {
      const error = new Error('Find failed');
      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockRejectedValue(error)
      };
      mockCollection.find.mockReturnValue(mockCursor);

      const result = await mongodb.find('users');

      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
    });
  });

  describe('Connection State Checks', () => {
    it('should throw error when not connected', async () => {
      const result = await mongodb.insertOne('users', { name: 'John' });
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Not connected to MongoDB');
    });
  });
});