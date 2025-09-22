import DB from '../index';
import { DBOptions } from '../types';

// Mock MongoDB and Firebase to avoid requiring actual database connections
jest.mock('mongodb');
jest.mock('firebase-admin');

describe('DB Class', () => {
  let db: DB;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create DB instance with MongoDB only', () => {
      const options: DBOptions = {
        mongodb: {
          uri: 'mongodb://localhost:27017',
          dbName: 'test'
        }
      };

      db = new DB(options);
      expect(db.mongo).toBeDefined();
      expect(db.firebase).toBeUndefined();
    });

    it('should create DB instance with Firebase only', () => {
      const options: DBOptions = {
        firebase: {
          serviceAccount: {
            projectId: 'test-project',
            privateKey: 'test-key',
            clientEmail: 'test@test.com'
          }
        }
      };

      // Mock Firebase admin initialization
      const mockFirebaseAdmin = require('firebase-admin');
      mockFirebaseAdmin.apps = [];
      mockFirebaseAdmin.initializeApp = jest.fn();
      mockFirebaseAdmin.credential = {
        cert: jest.fn()
      };
      mockFirebaseAdmin.firestore = jest.fn(() => ({
        doc: jest.fn(),
        collection: jest.fn()
      }));

      db = new DB(options);
      expect(db.firebase).toBeDefined();
      expect(db.mongo).toBeUndefined();
    });

    it('should create DB instance with both databases', () => {
      const options: DBOptions = {
        mongodb: {
          uri: 'mongodb://localhost:27017',
          dbName: 'test'
        },
        firebase: {
          serviceAccount: {
            projectId: 'test-project',
            privateKey: 'test-key',
            clientEmail: 'test@test.com'
          }
        }
      };

      // Mock Firebase admin initialization
      const mockFirebaseAdmin = require('firebase-admin');
      mockFirebaseAdmin.apps = [];
      mockFirebaseAdmin.initializeApp = jest.fn();
      mockFirebaseAdmin.credential = {
        cert: jest.fn()
      };
      mockFirebaseAdmin.firestore = jest.fn(() => ({
        doc: jest.fn(),
        collection: jest.fn()
      }));

      db = new DB(options);
      expect(db.mongo).toBeDefined();
      expect(db.firebase).toBeDefined();
    });

    it('should throw error when no database configuration provided', () => {
      expect(() => {
        new DB({});
      }).toThrow('At least one database configuration (mongodb or firebase) must be provided');
    });
  });

  describe('Connection Management', () => {
    beforeEach(() => {
      const options: DBOptions = {
        mongodb: {
          uri: 'mongodb://localhost:27017',
          dbName: 'test'
        }
      };
      db = new DB(options);
    });

    it('should provide connection status', () => {
      const status = db.getConnectionStatus();
      expect(status).toHaveProperty('mongodb');
      expect(typeof status.mongodb).toBe('string');
    });

    it('should check if connected', () => {
      const isConnected = db.isConnected();
      expect(typeof isConnected).toBe('boolean');
    });

    it('should provide health status', async () => {
      const health = await db.getHealthStatus();
      expect(health.success).toBe(true);
      expect(health.data).toHaveProperty('overall');
      expect(health.data).toHaveProperty('mongodb');
    });
  });

  describe('Custom Logger', () => {
    it('should use custom logger when provided', () => {
      const mockLogger = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
      };

      const options: DBOptions = {
        mongodb: {
          uri: 'mongodb://localhost:27017',
          dbName: 'test'
        },
        logger: mockLogger
      };

      db = new DB(options);
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });
});